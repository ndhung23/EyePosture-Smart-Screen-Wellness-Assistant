import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/theme-context';
import { LanguageProvider } from '@/lib/language-context';
import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://eyeposture.vercel.app'),
  alternates: {
    canonical: '/',
  },
  applicationName: 'EyePosture',
  title: {
    default: 'EyePosture - AI Trợ Lý Công Thái Học & Chăm Sóc Sức Khỏe Mắt',
    template: '%s | EyePosture',
  },
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
    'desktop app sức khỏe',
  ],
  authors: [{ name: 'EyePosture Team', url: 'https://eyeposture.vercel.app' }],
  creator: 'EyePosture',
  publisher: 'EyePosture',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EyePosture - AI Trợ Lý Công Thái Học & Sức Khỏe Mắt',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EyePosture - AI Trợ Lý Công Thái Học & Chăm Sóc Sức Khỏe Mắt',
    description:
      'Ứng dụng Desktop AI chống gù lưng, nhắc chớp mắt và bảo vệ mắt 100% On-device.',
    images: ['/og-image.png'],
    creator: '@EyePosture',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon-48x48.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

const jsonLdData = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'EyePosture',
    alternateName: ['Eye Posture', 'EyePosture App', 'EyePosture AI'],
    url: 'https://eyeposture.vercel.app',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'EyePosture',
    url: 'https://eyeposture.vercel.app',
    logo: 'https://eyeposture.vercel.app/EyePosture.png',
    sameAs: ['https://eyeposture.vercel.app'],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+84359928446',
        contactType: 'customer support',
        email: 'eyeposture@gmail.com',
        areaServed: 'VN',
        availableLanguage: ['Vietnamese', 'English'],
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'EyePosture',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Windows 10, Windows 11, macOS',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'VND',
    },
    description:
      'Ứng dụng Desktop tự động phân tích khoảng cách tầm nhìn, cảnh báo gù lưng, nhắc chớp mắt và quy tắc 20-20-20. Bảo vệ cột sống chuẩn y khoa, bảo mật 100% On-device.',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '128',
    },
    featureList: [
      'AI theo dõi góc nghiêng cổ C1-C7 và phát hiện gù lưng theo thời gian thực',
      'Đo khoảng cách an toàn màn hình 50-70cm chuẩn y khoa',
      'Nhắc chớp mắt và quy tắc 20-20-20 ngăn ngừa mỏi mắt',
      '100% On-Device AI: Bảo mật webcam tuyệt đối, không gửi video lên cloud',
      'Bảng điều khiển HUD trực quan, chế độ Pro & Doanh nghiệp',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'EyePosture là gì và giải quyết vấn đề gì cho người dùng máy tính?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'EyePosture là phần mềm Desktop thông minh ứng dụng trí tuệ nhân tạo (AI Computer Vision) cục bộ giúp người dùng máy tính bảo vệ mắt và giữ tư thế ngồi chuẩn y khoa. Phần mềm liên tục theo dõi góc nghiêng cổ C1-C7, phát hiện gù lưng, đo khoảng cách an toàn tới màn hình (50-70cm), đồng thời nhắc chớp mắt và thực hiện quy tắc 20-20-20.',
        },
      },
      {
        '@type': 'Question',
        name: 'Webcam có ghi hình hay gửi video lên mạng không? Bảo mật ra sao?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Tuyệt đối KHÔNG. EyePosture cam kết bảo mật 100% On-Device Privacy. Toàn bộ quá trình nhận diện tư thế và mắt được tính toán trực tiếp trên phần cứng máy tính của bạn (CPU/GPU/NPU). Không có bất kỳ hình ảnh hay luồng video nào bị lưu trữ vào ổ cứng hay truyền tải lên internet.',
        },
      },
      {
        '@type': 'Question',
        name: 'Quy tắc 20-20-20 và cơ chế nhắc chớp mắt hoạt động thế nào?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Theo khuyến nghị y khoa nhãn khoa quốc tế, cứ mỗi 20 phút nhìn màn hình, bạn nên nhìn xa 20 feet (6 mét) trong 20 giây để các cơ điều tiết của mắt được thư giãn hoàn toàn. EyePosture tự động tính toán thời gian làm việc thực tế và hiển thị thông báo dịu nhẹ kết hợp nhận diện tần suất chớp mắt.',
        },
      },
      {
        '@type': 'Question',
        name: 'Làm thế nào để tải và bắt đầu sử dụng EyePosture?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Bạn chỉ cần nhấn nút Tải Bản Cài Windows (.exe) trên trang chủ eyeposture.vercel.app để tải về bộ cài đặt tự động. Sau khi cài đặt, ứng dụng chạy ngay và không bắt buộc đăng nhập để dùng thử các tính năng công thái học cơ bản.',
        },
      },
    ],
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
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