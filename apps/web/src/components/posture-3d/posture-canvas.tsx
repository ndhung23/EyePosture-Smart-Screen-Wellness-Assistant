'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { SpineModel } from './spine-model';

interface PostureCanvasProps {
  postureState: 'GOOD' | 'BAD';
}

export function PostureCanvas({ postureState }: PostureCanvasProps) {
  return (
    <div className="relative w-full h-full min-h-[340px] select-none">
      <Canvas
        camera={{ position: [2.5, 0.8, 3.2], fov: 44 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        {/* Cinematic Lighting System */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 6, 4]} intensity={1.2} color="#bae6fd" />
        <pointLight position={[-2, 3, 2]} intensity={2.0} color="#00f0ff" />
        <pointLight position={[2, -1, -2]} intensity={1.2} color="#818cf8" />

        {/* Dynamic Biomechanical Hologram Model */}
        <Suspense fallback={null}>
          <SpineModel postureState={postureState} />
        </Suspense>

        {/* Precision Restrained Camera Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3.2}
          maxPolarAngle={Math.PI / 1.85}
          minAzimuthAngle={-Math.PI / 3.5}
          maxAzimuthAngle={Math.PI / 3.5}
          dampingFactor={0.06}
          rotateSpeed={0.7}
        />
      </Canvas>

      {/* Interactive Helper Hint Badge */}
      <div className="absolute bottom-2 right-3 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/70 border border-slate-800/80 backdrop-blur-md text-[10px] text-slate-400 font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>Kéo chuột để xoay 3D</span>
      </div>
    </div>
  );
}

export default PostureCanvas;
