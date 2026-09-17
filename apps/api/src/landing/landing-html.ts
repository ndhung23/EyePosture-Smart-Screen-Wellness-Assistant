import { getLandingStyles } from './landing-styles.js';
import { getLandingScripts } from './landing-scripts.js';
import { getLoginModalHtml } from './landing-login-modal.js';

export function getLandingPageHtml(): string {
  const styles = getLandingStyles();
  const scripts = getLandingScripts();
  const loginModal = getLoginModalHtml();

  return `<!DOCTYPE html>
<html lang="vi" class="dark scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EyePosture - Trợ Lý AI Chăm Sóc Thị Lực & Tư Thế Màn Hình Thông Minh</title>
  <meta name="description" content="EyePosture là ứng dụng trợ lý AI trên máy tính giúp bảo vệ mắt, điều chỉnh tư thế công thái học, đo khoảng cách màn hình và nhắc nghỉ ngơi 20-20-20. 100% xử lý On-Device, bảo mật tuyệt đối.">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" href="/EyePosture.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${styles}
  </style>
</head>
<body class="antialiased selection:bg-teal-500/30 selection:text-teal-200 relative">

  <!-- Ambient Glow Effects -->
  <div class="ambient-glow ambient-teal w-[500px] h-[500px] -top-32 left-1/2 -translate-x-1/2"></div>
  <div class="ambient-glow ambient-cyan w-[400px] h-[400px] top-[900px] -left-32"></div>
  <div class="ambient-glow ambient-indigo w-[450px] h-[450px] top-[1800px] -right-32"></div>

  <!-- ================= TOP NAVIGATION BAR ================= -->
  <header class="fixed top-0 left-0 right-0 z-50 glass-nav">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      
      <!-- Brand Logo -->
      <a href="/" class="flex items-center gap-2.5 shrink-0 group">
        <img src="/EyePosture.png" alt="EyePosture Logo" class="w-9 h-9 rounded-xl object-contain shadow-md border border-teal-500/30 bg-slate-900 group-hover:scale-105 transition duration-300" />
        <div class="flex items-center gap-1.5 whitespace-nowrap">
          <span class="text-lg font-extrabold tracking-tight text-white">EyePosture</span>
          <span class="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30 leading-none">
            AI
          </span>
        </div>
      </a>

      <!-- Desktop Navigation Links -->
      <nav class="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300 shrink-0">
        <a href="#features" class="whitespace-nowrap hover:text-teal-400 transition">Tính Năng</a>
        <a href="#privacy" class="whitespace-nowrap hover:text-teal-400 transition">Bảo Mật Local</a>
        <a href="#demo" class="whitespace-nowrap hover:text-teal-400 transition">Trải Nghiệm Thử</a>
        <a href="#pricing" class="whitespace-nowrap hover:text-teal-400 transition">Bảng Giá</a>
        <a href="#faq" class="whitespace-nowrap hover:text-teal-400 transition">Hỏi Đáp</a>
      </nav>

      <!-- Header Action Buttons -->
      <div class="hidden sm:flex items-center gap-2.5 shrink-0">
        <!-- Auth Container (Login / Profile / Admin Hub) -->
        <div id="nav-auth-container" class="flex items-center gap-2"></div>

        <!-- Windows Download Trigger -->
        <button class="trigger-download btn-glow text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.902-1.799"/></svg>
          <span>Tải Cho Windows</span>
        </button>
      </div>

      <!-- Mobile Menu Button -->
      <button id="mobile-menu-btn" class="md:hidden text-slate-400 hover:text-white p-2" aria-label="Menu">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>

    </div>

    <!-- Mobile Dropdown Menu -->
    <div id="mobile-menu" class="hidden md:hidden border-b border-slate-800 bg-slate-950/95 px-5 py-4 space-y-3 text-sm">
      <a href="#features" class="block text-slate-300 hover:text-teal-400 py-1">Tính Năng Nổi Bật</a>
      <a href="#privacy" class="block text-slate-300 hover:text-teal-400 py-1">Bảo Mật Local-First</a>
      <a href="#demo" class="block text-slate-300 hover:text-teal-400 py-1">Mô Phỏng Trực Quan</a>
      <a href="#how-it-works" class="block text-slate-300 hover:text-teal-400 py-1">Cách Hoạt Động</a>
      <a href="#pricing" class="block text-slate-300 hover:text-teal-400 py-1">Bảng Giá</a>
      <a href="#faq" class="block text-slate-300 hover:text-teal-400 py-1">Hỏi Đáp FAQ</a>
      <div class="pt-3 border-t border-slate-800 flex flex-col gap-2.5">
        <div id="mobile-auth-container"></div>
        <a href="/admin" class="text-center py-2 text-xs rounded-lg bg-slate-900 text-slate-300 border border-slate-800">Vào Quản Trị Hub (/admin)</a>
        <button class="trigger-download w-full btn-glow text-slate-950 font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.902-1.799"/></svg>
          Tải Cho Windows (.exe)
        </button>
      </div>
    </div>
  </header>

  <!-- ================= HERO SECTION ================= -->
  <section class="relative pt-36 pb-20 md:pt-44 md:pb-28 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
      
      <!-- Highlight Badge -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card shimmer-badge text-xs font-semibold text-teal-300 border border-teal-500/30 mb-7 shadow-sm">
        <span class="pulse-dot"></span>
        <span>AI Bảo Vệ Thị Lực & Tư Thế Cục Bộ</span>
      </div>

      <!-- Main Headline (Rút gọn) -->
      <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
        Làm Việc Tập Trung,<br/>
        <span class="gradient-text">Bảo Vệ Mắt & Cột Sống</span>
      </h1>

      <!-- Subtitle Description (Rút gọn súc tích) -->
      <p class="mt-5 text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
        Trợ lý AI phát hiện ngồi gần màn hình, nhắc sửa tư thế gù lưng và quy tắc 20-20-20.
        <span class="text-teal-300 font-medium">100% xử lý cục bộ trên máy, cam kết 0% gửi dữ liệu.</span>
      </p>

      <!-- CTA Buttons & Download Highlight -->
      <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        
        <!-- Primary Windows Download CTA -->
        <button class="trigger-download btn-glow text-slate-950 font-extrabold px-8 py-3.5 rounded-2xl text-base flex items-center justify-center gap-3 w-full sm:w-auto group">
          <svg class="w-5 h-5 fill-current group-hover:rotate-6 transition duration-200" viewBox="0 0 24 24"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.902-1.799"/></svg>
          <div class="text-left leading-tight">
            <div>Tải Cho Windows (.exe)</div>
            <div class="text-[11px] font-medium text-slate-900/80">Bản v1.0.0 • Windows 10 & 11</div>
          </div>
          <svg class="w-5 h-5 ml-1 group-hover:translate-y-0.5 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
        </button>

        <!-- Secondary Demo Anchor -->
        <a href="#demo" class="glass-card hover:bg-slate-800/80 text-white font-semibold px-6 py-4 rounded-2xl text-base flex items-center justify-center gap-2.5 w-full sm:w-auto border border-slate-700/70 transition">
          <svg class="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>Trải Nghiệm Thử Ngay</span>
        </a>

      </div>

      <!-- Trust Badges & System Highlights -->
      <div class="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate-400">
        <div class="flex items-center gap-1.5">
          <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          Miễn phí trải nghiệm trọn đời
        </div>
        <div class="flex items-center gap-1.5">
          <svg class="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          100% On-Device Privacy Guaranteed
        </div>
        <div class="flex items-center gap-1.5">
          <svg class="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          Tối ưu phần cứng (&lt;1.5% CPU)
        </div>
      </div>

    </div>
  </section>

  <!-- ================= KEY STATS BANNER ================= -->
  <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-20 relative z-20">
    <div class="glass-card rounded-3xl p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
      
      <div class="pt-4 md:pt-0">
        <div class="text-3xl sm:text-4xl font-extrabold text-teal-400">100%</div>
        <div class="text-xs sm:text-sm font-semibold text-white mt-1">Xử Lý Cục Bộ (Local)</div>
        <div class="text-[11px] text-slate-400 mt-0.5">Không truyền video lên cloud</div>
      </div>

      <div class="pt-4 md:pt-0">
        <div class="text-3xl sm:text-4xl font-extrabold text-sky-400">&lt; 1.5%</div>
        <div class="text-xs sm:text-sm font-semibold text-white mt-1">Mức Tiêu Tốn CPU</div>
        <div class="text-[11px] text-slate-400 mt-0.5">Êm ái, siêu tiết kiệm pin</div>
      </div>

      <div class="pt-4 md:pt-0">
        <div class="text-3xl sm:text-4xl font-extrabold text-emerald-400">20-20-20</div>
        <div class="text-xs sm:text-sm font-semibold text-white mt-1">Quy Tắc Nghỉ Y Khoa</div>
        <div class="text-[11px] text-slate-400 mt-0.5">Giảm 80% triệu chứng mỏi mắt</div>
      </div>

      <div class="pt-4 md:pt-0">
        <div class="text-3xl sm:text-4xl font-extrabold text-purple-400">Song Ngữ</div>
        <div class="text-xs sm:text-sm font-semibold text-white mt-1">Tiếng Việt & English</div>
        <div class="text-[11px] text-slate-400 mt-0.5">Giao diện thân thiện trực quan</div>
      </div>

    </div>
  </section>

  <!-- ================= INTERACTIVE SIMULATOR SECTION ================= -->
  <section id="demo" class="py-16 relative">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="text-center mb-10">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold border border-teal-500/20 mb-3">
          Trải Nghiệm Tương Tác
        </div>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-white">
          Thử Nghiệm Cơ Chế Đo Của <span class="gradient-accent">EyePosture AI</span>
        </h2>
        <p class="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mt-2">
          Kéo thanh trượt khoảng cách hoặc chọn trạng thái tư thế để chứng kiến cách EyePosture nhận biết và đưa ra cảnh báo bảo vệ bạn theo thời gian thực.
        </p>
      </div>

      <!-- Simulator Box -->
      <div class="simulator-box rounded-3xl p-6 sm:p-8 md:p-10 relative overflow-hidden">
        
        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <!-- Controls Panel (Left) -->
          <div class="md:col-span-6 space-y-6">
            
            <!-- Distance Slider -->
            <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <svg class="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  Khoảng cách mắt tới màn hình
                </span>
                <span id="sim-distance-val" class="font-mono text-sm font-extrabold text-teal-300 bg-teal-950/80 px-2.5 py-1 rounded-lg border border-teal-500/30">
                  65 cm
                </span>
              </div>
              <input id="sim-distance-slider" type="range" min="30" max="90" value="65" class="cursor-pointer">
              <div class="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
                <span class="text-rose-400 font-semibold">30 cm (Nguy hiểm)</span>
                <span class="text-teal-400 font-semibold">50 - 70 cm (Lý tưởng)</span>
                <span>90 cm (Xa)</span>
              </div>
            </div>

            <!-- Posture Selector -->
            <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
              <label for="sim-posture-select" class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <svg class="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                Tư thế cột sống và cổ
              </label>
              <select id="sim-posture-select" class="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-teal-500 transition">
                <option value="GOOD">Chuẩn Công Thái Học (Lưng thẳng, mắt ngang tầm màn)</option>
                <option value="SLOUCH">Cúi Gù Lưng / Lưng cong về trước</option>
                <option value="TILT">Nghiêng Cổ Sang Một Bên</option>
              </select>
            </div>

            <!-- Mini 20-20-20 Eye Rest Demo -->
            <div class="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <div class="text-xs font-bold text-slate-300">Đồng hồ chu kỳ 20-20-20</div>
                <div class="text-[11px] text-slate-500">Mỗi 20 phút làm việc, cho mắt nhìn xa 20 feet</div>
              </div>
              <div class="flex items-center gap-3">
                <span id="mini-timer-display" class="font-mono font-bold text-teal-400 text-sm">20:00</span>
                <button id="mini-timer-btn" class="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg transition border border-slate-700">
                  Bắt Đầu
                </button>
              </div>
            </div>

          </div>

          <!-- Display Output Widget (Right) -->
          <div class="md:col-span-6 bg-slate-950/90 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between h-full min-h-[300px]">
            
            <div class="flex items-center justify-between pb-4 border-b border-slate-800">
              <div class="flex items-center gap-2.5">
                <span id="sim-avatar" class="text-2xl">✨</span>
                <div>
                  <div class="text-xs font-bold text-white">Chẩn Đoán Trợ Lý AI</div>
                  <div class="text-[10px] text-slate-400">Theo dõi thông số thời gian thực</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-[10px] text-slate-400 uppercase">Điểm tư thế</div>
                <div id="sim-score-val" class="text-base font-extrabold font-mono text-teal-400">100/100</div>
              </div>
            </div>

            <!-- Status Pill -->
            <div class="py-6 flex flex-col items-center justify-center text-center">
              <div id="sim-status-pill" class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-2 mb-4">
                <span class="pulse-dot"></span>
                <span>CHUẨN CÔNG THÁI HỌC</span>
              </div>
              <div id="sim-alert-box" class="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs w-full leading-relaxed">
                <span id="sim-advice-text">Khoảng cách và tư thế đều lý tưởng. Bạn đang bảo vệ đôi mắt và cột sống rất tốt!</span>
              </div>
            </div>

            <!-- Security Assurance Footer -->
            <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                Inference: MediaPipe On-Device
              </span>
              <span class="text-emerald-400 font-mono">0 bytes transmitted</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  </section>

  <!-- ================= CORE FEATURES SECTION ================= -->
  <section id="features" class="py-20 relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="text-center max-w-3xl mx-auto mb-16">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold border border-teal-500/20 mb-3">
          Tính Năng Đột Phá
        </div>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-white">
          Bảo Vệ Toàn Diện Cho Người Làm Việc Với Máy Tính
        </h2>
        <p class="text-slate-400 text-sm sm:text-base mt-3">
          Thiết kế đặc biệt dành riêng cho lập trình viên, nhân viên văn phòng, game thủ và học sinh học trực tuyến.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        
        <!-- Feature 1 -->
        <div class="glass-card rounded-3xl p-7 flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 mb-6">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Đo Khoảng Cách Mắt Chuẩn Xác</h3>
            <p class="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Nhận diện khoảng cách giữa đồng tử và màn hình qua webcam. Cảnh báo tức thì khi bạn vô thức rướn sát màn hình dưới 50cm, phòng ngừa tăng độ cận thị.
            </p>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-800 text-xs font-semibold text-teal-400 flex items-center gap-1">
            <span>Khoảng cách an toàn: 55 - 70 cm</span>
          </div>
        </div>

        <!-- Feature 2 -->
        <div class="glass-card rounded-3xl p-7 flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-300 mb-6">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Phát Hiện Tư Thế Gù Lưng & Lệch Cổ</h3>
            <p class="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Mô hình AI nhận diện điểm vai, cổ và cằm. Ngay khi bạn cúi gục đầu hoặc gù lưng, ứng dụng sẽ nhắc nhở tinh tế mà không làm gián đoạn dòng suy nghĩ công việc.
            </p>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-800 text-xs font-semibold text-sky-400 flex items-center gap-1">
            <span>Phòng ngừa thoái hóa đốt sống cổ</span>
          </div>
        </div>

        <!-- Feature 3 -->
        <div class="glass-card rounded-3xl p-7 flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300 mb-6">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Chu Kỳ Nghỉ Mắt 20-20-20</h3>
            <p class="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Tự động đếm 20 phút làm việc liên tục và nhắc bạn chớp mắt nhìn ra xa 20 feet (khoảng 6m) trong 20 giây. Giúp tuyến lệ tiết đều và giảm khô rát mắt.
            </p>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-800 text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <span>Theo khuyến cáo y khoa Hoa Kỳ (AAO)</span>
          </div>
        </div>

        <!-- Feature 4 -->
        <div class="glass-card rounded-3xl p-7 flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 mb-6">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Nhắc Uống Nước & Vận Động Nhẹ</h3>
            <p class="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Duy trì lượng nước cơ thể và khuyến khích xoay khớp cổ tay, vươn vai sau những phiên làm việc căng thẳng kéo dài nhiều giờ liền.
            </p>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-800 text-xs font-semibold text-cyan-400 flex items-center gap-1">
            <span>Giữ năng lượng tỉnh táo suốt ngày dài</span>
          </div>
        </div>

        <!-- Feature 5 -->
        <div class="glass-card rounded-3xl p-7 flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 mb-6">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Tự Động Ẩn Khi Toàn Màn Hình</h3>
            <p class="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Thông minh nhận diện khi bạn đang thuyết trình PowerPoint, xem phim hoặc chơi game toàn màn hình để tạm dừng các thông báo pop-up gây phân tâm.
            </p>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-800 text-xs font-semibold text-amber-400 flex items-center gap-1">
            <span>Không làm gián đoạn trải nghiệm giải trí</span>
          </div>
        </div>

        <!-- Feature 6 -->
        <div class="glass-card rounded-3xl p-7 flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 mb-6">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Khóa Mật Khẩu Bảo Vệ Trẻ Em</h3>
            <p class="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Phụ huynh có thể cài đặt mã PIN bảo vệ để trẻ không thể tự ý tắt ứng dụng hoặc tạm dừng giám sát khi học online hay dùng máy tính một mình.
            </p>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-800 text-xs font-semibold text-indigo-400 flex items-center gap-1">
            <span>An tâm cho thế hệ tương lai</span>
          </div>
        </div>

      </div>

    </div>
  </section>

  <!-- ================= PRIVACY SECTION ================= -->
  <section id="privacy" class="py-20 relative border-t border-b border-slate-900 bg-slate-950/60">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <!-- Text Explanation (Left) -->
        <div class="lg:col-span-6 space-y-6">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            Cam Kết Bảo Mật 100%
          </div>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            Hình Ảnh Webcam Của Bạn <span class="gradient-text">Không Bao Giờ</span> Rời Khỏi Máy Tính
          </h2>
          <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
            Chúng tôi hiểu rằng camera là không gian riêng tư nhạy cảm nhất. Khác với các giải pháp AI thông thường gửi luồng video lên server đám mây, EyePosture được thiết kế theo kiến trúc <strong class="text-teal-300">Local-First tuyệt đối</strong>.
          </p>

          <div class="space-y-4 pt-2">
            <div class="flex items-start gap-3.5">
              <div class="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✓</div>
              <div>
                <h4 class="text-sm font-bold text-white">Xử Lý Trên RAM Cục Bộ</h4>
                <p class="text-xs text-slate-400 mt-0.5">Từng khung hình camera được AI trích xuất toạ độ hình học (landmarks) và hủy ngay lập tức trên bộ nhớ RAM.</p>
              </div>
            </div>

            <div class="flex items-start gap-3.5">
              <div class="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✓</div>
              <div>
                <h4 class="text-sm font-bold text-white">Không Ghi Hình, Không Lưu File ẢNH</h4>
                <p class="text-xs text-slate-400 mt-0.5">Ổ cứng của bạn và máy chủ EyePosture không bao giờ lưu trữ bất kỳ tấm ảnh hay video nào.</p>
              </div>
            </div>

            <div class="flex items-start gap-3.5">
              <div class="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✓</div>
              <div>
                <h4 class="text-sm font-bold text-white">Hoạt Động Hoàn Hảo Offline Không Cần Mạng</h4>
                <p class="text-xs text-slate-400 mt-0.5">Dù bạn ngắt hoàn toàn kết nối Wi-Fi/Internet, ứng dụng vẫn hoạt động 100% bình thường trên máy tính.</p>
              </div>
            </div>
          </div>

        </div>

        <!-- Privacy Diagram Card (Right) -->
        <div class="lg:col-span-6">
          <div class="glass-card rounded-3xl p-6 sm:p-8 border border-teal-500/20 relative">
            <div class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center justify-between">
              <span>Kiến Trúc Luồng Dữ Liệu On-Device</span>
              <span class="text-emerald-400 flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Offline-Safe
              </span>
            </div>

            <div class="space-y-4 font-mono text-xs">
              
              <!-- Step 1 -->
              <div class="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="p-2 rounded-xl bg-slate-800 text-teal-300">📷</span>
                  <div>
                    <div class="font-bold text-white">1. Webcam Máy Tính</div>
                    <div class="text-[11px] text-slate-400">Thu nhận luồng video thô</div>
                  </div>
                </div>
                <span class="text-[10px] bg-teal-500/10 text-teal-300 px-2 py-0.5 rounded">Vào RAM</span>
              </div>

              <!-- Down Arrow -->
              <div class="flex justify-center text-teal-500">↓</div>

              <!-- Step 2 -->
              <div class="bg-teal-950/30 p-4 rounded-2xl border border-teal-500/30 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="p-2 rounded-xl bg-teal-500/20 text-teal-300">🧠</span>
                  <div>
                    <div class="font-bold text-teal-200">2. MediaPipe Vision Engine (Local)</div>
                    <div class="text-[11px] text-teal-400/80">Tính toạ độ mắt & tư thế & hủy frame</div>
                  </div>
                </div>
                <span class="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded">Hủy Ngay</span>
              </div>

              <!-- Down Arrow -->
              <div class="flex justify-center text-teal-500">↓</div>

              <!-- Step 3 -->
              <div class="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="p-2 rounded-xl bg-slate-800 text-sky-300">🔔</span>
                  <div>
                    <div class="font-bold text-white">3. Trợ Lý Nhắc Nhở Thông Minh</div>
                    <div class="text-[11px] text-slate-400">Đưa ra cảnh báo nhẹ nhàng trên màn hình</div>
                  </div>
                </div>
                <span class="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">0 Cloud Leak</span>
              </div>

            </div>

            <div class="mt-6 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-400">
              Mã nguồn ứng dụng minh bạch • Không gắn SDK theo dõi bên thứ ba
            </div>

          </div>
        </div>

      </div>

    </div>
  </section>

  <!-- ================= HOW IT WORKS ================= -->
  <section id="how-it-works" class="py-20 relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="text-center max-w-3xl mx-auto mb-16">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold border border-teal-500/20 mb-3">
          Khởi Đầu Nhanh Chóng
        </div>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-white">
          Sẵn Sàng Bảo Vệ Sức Khỏe Trong 3 Bước
        </h2>
        <p class="text-slate-400 text-sm sm:text-base mt-2">
          Không cần tạo tài khoản rườm rà, không cần thiết bị cảm biến đắt tiền.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <!-- Step 1 -->
        <div class="glass-card rounded-3xl p-8 relative">
          <div class="text-5xl font-black text-slate-800 absolute top-6 right-6 select-none font-mono">01</div>
          <div class="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center justify-center font-bold text-lg mb-6">
            ↓
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Tải File .EXE Cho Windows</h3>
          <p class="text-slate-400 text-xs sm:text-sm leading-relaxed">
            Nhấp nút tải file cài đặt <strong class="text-teal-300">EyePosture.exe</strong> tương thích với mọi máy chạy Windows 10 và 11 (64-bit).
          </p>
        </div>

        <!-- Step 2 -->
        <div class="glass-card rounded-3xl p-8 relative">
          <div class="text-5xl font-black text-slate-800 absolute top-6 right-6 select-none font-mono">02</div>
          <div class="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 text-sky-300 flex items-center justify-center font-bold text-lg mb-6">
            ⚡
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Cài Đặt Trong 10 Giây</h3>
          <p class="text-slate-400 text-xs sm:text-sm leading-relaxed">
            Mở file vừa tải, ứng dụng tự động cài đặt và cấp quyền webcam một lần duy nhất. Không yêu cầu cài thêm bất kỳ driver nào.
          </p>
        </div>

        <!-- Step 3 -->
        <div class="glass-card rounded-3xl p-8 relative">
          <div class="text-5xl font-black text-slate-800 absolute top-6 right-6 select-none font-mono">03</div>
          <div class="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold text-lg mb-6">
            🛡️
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Bắt Đầu Làm Việc Lành Mạnh</h3>
          <p class="text-slate-400 text-xs sm:text-sm leading-relaxed">
            EyePosture thu gọn vào khay hệ thống (System Tray). Bạn yên tâm làm việc, việc theo dõi và chăm sóc mắt cứ để AI lo!
          </p>
        </div>

      </div>

    </div>
  </section>

  <!-- ================= PRICING SECTION ================= -->
  <section id="pricing" class="py-20 relative bg-slate-950/40 border-t border-slate-900">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="text-center max-w-3xl mx-auto mb-16">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold border border-teal-500/20 mb-3">
          Chi Phí Hợp Lý
        </div>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-white">
          Bắt Đầu Hoàn Toàn Miễn Phí, Nâng Cấp Khi Cần
        </h2>
        <p class="text-slate-400 text-sm sm:text-base mt-2">
          Đầu tư một khoản nhỏ cho sức khỏe đôi mắt và cột sống của bạn trọn đời.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        <!-- FREE PLAN -->
        <div class="glass-card rounded-3xl p-8 flex flex-col justify-between border-slate-800">
          <div>
            <div class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Gói Cơ Bản</div>
            <h3 class="text-2xl font-black text-white">FREE TẬN HƯỞNG</h3>
            <div class="mt-4 mb-6">
              <span class="text-4xl font-black text-white">0đ</span>
              <span class="text-xs text-slate-400"> / vĩnh viễn</span>
            </div>
            <p class="text-xs sm:text-sm text-slate-300 mb-6">
              Thích hợp cho người dùng cá nhân muốn trải nghiệm thói quen làm việc khoa học.
            </p>

            <ul class="space-y-3 text-xs sm:text-sm text-slate-300">
              <li class="flex items-center gap-2.5">
                <svg class="w-4 h-4 text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Đo khoảng cách mắt thời gian thực
              </li>
              <li class="flex items-center gap-2.5">
                <svg class="w-4 h-4 text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Nhắc nhở chu kỳ nghỉ mắt 20-20-20
              </li>
              <li class="flex items-center gap-2.5">
                <svg class="w-4 h-4 text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Nhắc uống nước theo giờ
              </li>
              <li class="flex items-center gap-2.5">
                <svg class="w-4 h-4 text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Bảo mật On-Device 100%
              </li>
            </ul>
          </div>

          <div class="mt-8">
            <button class="trigger-download w-full py-3 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition">
              Tải Bản Miễn Phí (.exe)
            </button>
          </div>
        </div>

        <!-- PRO PLAN -->
        <div class="glass-card rounded-3xl p-8 flex flex-col justify-between border-teal-500/50 shadow-xl shadow-teal-500/10 relative overflow-hidden">
          <div class="absolute top-0 right-0 bg-gradient-to-l from-teal-500 to-cyan-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider py-1 px-4 rounded-bl-xl">
            PHỔ BIẾN NHẤT
          </div>

          <div>
            <div class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">Gói Nâng Cao</div>
            <h3 class="text-2xl font-black text-white">PRO WELLNESS</h3>
            <div class="mt-4 mb-6 flex items-baseline gap-2">
              <span class="text-4xl font-black text-teal-300">49.000đ</span>
              <span class="text-xs text-slate-400"> / tháng (hoặc gói năm)</span>
            </div>
            <p class="text-xs sm:text-sm text-slate-300 mb-6">
              Dành cho lập trình viên, designer, người làm việc nhiều giờ và phụ huynh quản lý con em.
            </p>

            <ul class="space-y-3 text-xs sm:text-sm text-slate-200">
              <li class="flex items-center gap-2.5">
                <svg class="w-4 h-4 text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                <strong>Bao gồm toàn bộ tính năng gói FREE</strong>
              </li>
              <li class="flex items-center gap-2.5">
                <svg class="w-4 h-4 text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Nhận diện tư thế gù lưng và lệch vai nâng cao
              </li>
              <li class="flex items-center gap-2.5">
                <svg class="w-4 h-4 text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Báo cáo thói quen, biểu đồ thống kê ngày/tuần
              </li>
              <li class="flex items-center gap-2.5">
                <svg class="w-4 h-4 text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Khóa mật khẩu phụ huynh (chống tắt app)
              </li>
              <li class="flex items-center gap-2.5">
                <svg class="w-4 h-4 text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Kích hoạt tức thì qua VietQR SePay ngân hàng VN
              </li>
            </ul>
          </div>

          <div class="mt-8">
            <button class="trigger-download w-full btn-glow text-slate-950 font-extrabold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg">
              <span>Tải & Trải Nghiệm Bản Pro Ngay</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          </div>
        </div>

      </div>

    </div>
  </section>

  <!-- ================= FAQ SECTION ================= -->
  <section id="faq" class="py-20 relative">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="text-center mb-14">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold border border-teal-500/20 mb-3">
          Giải Đáp Thắc Mắc
        </div>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-white">
          Câu Hỏi Thường Gặp (FAQ)
        </h2>
      </div>

      <div class="space-y-4">
        
        <!-- FAQ 1 -->
        <div class="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <button class="faq-question w-full p-5 text-left text-sm sm:text-base font-bold text-white flex items-center justify-between transition hover:text-teal-400">
            <span>EyePosture có ghi lại video khuôn mặt hoặc xem lén camera của tôi không?</span>
            <svg class="faq-icon w-5 h-5 text-slate-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
          <div class="faq-answer hidden px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
            <strong>Hoàn toàn không.</strong> Toàn bộ quá trình nhận diện được thực hiện bởi mô hình AI chạy trực tiếp trên máy tính của bạn (Local On-Device Inference). Sau khi tính khoảng cách và tư thế, khung hình lập tức bị giải phóng khỏi RAM. Không có một byte video nào được gửi lên mạng hoặc lưu thành file.
          </div>
        </div>

        <!-- FAQ 2 -->
        <div class="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <button class="faq-question w-full p-5 text-left text-sm sm:text-base font-bold text-white flex items-center justify-between transition hover:text-teal-400">
            <span>Ứng dụng có làm chậm máy tính hoặc ngốn pin khi chạy ngầm không?</span>
            <svg class="faq-icon w-5 h-5 text-slate-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
          <div class="faq-answer hidden px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
            EyePosture được tích hợp bộ điều phối tài nguyên <strong>Resource Governor</strong> thông minh. Khi cắm sạc, ứng dụng kiểm tra ở tần số tối ưu (~4-6 FPS). Khi dùng pin hoặc người dùng rời màn hình, ứng dụng tự động giảm tần số lấy mẫu xuống 1-2 FPS. Mức chiếm dụng CPU trung bình dưới 1.5%, hoàn toàn êm ái và không gây nóng máy.
          </div>
        </div>

        <!-- FAQ 3 -->
        <div class="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <button class="faq-question w-full p-5 text-left text-sm sm:text-base font-bold text-white flex items-center justify-between transition hover:text-teal-400">
            <span>Tôi cần webcam loại nào để sử dụng ứng dụng?</span>
            <svg class="faq-icon w-5 h-5 text-slate-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
          <div class="faq-answer hidden px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
            Chỉ cần webcam tích hợp sẵn trên laptop hoặc bất kỳ webcam USB thông thường độ phân giải từ 720p trở lên là đã có thể hoạt động hoàn hảo. Ứng dụng không đòi hỏi camera chuyên dụng hay cảm biến hồng ngoại đắt đỏ.
          </div>
        </div>

        <!-- FAQ 4 -->
        <div class="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <button class="faq-question w-full p-5 text-left text-sm sm:text-base font-bold text-white flex items-center justify-between transition hover:text-teal-400">
            <span>Tôi có thể cài đặt trên những phiên bản Windows nào?</span>
            <svg class="faq-icon w-5 h-5 text-slate-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
          <div class="faq-answer hidden px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
            Phiên bản hiện tại được tối ưu hóa chuyên biệt cho <strong>Windows 10 và Windows 11 (64-bit)</strong>. File cài đặt độc lập dạng <code>.exe</code>, chỉ cần tải về và mở lên là có thể sử dụng ngay.
          </div>
        </div>

      </div>

    </div>
  </section>

  <!-- ================= DOWNLOAD CALL TO ACTION ================= -->
  <section class="py-20 relative overflow-hidden">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      
      <div class="glass-card rounded-3xl p-8 sm:p-12 md:p-16 text-center border-teal-500/40 relative overflow-hidden">
        <div class="ambient-glow ambient-teal w-[300px] h-[300px] -top-20 -left-20"></div>
        <div class="ambient-glow ambient-cyan w-[300px] h-[300px] -bottom-20 -right-20"></div>

        <div class="relative z-10">
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
            Bắt Đầu Bảo Vệ Đôi Mắt & Tư Thế Của Bạn Ngay Hôm Nay
          </h2>
          <p class="mt-4 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Hàng ngàn người làm việc văn phòng đã hình thành thói quen ngồi máy tính lành mạnh hơn cùng EyePosture. Tải về và trải nghiệm hoàn toàn miễn phí.
          </p>

          <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button class="trigger-download btn-glow text-slate-950 font-extrabold px-8 py-4 rounded-2xl text-base flex items-center justify-center gap-3 w-full sm:w-auto shadow-2xl">
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.902-1.799"/></svg>
              <span>Tải File EyePosture.exe (Windows 64-bit)</span>
            </button>
            <a href="/admin" class="glass-card hover:bg-slate-800 text-white font-semibold px-6 py-4 rounded-2xl text-sm border border-slate-700 transition">
              Cổng Quản Trị Hệ Thống (/admin)
            </a>
          </div>

          <div class="mt-6 text-xs text-slate-400 font-mono">
            Bản cài đặt chính thức v1.0.0 • Tương thích Windows 10 & 11 • Dung lượng ~180MB
          </div>
        </div>

      </div>

    </div>
  </section>

  <!-- ================= DOWNLOAD MODAL POPUP ================= -->
  <div id="download-modal" class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
    <div class="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-teal-500/40 relative modal-enter shadow-2xl bg-slate-900/95">
      
      <!-- Close Button -->
      <button id="close-modal-btn" class="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition" aria-label="Đóng">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>

      <!-- Modal Header -->
      <div class="flex items-center gap-3 mb-5">
        <img src="/EyePosture.png" alt="EyePosture Logo" class="w-12 h-12 rounded-2xl object-contain shadow-md border border-teal-500/30 bg-slate-950 p-1" />
        <div>
          <h3 class="text-lg font-extrabold text-white">Đang Tải EyePosture Cho Windows</h3>
          <p class="text-xs text-teal-400">Phiên bản v1.0.0 (Windows 64-bit)</p>
        </div>
      </div>

      <!-- Loading / Instruction Notice -->
      <div class="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 mb-5">
        <div class="flex items-center gap-2.5 text-xs text-slate-200 mb-2 font-semibold">
          <span class="pulse-dot"></span>
          <span>Tệp cài đặt .exe sẽ tự động tải xuống trong giây lát...</span>
        </div>
        <p class="text-[11px] text-slate-400 leading-relaxed">
          Nếu trình duyệt không tự động tải, hãy bấm nút tải trực tiếp bên dưới hoặc tải qua GitHub Releases chính thức.
        </p>
      </div>

      <!-- Quick Setup Instructions -->
      <div class="space-y-3 mb-6 text-xs text-slate-300">
        <div class="font-bold text-white uppercase text-[11px] tracking-wider text-slate-400">3 Bước Cài Đặt Nhanh:</div>
        <div class="flex items-start gap-2.5">
          <span class="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 text-[10px] font-bold">1</span>
          <span>Mở file <strong>EyePosture.exe</strong> trong thư mục Downloads của bạn.</span>
        </div>
        <div class="flex items-start gap-2.5">
          <span class="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 text-[10px] font-bold">2</span>
          <span>Cho phép quyền camera (xử lý 100% On-Device, không gửi ảnh đi bất cứ đâu).</span>
        </div>
        <div class="flex items-start gap-2.5">
          <span class="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 text-[10px] font-bold">3</span>
          <span>Ứng dụng chạy ngầm dưới góc phải màn hình (System Tray), sẵn sàng bảo vệ mắt!</span>
        </div>
      </div>

      <!-- Direct Link Buttons -->
      <div class="flex flex-col sm:flex-row gap-3">
        <a href="/download/win" class="btn-glow text-slate-950 font-bold py-3 px-4 rounded-xl text-xs text-center flex-1 flex items-center justify-center gap-2">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.902-1.799"/></svg>
          Tải Trực Tiếp (.exe)
        </a>
        <a href="https://github.com/ndhung23/EyePosture-Smart-Screen-Wellness-Assistant/releases" target="_blank" rel="noopener" class="glass-card hover:bg-slate-800 text-slate-300 hover:text-white font-semibold py-3 px-4 rounded-xl text-xs text-center flex-1 border border-slate-700 transition flex items-center justify-center gap-1.5">
          <span>GitHub Releases</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
        </a>
      </div>

    </div>
  </div>

  <!-- ================= FOOTER ================= -->
  <footer class="border-t border-slate-900 bg-slate-950 text-slate-400 text-xs py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
      
      <div class="flex items-center gap-3">
        <img src="/EyePosture.png" alt="EyePosture Logo" class="w-8 h-8 rounded-xl object-contain border border-slate-800 bg-slate-900" />
        <div>
          <div class="font-bold text-white text-sm">EyePosture</div>
          <div class="text-[11px] text-slate-500">Smart Screen Wellness Assistant © 2026</div>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-6 text-slate-400">
        <a href="#features" class="hover:text-teal-400 transition">Tính Năng</a>
        <a href="#privacy" class="hover:text-teal-400 transition">Bảo Mật Local</a>
        <a href="/download/win" class="hover:text-teal-400 transition">Tải Cho Windows</a>
        <a href="/admin" class="hover:text-teal-400 transition">Quản Trị Hub</a>
        <a href="https://github.com/ndhung23/EyePosture-Smart-Screen-Wellness-Assistant" target="_blank" rel="noopener" class="hover:text-teal-400 transition flex items-center gap-1">
          GitHub Repo
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
        </a>
      </div>

    </div>
  </footer>

  <!-- Auth Login Modal -->
  ${loginModal}

  <!-- Client-side Interactive Scripts -->
  <script>
    ${scripts}
  </script>
</body>
</html>
`;
}
