'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SpineModelProps {
  postureState: 'GOOD' | 'BAD';
}

const UP_VECTOR = new THREE.Vector3(0, 1, 0);

// Deterministic Fibonacci Sphere point cloud for AI scanning grid (Zero impure Math.random)
function createScanPointCloudGeometry() {
  const count = 48;
  const positions = new Float32Array(count * 3);
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < count; i++) {
    const theta = (2 * Math.PI * i) / goldenRatio;
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const r = 0.42 + (i % 6) * 0.03;
    positions[i * 3] = radiusAtY * Math.cos(theta) * r;
    positions[i * 3 + 1] = y * r;
    positions[i * 3 + 2] = radiusAtY * Math.sin(theta) * r;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geo;
}

const SCAN_PARTICLE_GEO = createScanPointCloudGeometry();

export function SpineModel({ postureState }: SpineModelProps) {
  // Groups and mesh references
  const vertebraeRefs = useRef<(THREE.Group | null)[]>([]);
  const headGroupRef = useRef<THREE.Group>(null);
  const laserBeamRef = useRef<THREE.Mesh>(null);
  const laserGlowRef = useRef<THREE.Mesh>(null);
  const laserMidGroupRef = useRef<THREE.Group>(null);
  const reticleRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Reusable vectors for zero garbage collection
  const vEye = useMemo(() => new THREE.Vector3(), []);
  const vHit = useMemo(() => new THREE.Vector3(), []);
  const vDir = useMemo(() => new THREE.Vector3(), []);
  const vMid = useMemo(() => new THREE.Vector3(), []);
  const vRot = useMemo(() => new THREE.Quaternion(), []);

  // Dynamic colors
  const goodColor = useMemo(() => new THREE.Color('#00f0ff'), []);
  const badColor = useMemo(() => new THREE.Color('#ff2a5f'), []);
  const currentColor = useMemo(() => new THREE.Color('#00f0ff'), []);

  // Shared Materials for high performance
  const holoMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#00f0ff',
        roughness: 0.15,
        metalness: 0.9,
        transparent: true,
        opacity: 0.45,
        emissive: '#00b4d8',
        emissiveIntensity: 0.5,
      }),
    []
  );

  const wireMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#38bdf8',
        wireframe: true,
        transparent: true,
        opacity: 0.75,
      }),
    []
  );

  const laserMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#00f0ff',
        transparent: true,
        opacity: 0.9,
      }),
    []
  );

  const laserGlowMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#00f0ff',
        transparent: true,
        opacity: 0.25,
      }),
    []
  );

  // Animation interpolation progress (0 = GOOD, 1 = BAD)
  const animProgress = useRef(0);

  // Base torso anchor position
  const torsoBaseX = 0.75;
  const torsoBaseY = -0.65;
  const vertebraSpacing = 0.082;

  useFrame((state, delta) => {
    const target = postureState === 'GOOD' ? 0 : 1;
    // Smooth lerp / damp with 60FPS fluid physics
    animProgress.current = THREE.MathUtils.damp(animProgress.current, target, 5.5, delta);
    const p = animProgress.current;

    // Color transition
    currentColor.lerpColors(goodColor, badColor, p);
    holoMaterial.color.copy(currentColor);
    holoMaterial.emissive.copy(currentColor);
    wireMaterial.color.copy(currentColor);
    laserMaterial.color.copy(currentColor);
    laserGlowMaterial.color.copy(currentColor);

    // Spine kinematics: 7 cervical vertebrae (C7 at index 0 to C1 at index 6)
    // Good posture: gentle lordosis curve (~10-12 deg)
    // Bad posture: severe forward head bend (~36-38 deg)
    const baseAngle = THREE.MathUtils.lerp(0.04, 0.48, p);
    let accumX = torsoBaseX;
    let accumY = torsoBaseY + 0.12;

    for (let i = 0; i < 7; i++) {
      const vGroup = vertebraeRefs.current[i];
      if (vGroup) {
        const factor = Math.pow((i + 1) / 7, 1.15);
        const segmentAngle = baseAngle * factor;
        accumX -= Math.sin(segmentAngle) * vertebraSpacing;
        accumY += Math.cos(segmentAngle) * vertebraSpacing;

        vGroup.position.set(accumX, accumY, 0);
        vGroup.rotation.z = -segmentAngle;
      }
    }

    // Head kinematics anchored atop C1 vertebra
    const headRotZ = -(baseAngle + THREE.MathUtils.lerp(0.06, 0.22, p));
    if (headGroupRef.current) {
      const headDist = 0.22;
      const headCenterX = accumX - Math.sin(-headRotZ) * headDist;
      const headCenterY = accumY + Math.cos(-headRotZ) * headDist;
      headGroupRef.current.position.set(headCenterX, headCenterY, 0);
      headGroupRef.current.rotation.z = headRotZ;

      // Calculate eye position in world space
      vEye.set(headCenterX - Math.cos(-headRotZ) * 0.28, headCenterY - Math.sin(-headRotZ) * 0.28 + 0.04, 0);
    }

    // Monitor Screen Hit point:
    // Good posture: upper 1/3 of screen (~y: 0.52)
    // Bad posture: dips down to bottom edge (~y: 0.08)
    const screenX = -1.6;
    const hitY = THREE.MathUtils.lerp(0.52, 0.08, p);
    vHit.set(screenX, hitY, 0);

    // Laser Raycast Beam alignment
    if (laserBeamRef.current && laserGlowRef.current) {
      vDir.subVectors(vHit, vEye);
      const beamLength = vDir.length();
      vMid.addVectors(vEye, vHit).multiplyScalar(0.5);

      laserBeamRef.current.position.copy(vMid);
      laserBeamRef.current.scale.set(1, beamLength, 1);
      vRot.setFromUnitVectors(UP_VECTOR, vDir.clone().normalize());
      laserBeamRef.current.quaternion.copy(vRot);

      laserGlowRef.current.position.copy(vMid);
      laserGlowRef.current.scale.set(1, beamLength, 1);
      laserGlowRef.current.quaternion.copy(vRot);

      if (laserMidGroupRef.current) {
        laserMidGroupRef.current.position.copy(vMid);
      }
    }

    // Reticle animation on monitor
    if (reticleRef.current) {
      reticleRef.current.position.set(screenX + 0.01, hitY, 0);
      reticleRef.current.rotation.x += delta * 1.5;
    }

    // Subtle AI particle cloud breathing
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.25;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.5) * 0.04;
      particlesRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const isGood = postureState === 'GOOD';

  return (
    <group position={[0.3, 0.1, 0]}>
      {/* 1. Computer Monitor & Ergonomic Desk Reference */}
      <group position={[-1.6, 0.35, 0]}>
        {/* Hologram Monitor Screen Glass */}
        <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.3, 0.8]} />
          <meshStandardMaterial
            color="#0ea5e9"
            transparent
            opacity={0.2}
            roughness={0.2}
            metalness={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Monitor Cyber Wireframe Border */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.04, 0.84, 1.34]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.65} />
        </mesh>

        {/* Monitor Screen Grid Lines */}
        <group position={[0.005, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <gridHelper args={[1.2, 8, '#0284c7', '#0369a1']} rotation={[Math.PI / 2, 0, 0]} />
        </group>

        {/* Articulated Monitor Stand Arm */}
        <mesh position={[-0.15, -0.4, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.7, 8]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[-0.15, -0.75, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.03, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Laser Impact Reticle on Monitor Screen */}
      <group ref={reticleRef} position={[-1.6, 0.52, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <ringGeometry args={[0.04, 0.055, 24]} />
          <meshBasicMaterial color={isGood ? '#00f0ff' : '#ff2a5f'} transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <ringGeometry args={[0.08, 0.09, 24]} />
          <meshBasicMaterial color={isGood ? '#00f0ff' : '#ff2a5f'} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 2. Raycast Laser Beam (Eye -> Monitor) */}
      <mesh ref={laserBeamRef}>
        <cylinderGeometry args={[0.008, 0.008, 1, 8]} />
        <primitive object={laserMaterial} attach="material" />
      </mesh>
      <mesh ref={laserGlowRef}>
        <cylinderGeometry args={[0.028, 0.028, 1, 8]} />
        <primitive object={laserGlowMaterial} attach="material" />
      </mesh>

      {/* 3D Laser Midpoint Energy Pulse Node */}
      <group ref={laserMidGroupRef} position={[-0.5, 0.45, 0]}>
        <mesh>
          <sphereGeometry args={[0.022, 12, 12]} />
          <meshBasicMaterial color={isGood ? '#38bdf8' : '#ff2a5f'} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[0.035, 0.045, 16]} />
          <meshBasicMaterial
            color={isGood ? '#00f0ff' : '#ff2a5f'}
            transparent
            opacity={0.65}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* 3. Torso & Shoulder Reference (Fixed biomechanical base) */}
      <group position={[torsoBaseX, torsoBaseY, 0]}>
        {/* Upper chest wireframe slab */}
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[0.34, 0.22, 0.46]} />
          <primitive object={holoMaterial} attach="material" />
        </mesh>
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[0.342, 0.222, 0.462]} />
          <primitive object={wireMaterial} attach="material" />
        </mesh>

        {/* Biomechanical Shoulder Ring */}
        <mesh position={[-0.02, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.16, 0.16, 0.52, 16]} />
          <primitive object={wireMaterial} attach="material" />
        </mesh>

        {/* Medical Vertical Plumb Line (0° Reference Axis) */}
        <mesh position={[0, 0.62, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 1.24, 6]} />
          <meshBasicMaterial color="#475569" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* 4. Cervical Spine: 7 Vertebrae (C7 -> C1) */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const isC4 = i === 3; // Center cervical joint for visual target marker
        return (
          <group
            key={`vertebra-${i}`}
            ref={(el) => {
              vertebraeRefs.current[i] = el;
            }}
          >
            {/* Vertebral disc & body */}
            <mesh>
              <cylinderGeometry args={[0.082 - i * 0.003, 0.088 - i * 0.003, 0.042, 14]} />
              <primitive object={holoMaterial} attach="material" />
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.084 - i * 0.003, 0.09 - i * 0.003, 0.044, 14]} />
              <primitive object={wireMaterial} attach="material" />
            </mesh>

            {/* Posterior Spinous Process (gai sau đốt sống) */}
            <mesh position={[0.09, 0, 0]}>
              <boxGeometry args={[0.08, 0.032, 0.04]} />
              <primitive object={wireMaterial} attach="material" />
            </mesh>

            {/* Facet joint glow spheres */}
            <mesh position={[0.04, 0, 0.055]}>
              <sphereGeometry args={[0.016, 8, 8]} />
              <meshBasicMaterial color={isGood ? '#38bdf8' : '#f43f5e'} />
            </mesh>
            <mesh position={[0.04, 0, -0.055]}>
              <sphereGeometry args={[0.016, 8, 8]} />
              <meshBasicMaterial color={isGood ? '#38bdf8' : '#f43f5e'} />
            </mesh>

            {/* 3D Visual Target Crosshair Marker at C4 Joint */}
            {isC4 && (
              <group position={[0.02, 0, 0]}>
                <mesh rotation={[0, Math.PI / 2, 0]}>
                  <ringGeometry args={[0.045, 0.058, 20]} />
                  <meshBasicMaterial
                    color={isGood ? '#00f0ff' : '#ff2a5f'}
                    transparent
                    opacity={0.85}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                <mesh rotation={[0, Math.PI / 2, 0]}>
                  <ringGeometry args={[0.08, 0.09, 20]} />
                  <meshBasicMaterial
                    color={isGood ? '#00f0ff' : '#ff2a5f'}
                    transparent
                    opacity={0.4}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </group>
            )}
          </group>
        );
      })}

      {/* 5. Holographic Stylized Head & Face Mesh */}
      <group ref={headGroupRef}>
        {/* Cranium Glass & Wireframe */}
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.26, 18, 14]} />
          <primitive object={holoMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.262, 18, 14]} />
          <primitive object={wireMaterial} attach="material" />
        </mesh>

        {/* Jaw & Chin Facet */}
        <mesh position={[-0.12, -0.06, 0]}>
          <boxGeometry args={[0.18, 0.16, 0.22]} />
          <primitive object={holoMaterial} attach="material" />
        </mesh>
        <mesh position={[-0.12, -0.06, 0]}>
          <boxGeometry args={[0.182, 0.162, 0.222]} />
          <primitive object={wireMaterial} attach="material" />
        </mesh>

        {/* Futuristic AR Eye Visor */}
        <group position={[-0.24, 0.06, 0]}>
          <mesh>
            <boxGeometry args={[0.07, 0.065, 0.26]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive={isGood ? '#00f0ff' : '#ff2a5f'}
              emissiveIntensity={0.8}
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>

          {/* Left and Right Glowing Eye Trackers */}
          <mesh position={[-0.04, 0, 0.065]}>
            <sphereGeometry args={[0.02, 10, 10]} />
            <meshBasicMaterial color={isGood ? '#38bdf8' : '#ff2a5f'} />
          </mesh>
          <mesh position={[-0.04, 0, -0.065]}>
            <sphereGeometry args={[0.02, 10, 10]} />
            <meshBasicMaterial color={isGood ? '#38bdf8' : '#ff2a5f'} />
          </mesh>
        </group>

        {/* AI Depth Face Scan Point Cloud */}
        <points ref={particlesRef} geometry={SCAN_PARTICLE_GEO} position={[-0.1, 0.08, 0]}>
          <pointsMaterial
            color={isGood ? '#00f0ff' : '#ff2a5f'}
            size={0.022}
            transparent
            opacity={0.7}
            sizeAttenuation
          />
        </points>
      </group>

      {/* 6. Ergonomic Grid Floor */}
      <group position={[-0.4, -0.85, 0]}>
        <gridHelper args={[4.5, 18, '#0369a1', '#1e293b']} position={[0, 0, 0]} />
      </group>
    </group>
  );
}
