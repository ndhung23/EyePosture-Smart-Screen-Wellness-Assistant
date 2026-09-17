export function getAdminLoginGateHtml(): string {
  return `
  <!-- ================= ADMIN AUTH GATEKEEPER ================= -->
  <div id="admin-auth-gate" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950 backdrop-blur-xl">
    <div class="relative w-full max-w-md rounded-3xl border border-teal-500/30 bg-slate-900/95 p-8 shadow-2xl shadow-teal-500/15">
      
      <!-- Top Glow Icon -->
      <div class="flex justify-center mb-6">
        <div class="w-16 h-16 rounded-2xl bg-teal-500/15 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-xl shadow-teal-500/20">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
        </div>
      </div>

      <!-- Title & Description -->
      <div class="text-center mb-7">
        <h2 class="text-2xl font-extrabold text-white tracking-tight">Khu Vực Quản Trị Hệ Thống</h2>
        <p class="text-xs text-slate-400 mt-1.5 leading-relaxed">
          Khu vực hạn chế. Vui lòng đăng nhập bằng tài khoản <strong class="text-teal-300">Quản trị viên (ADMIN)</strong> để truy cập bảng điều khiển.
        </p>
      </div>

      <!-- Login Form -->
      <form id="admin-gate-form" class="space-y-4">
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-slate-300">Tài khoản / Email Quản Trị</label>
          <input 
            type="text" 
            id="gate-email" 
            required 
            placeholder="admin hoặc email quản trị"
            class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition"
          />
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-slate-300">Mật khẩu</label>
          <input 
            type="password" 
            id="gate-password" 
            required 
            placeholder="••••••••"
            class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition"
          />
        </div>

        <!-- Error Message Banner -->
        <div id="gate-error-box" class="hidden p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <svg class="w-4 h-4 shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span id="gate-error-text">Sai thông tin đăng nhập quản trị</span>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          id="btn-gate-submit"
          class="w-full py-3 rounded-xl gradient-teal text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:scale-[0.98] transition mt-2"
        >
          <span>Mở Khóa Quản Trị Hub</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </button>
      </form>

      <!-- Return to Homepage Link -->
      <div class="mt-6 text-center">
        <a href="/" class="text-xs text-slate-400 hover:text-teal-400 transition flex items-center justify-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          <span>Quay lại Trang Chủ EyePosture</span>
        </a>
      </div>

    </div>
  </div>
  `;
}
