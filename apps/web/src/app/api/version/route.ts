import { NextResponse } from 'next/server';

export async function GET() {
  const latestVersion = process.env.LATEST_APP_VERSION || '1.2.0';
  const downloadUrl =
    process.env.WINDOWS_DOWNLOAD_URL ||
    'https://github.com/ndhung23/EyePosture-Smart-Screen-Wellness-Assistant/releases/latest/download/EyePosture-Setup.exe';

  const releaseNotes =
    process.env.RELEASE_NOTES ||
    'Bản cập nhật v1.2.0:\n• Cơ chế Bảo Mật Mật Khẩu tài khoản (tùy chọn bật/tắt để khóa thoát app, tắt camera, cài đặt).\n• Khắc phục triệt để tính năng Khởi động cùng Windows.\n• Bổ sung tính năng Todo List quản lý công việc hàng ngày.\n• Bổ sung Thống kê chi tiết số lần cảnh báo & nhắc nhở (khoảng cách, tư thế gù lưng, 20-20-20).\n• Cho phép dùng thử 2 tiếng/ngày tính năng Giám sát camera AI cho tài khoản Free và khách vãng lai.\n• Tích hợp hệ thống Affiliate tiếp thị liên kết 40% chuẩn SaaS trực tuyến trên Website.';

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
