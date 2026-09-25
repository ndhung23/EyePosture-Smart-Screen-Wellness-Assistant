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
    'Ứng dụng Desktop tự động phân tích khoảng cách, cảnh báo gù lưng, chớp mắt và quy tắc 20-20-20. Xử lý bảo mật 100% On-device.',
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
