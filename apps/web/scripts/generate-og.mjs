import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function createOgImage() {
  const logoPath = path.resolve('apps/web/public/EyePosture.png');
  const logoBuffer = fs.readFileSync(logoPath);
  const logoResized = await sharp(logoBuffer).resize(180, 180).toBuffer();
  const logoBase64 = logoResized.toString('base64');

  const svg = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#090d16" />
        <stop offset="50%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#020617" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="40" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <rect width="1200" height="630" fill="url(#bg)" />
    <circle cx="220" cy="315" r="160" fill="#06b6d4" opacity="0.2" filter="url(#glow)" />
    <circle cx="1000" cy="200" r="200" fill="#8b5cf6" opacity="0.15" filter="url(#glow)" />

    <image href="data:image/png;base64,${logoBase64}" x="120" y="225" width="180" height="180" />

    <text x="340" y="255" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="700" fill="#38bdf8" letter-spacing="3">EYEPOSTURE AI</text>
    
    <text x="340" y="325" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="800" fill="#ffffff">AI Trợ Lý Công Thái Học &amp; Sức Khỏe Mắt</text>
    
    <text x="340" y="380" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#94a3b8">Bảo vệ cột sống • Chống gù lưng • Nhắc chớp mắt • 100% On-Device Privacy</text>
    
    <g transform="translate(340, 420)">
      <rect x="0" y="0" width="180" height="42" rx="8" fill="#1e293b" stroke="#0ea5e9" stroke-width="1.5" />
      <text x="90" y="27" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="#38bdf8" text-anchor="middle">Desktop Windows</text>
      
      <rect x="200" y="0" width="180" height="42" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="1.5" />
      <text x="290" y="27" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="#34d399" text-anchor="middle">On-Device AI</text>
      
      <rect x="400" y="0" width="200" height="42" rx="8" fill="#1e293b" stroke="#8b5cf6" stroke-width="1.5" />
      <text x="500" y="27" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="#c084fc" text-anchor="middle">eyeposture.vercel.app</text>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.resolve('apps/web/public/og-image.png'));
    
  // Also save to app folder as opengraph-image.png for Next.js metadata convention
  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.resolve('apps/web/src/app/opengraph-image.png'));

  console.log('OG images created successfully!');
}

createOgImage().catch(console.error);
