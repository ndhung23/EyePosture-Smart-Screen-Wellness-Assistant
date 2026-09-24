import { getDashboardStyles } from './dashboard-styles.js';
import { getDashboardScripts } from './dashboard-scripts.js';
import { getAdminLoginGateHtml } from './admin-login-gate-html.js';

export function getAdminDashboardHtml(): string {
  const styles = getDashboardStyles();
  const scripts = getDashboardScripts();
  const adminGate = getAdminLoginGateHtml();

  return `<!DOCTYPE html>
<html lang="vi" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EyePosture Admin Dashboard - Thống Kê, Quản Trị Người Dùng & Voucher</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" href="/EyePosture.png">
  <script>
    (function() {
      try {
        const theme = localStorage.getItem('eyeposture_theme') || 'dark';
        if (theme === 'light') {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
          document.documentElement.classList.add('dark');
        }
      } catch (e) {}
    })();
  </script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class'
    };
  </script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    ${styles}
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-teal-500/30">

  <!-- Dashboard Container (Hidden until admin authenticated) -->
  <div id="dashboard-wrapper" style="display: none;" class="hidden flex min-h-screen w-full">

  <!-- ================= LEFT SIDEBAR ================= -->
  <aside class="w-64 glass-sidebar flex flex-col justify-between shrink-0 fixed top-0 bottom-0 left-0 z-30">
    <div>
      <!-- Brand Logo & Title -->
      <div class="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <img src="/EyePosture.png" alt="EyePosture Icon" class="w-10 h-10 rounded-xl object-contain shadow-lg shadow-teal-500/20 border border-teal-500/30 bg-slate-900" />
        <div>
          <div class="font-extrabold text-base tracking-tight brand-font flex items-center gap-1.5 text-slate-100">
            EyePosture <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">HUB</span>
          </div>
          <div class="text-[11px] text-slate-400">Quản Trị & Doanh Thu</div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="p-3 space-y-1 text-xs">
        <div class="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Bảng Điều Khiển</div>
        
        <!-- Tab 1: Dashboard -->
        <a href="#dashboard" data-tab="dashboard" class="nav-item active flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 transition">
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            <span>Dashboard & Doanh Số</span>
          </div>
          <span class="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.2 rounded font-mono">LIVE</span>
        </a>

        <!-- Tab 2: Users (Dạng Bảng Table) -->
        <a href="#users" data-tab="users" class="nav-item flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 transition">
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Quản Lý Người Dùng</span>
          </div>
          <span id="sidebar-user-count" class="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">0</span>
        </a>

        <!-- Tab 3: Vouchers (Mã Giảm Giá) -->
        <a href="#vouchers" data-tab="vouchers" class="nav-item flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 transition">
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
            <span>Voucher & Khuyến Mãi</span>
          </div>
          <span id="sidebar-voucher-count" class="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-mono">0</span>
        </a>

        <div class="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Phần Cứng & Cổng Tiền</div>

        <!-- Tab 4: Thiết Bị -->
        <a href="#devices" data-tab="devices" class="nav-item flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 transition">
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
            <span>Quản Lý Thiết Bị</span>
          </div>
          <span id="sidebar-device-count" class="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">0</span>
        </a>

        <!-- Tab 5: SePay VietQR -->
        <a href="#sepay" data-tab="sepay" class="nav-item flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 transition">
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            <span>Cổng SePay VietQR</span>
          </div>
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </a>
      </nav>
    </div>

    <!-- Sidebar Footer: Admin Profile & Logout -->
    <div class="p-3 border-t border-slate-800/80 bg-slate-900/50">
      <div class="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
        <div class="flex items-center gap-2.5 overflow-hidden">
          <div class="w-8 h-8 rounded-lg gradient-teal flex items-center justify-center font-bold text-slate-950 text-xs shrink-0">
            A
          </div>
          <div class="overflow-hidden">
            <div id="admin-profile-name" class="font-bold text-xs text-slate-200 truncate">Administrator</div>
            <div class="text-[10px] text-teal-400 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-teal-400"></span> Super Admin
            </div>
          </div>
        </div>
        <button id="btn-admin-logout" title="Khóa bảng điều khiển & Đăng xuất" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition shrink-0" aria-label="Đăng xuất">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        </button>
      </div>
    </div>
  </aside>

  <!-- ================= RIGHT CONTENT AREA ================= -->
  <main class="flex-1 pl-64 flex flex-col min-w-0">
    
    <!-- Top Header Bar -->
    <header class="h-16 glass-card border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      <div class="flex items-center gap-3">
        <span id="top-breadcrumb" class="font-bold text-sm text-slate-100 brand-font">Tổng Quan & Biểu Đồ Thống Kê</span>
        <span class="text-xs text-slate-500">•</span>
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px]">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> SePay & Cloud API: Online
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Global Search Input -->
        <div class="relative w-64 md:w-80">
          <svg class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" oninput="searchAll(this.value)" placeholder="Tìm người dùng, voucher, máy tính..." class="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition">
        </div>

        <!-- Theme Toggle Button -->
        <button id="btn-admin-theme-toggle" onclick="toggleAdminTheme()" class="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition" title="Chuyển chế độ Sáng / Tối">
          <span id="admin-theme-icon">🌓</span>
          <span class="hidden sm:inline text-[11px]" id="admin-theme-label">Giao diện</span>
        </button>

        <!-- Refresh Button -->
        <button onclick="loadAllData()" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition">
          <svg id="refresh-icon" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
          <span>Làm mới</span>
        </button>
      </div>
    </header>

    <!-- Main Content Container -->
    <div class="p-6 space-y-6">

      <!-- ================= 1. PANEL DASHBOARD ================= -->
      <section id="panel-dashboard" class="tab-panel space-y-6">
        
        <!-- KPI Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Card 1: Doanh số SePay -->
          <div class="glass-card rounded-2xl p-4 space-y-2">
            <div class="flex items-center justify-between text-slate-400 text-xs">
              <span class="font-medium">Tổng Doanh Số (SePay)</span>
              <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
              </div>
            </div>
            <div class="text-2xl font-black text-slate-100 brand-font" id="kpi-revenue">0 đ</div>
            <div class="text-[11px] text-emerald-400 flex items-center gap-1">
              <span>↑ Tự động kích hoạt qua VietQR BIDV</span>
            </div>
          </div>

          <!-- Card 2: Người dùng -->
          <div class="glass-card rounded-2xl p-4 space-y-2">
            <div class="flex items-center justify-between text-slate-400 text-xs">
              <span class="font-medium">Tổng Người Dùng</span>
              <div class="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </div>
            </div>
            <div class="text-2xl font-black text-slate-100 brand-font" id="kpi-total-users">0</div>
            <div class="text-[11px] text-slate-400">Tài khoản đăng ký hệ thống</div>
          </div>

          <!-- Card 3: Máy hoạt động -->
          <div class="glass-card rounded-2xl p-4 space-y-2">
            <div class="flex items-center justify-between text-slate-400 text-xs">
              <span class="font-medium">Thiết Bị Đang Chạy</span>
              <div class="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
              </div>
            </div>
            <div class="text-2xl font-black text-slate-100 brand-font" id="kpi-active-devices">0</div>
            <div class="text-[11px] text-teal-400">Máy tính online / Tổng số máy</div>
          </div>

          <!-- Card 4: Tỷ lệ Pro -->
          <div class="glass-card rounded-2xl p-4 space-y-2">
            <div class="flex items-center justify-between text-slate-400 text-xs">
              <span class="font-medium">Tỷ Lệ Bản Quyền PRO</span>
              <div class="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
            </div>
            <div class="text-2xl font-black text-slate-100 brand-font" id="kpi-pro-rate">0%</div>
            <div class="text-[11px] text-amber-400">Chuyển đổi khách hàng trả phí</div>
          </div>
        </div>

        <!-- Biểu đồ 1: Doanh số SePay VNĐ -->
        <div class="glass-card rounded-2xl p-5 space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-bold text-sm text-slate-100 brand-font">Biểu Đồ Doanh Số VietQR Theo Ngày (VNĐ)</h3>
              <p class="text-xs text-slate-400">Dòng tiền thanh toán tự động ghi nhận qua Webhook SePay</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
              <span class="text-xs text-slate-300 font-medium">Doanh thu VNĐ</span>
            </div>
          </div>
          <div class="chart-box">
            <canvas id="chart-revenue"></canvas>
          </div>
        </div>

        <!-- Biểu đồ 2 & 3: Thống kê Người Dùng & Phân Bổ Gói -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div class="glass-card rounded-2xl p-5 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-sm text-slate-100 brand-font">Biểu Đồ Thống Kê Người Dùng</h3>
                <p class="text-xs text-slate-400">Tăng trưởng người dùng mới & tài khoản hoạt động</p>
              </div>
            </div>
            <div class="chart-box-sm">
              <canvas id="chart-users"></canvas>
            </div>
          </div>

          <div class="glass-card rounded-2xl p-5 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-sm text-slate-100 brand-font">Cơ Cấu Bản Quyền (Tier Distribution)</h3>
                <p class="text-xs text-slate-400">Tỷ lệ các gói Free, Pro và Family</p>
              </div>
            </div>
            <div class="chart-box-sm flex items-center justify-center">
              <canvas id="chart-tier"></canvas>
            </div>
          </div>
        </div>

      </section>

      <!-- ================= 2. PANEL USERS (DẠNG TABLE QUẢN LÝ) ================= -->
      <section id="panel-users" class="tab-panel space-y-4 hidden">
        
        <!-- Filter Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 glass-card rounded-2xl">
          <div class="flex items-center gap-1.5 text-xs flex-wrap">
            <span class="text-slate-400 font-medium mr-1">Bộ lọc:</span>
            <button data-filter="all" class="user-filter-btn px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold transition">Tất Cả</button>
            <button data-filter="pro" class="user-filter-btn px-3 py-1.5 rounded-lg text-slate-400 border border-slate-800 hover:bg-slate-800/60 transition">Gói Pro / Family</button>
            <button data-filter="free" class="user-filter-btn px-3 py-1.5 rounded-lg text-slate-400 border border-slate-800 hover:bg-slate-800/60 transition">Gói Miễn Phí</button>
            <button data-filter="blocked" class="user-filter-btn px-3 py-1.5 rounded-lg text-slate-400 border border-slate-800 hover:bg-slate-800/60 transition">Đang Bị Khóa</button>
          </div>
          <div class="text-xs text-slate-400">
            Quản lý quyền sử dụng, số máy liên kết & cấp phép bản quyền
          </div>
        </div>

        <!-- Users Table Container -->
        <div class="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-900/30 glass-card">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th class="py-3.5 px-4 font-bold">Người Dùng</th>
                <th class="py-3.5 px-4 font-bold">Gói Bản Quyền</th>
                <th class="py-3.5 px-4 font-bold">Trạng Thái</th>
                <th class="py-3.5 px-4 font-bold">Thiết Bị Liên Kết</th>
                <th class="py-3.5 px-4 font-bold">Ngày Đăng Ký</th>
                <th class="py-3.5 px-4 font-bold text-right">Thao Tác Quản Trị</th>
              </tr>
            </thead>
            <tbody id="users-table-body" class="divide-y divide-slate-800/50">
              <tr>
                <td colspan="6" class="text-center py-10 text-slate-500">Đang tải danh sách người dùng...</td>
              </tr>
            </tbody>
          </table>
        </div>

      </section>

      <!-- ================= 3. PANEL VOUCHERS (QUẢN LÝ MÃ GIẢM GIÁ) ================= -->
      <section id="panel-vouchers" class="tab-panel space-y-6 hidden">
        
        <!-- Voucher KPI Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="glass-card rounded-2xl p-4 space-y-1">
            <div class="text-xs text-slate-400">Tổng Số Voucher</div>
            <div class="text-2xl font-black text-rose-400 brand-font" id="kpi-voucher-total">0</div>
            <div class="text-[11px] text-slate-500">Chiến dịch khuyến mãi đã tạo</div>
          </div>
          <div class="glass-card rounded-2xl p-4 space-y-1">
            <div class="text-xs text-slate-400">Đang Có Hiệu Lực</div>
            <div class="text-2xl font-black text-emerald-400 brand-font" id="kpi-voucher-active">0</div>
            <div class="text-[11px] text-emerald-400">Sẵn sàng để khách nhập áp dụng</div>
          </div>
          <div class="glass-card rounded-2xl p-4 space-y-1">
            <div class="text-xs text-slate-400">Lượt Đã Sử Dụng</div>
            <div class="text-2xl font-black text-teal-300 brand-font" id="kpi-voucher-used">0</div>
            <div class="text-[11px] text-teal-400">Tổng số lượt giảm giá thành công</div>
          </div>
        </div>

        <!-- Create Voucher Box -->
        <div class="glass-card rounded-2xl p-5 space-y-4 border border-rose-500/20">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold">
                %
              </div>
              <div>
                <h3 class="font-bold text-sm text-slate-100 brand-font">Tạo Voucher Giảm Giá Mới</h3>
                <p class="text-xs text-slate-400">Tùy chỉnh phần trăm giảm giá và thời gian giới hạn của voucher</p>
              </div>
            </div>
            <button type="button" onclick="autoGenerateVoucherCode()" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-xs font-medium transition">
              ⚡ Tự Sinh Mã Ngẫu Nhiên
            </button>
          </div>

          <form id="create-voucher-form" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Mã Voucher -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-300">Mã Voucher (Code)</label>
              <input 
                type="text" 
                id="new-voucher-code" 
                required 
                placeholder="VD: EYECARE30"
                class="w-full uppercase font-mono px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-teal-300 font-bold focus:outline-none focus:border-rose-500 transition"
              />
            </div>

            <!-- % Giảm Giá -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="text-xs font-semibold text-slate-300">% Giảm Giá (1 - 100%)</label>
                <div class="flex gap-1">
                  <button type="button" onclick="setDiscountPreset(20)" class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono">20%</button>
                  <button type="button" onclick="setDiscountPreset(30)" class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono">30%</button>
                  <button type="button" onclick="setDiscountPreset(50)" class="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold">50%</button>
                </div>
              </div>
              <input 
                type="number" 
                id="new-voucher-discount" 
                required 
                min="1" 
                max="100" 
                value="20"
                class="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-bold focus:outline-none focus:border-rose-500 transition"
              />
            </div>

            <!-- Thời Gian Giới Hạn -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="text-xs font-semibold text-slate-300">Hạn Chót Sử Dụng</label>
                <div class="flex gap-1">
                  <button type="button" onclick="setExpiryDaysPreset(7)" class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">7 ngày</button>
                  <button type="button" onclick="setExpiryDaysPreset(30)" class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">30 ngày</button>
                  <button type="button" onclick="setExpiryDaysPreset(90)" class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">90 ngày</button>
                </div>
              </div>
              <input 
                type="datetime-local" 
                id="new-voucher-expiry" 
                required 
                class="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-rose-500 transition"
              />
            </div>

            <!-- Giới hạn lượt dùng & Nút Submit -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-300">Giới Hạn Lượt Dùng (0 = Vô hạn)</label>
              <input 
                type="number" 
                id="new-voucher-max-uses" 
                min="0" 
                value="0"
                placeholder="0"
                class="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-rose-500 transition"
              />
            </div>

            <!-- Mô tả voucher -->
            <div class="lg:col-span-3 space-y-1.5">
              <label class="text-xs font-semibold text-slate-300">Mô Tả / Chiến Dịch</label>
              <input 
                type="text" 
                id="new-voucher-desc" 
                placeholder="VD: Khuyến mãi mừng năm học mới cho học sinh sinh viên"
                class="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-rose-500 transition"
              />
            </div>

            <!-- Button Submit -->
            <div class="flex items-end">
              <button 
                type="submit" 
                class="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-lg shadow-rose-500/25 active:scale-95 transition"
              >
                + Thêm Voucher Mới
              </button>
            </div>
          </form>
        </div>

        <!-- Voucher Data Table -->
        <div class="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-900/30 glass-card">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th class="py-3.5 px-4 font-bold">Mã Voucher</th>
                <th class="py-3.5 px-4 font-bold">Mức Giảm</th>
                <th class="py-3.5 px-4 font-bold">Hạn Sử Dụng</th>
                <th class="py-3.5 px-4 font-bold">Lượt Đã Dùng</th>
                <th class="py-3.5 px-4 font-bold">Mô Tả</th>
                <th class="py-3.5 px-4 font-bold">Trạng Thái</th>
                <th class="py-3.5 px-4 font-bold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody id="vouchers-table-body" class="divide-y divide-slate-800/50">
              <tr>
                <td colspan="7" class="text-center py-10 text-slate-500">Đang tải danh sách voucher...</td>
              </tr>
            </tbody>
          </table>
        </div>

      </section>

      <!-- ================= 4. PANEL DEVICES ================= -->
      <section id="panel-devices" class="tab-panel space-y-4 hidden">
        <div class="overflow-x-auto rounded-2xl border border-slate-800/80 glass-card">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th class="py-3.5 px-4 font-bold">Thiết Bị / Máy Tính</th>
                <th class="py-3.5 px-4 font-bold">Chủ Sở Hữu</th>
                <th class="py-3.5 px-4 font-bold">Mã Phần Cứng (Fingerprint)</th>
                <th class="py-3.5 px-4 font-bold">Trạng Thái</th>
                <th class="py-3.5 px-4 font-bold">Hoạt Động Gần Nhất</th>
                <th class="py-3.5 px-4 font-bold text-right">Thao Tác Quản Trị</th>
              </tr>
            </thead>
            <tbody id="devices-table-body" class="divide-y divide-slate-800/50 bg-slate-900/30">
              <tr>
                <td colspan="6" class="text-center py-10 text-slate-500">Đang tải dữ liệu phần cứng...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ================= 5. PANEL SEPAY VIETQR ================= -->
      <section id="panel-sepay" class="tab-panel space-y-5 hidden">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div class="text-[11px] text-slate-400 uppercase">Ngân hàng thụ hưởng</div>
            <div class="font-bold text-sm text-slate-200">BIDV (Ngân hàng Đầu tư & Phát triển Việt Nam)</div>
          </div>
          <div class="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div class="text-[11px] text-slate-400 uppercase">Số tài khoản</div>
            <div class="font-mono font-bold text-sm text-teal-300">4661398013</div>
          </div>
          <div class="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div class="text-[11px] text-slate-400 uppercase">Chủ tài khoản</div>
            <div class="font-bold text-sm text-slate-200">NGUYEN DUY HUNG</div>
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-teal-950/20 border border-teal-500/30 space-y-3">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <h3 class="font-bold text-sm text-teal-200">Kiểm tra & Mô phỏng Webhook SePay (Sandbox Test)</h3>
          </div>
          <p class="text-xs text-slate-400">
            Khi người dùng quét mã VietQR BIDV thanh toán thành công, SePay sẽ gửi POST tới 
            <code class="bg-slate-900 px-2 py-0.5 rounded text-teal-300 font-mono text-[11px]">/api/v1/billing/webhook/sepay</code>.
            Bạn có thể thử nghiệm tính năng này trực tiếp ngay tại đây:
          </p>
          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <input type="text" id="sim-email" placeholder="Nhập Email người dùng cần kích hoạt Pro..." class="bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs flex-1 focus:outline-none focus:border-teal-500">
            <button onclick="simulateSepayWebhook()" class="px-5 py-2 rounded-xl gradient-teal text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 active:scale-95 transition">
              Bắn Webhook SePay Giả Lập (59.000đ)
            </button>
          </div>
        </div>
      </section>

    </div>
  </main>
  </div> <!-- End #dashboard-wrapper -->

  <!-- Admin Auth Gatekeeper Screen -->
  ${adminGate}

  <!-- Toast Notification Popup -->
  <div id="toast" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none">
    <div class="glass-card border border-teal-500/40 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-2.5 text-xs text-slate-100 bg-slate-900/95" id="toast-box">
      <span id="toast-icon">✓</span>
      <span id="toast-msg">Thành công</span>
    </div>
  </div>

  <script>
    ${scripts}
  </script>
</body>
</html>`;
}
