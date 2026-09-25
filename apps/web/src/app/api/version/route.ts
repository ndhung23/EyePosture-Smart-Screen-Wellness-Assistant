import { NextResponse } from 'next/server';

export async function GET() {
  const latestVersion = process.env.LATEST_APP_VERSION || '1.0.1';
  const downloadUrl =
    process.env.WINDOWS_DOWNLOAD_URL ||
    'https://github.com/ndhung23/EyePosture-Smart-Screen-Wellness-Assistant/releases/latest/download/EyePosture-Setup.exe';

  const releaseNotes =
    process.env.RELEASE_NOTES ||
    'Bản cập nhật v1.0.1:\n• Tối ưu hệ thống kết nối máy chủ đám mây Vercel & Supabase.\n• Khắc phục lỗi xác thực khi đăng nhập tài khoản.\n• Tự động kích hoạt gói bản quyền Family / Pro ngay sau khi đăng nhập.\n• Cải thiện độ mượt và hiệu năng nhận diện tư thế qua AI camera.';

  return NextResponse.json(
    {
      latestVersion,
      releaseNotes,
      downloadUrl,
      mandatory: false,
      publishedAt: '2026-09-25T19:00:00.000Z',
    },
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}
