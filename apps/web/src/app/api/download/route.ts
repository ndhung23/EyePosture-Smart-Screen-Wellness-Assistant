import { NextResponse } from 'next/server';

export async function GET() {
  const downloadUrl =
    process.env.WINDOWS_DOWNLOAD_URL ||
    'https://github.com/ndhung23/EyePosture-Smart-Screen-Wellness-Assistant/releases/latest/download/EyePosture-Setup.exe';

  return NextResponse.redirect(downloadUrl, { status: 307 });
}
