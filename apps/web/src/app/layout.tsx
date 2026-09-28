import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/theme-context';
import { LanguageProvider } from '@/lib/language-context';
import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'EyePosture - AI Trợ Lý Công Thái Học & Chăm Sóc Sức Khỏe Mắt',
  description:
    'Ứng dụng Desktop tự động phân tích khoảng cách tầm nhìn, cảnh báo gù lưng, nhắc chớp mắt và quy tắc 20-20-20. Bảo vệ cột sống chuẩn y khoa, bảo mật 100% On-device.',
  keywords: [
    // Thương hiệu & Tên ứng dụng
    'eyeposture',
    'eye posture',
    'eyeposture app',
    'eyeposture vercel',
    'eyeposture desktop',

    // Về tư thế, cột sống & công thái học
    'tư thế cột sống',
    'chống gù lưng',
    'app chống gù lưng',
    'sửa tư thế ngồi',
    'phần mềm nhắc nhở tư thế',
    'công thái học',
    'ergonomics',
    'posture tracker',
    'posture corrector software',
    'cảnh báo sai tư thế',
    'thoái hóa đốt sống cổ',

    // Về sức khỏe mắt & tầm nhìn
    'bảo vệ mắt',
    'khoảng cách màn hình',
    'nhắc chớp mắt',
    'quy tắc 20-20-20',
    'mỏi mắt văn phòng',
    'hội chứng thị giác màn hình',
    'eye care app',
    'blink reminder',
    'screen distance monitor',

    // Về công nghệ & tính năng
    'AI posture',
    'AI trợ lý công thái học',
    'on device privacy',
    'computer vision posture',
    'phần mềm sức khỏe văn phòng',
    'desktop app sức khỏe'
  ],
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'PRyccT98tQR9qDa2cSg1wQHgcu-9aeBIl34MdcZ1POA',
  },
  openGraph: {
    title: 'EyePosture - AI Trợ Lý Công Thái Học & Chăm Sóc Sức Khỏe Mắt',
    description:
      'Ứng dụng Desktop tự động phân tích khoảng cách tầm nhìn, cảnh báo gù lưng, nhắc chớp mắt và quy tắc 20-20-20. Xử lý bảo mật 100% On-device.',
    url: 'https://eyeposture.vercel.app',
    siteName: 'EyePosture',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/EyePosture.ico' },
      { url: '/favicon.ico' },
      { url: '/EyePosture.png', type: 'image/png' },
    ],
    shortcut: '/EyePosture.ico',
    apple: '/EyePosture.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning className="dark">
      <body className={`${inter.className} min-h-screen antialiased selection:bg-cyan-500/20 selection:text-cyan-300`}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>{children}</AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}