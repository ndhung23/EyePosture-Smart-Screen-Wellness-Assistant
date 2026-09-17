export function getLoginModalHtml(): string {
  return `
  <!-- ================= AUTH LOGIN MODAL ================= -->
  <div id="login-modal" class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all">
    <div class="relative w-full max-w-md rounded-3xl border border-slate-700/80 bg-slate-900/95 p-6 sm:p-8 shadow-2xl shadow-teal-500/10 animate-fadeIn">
      
      <!-- Close Button -->
      <button id="close-login-modal" class="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition" aria-label="Đóng">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <!-- Modal Header -->
      <div class="flex items-center gap-3.5 mb-6">
        <div class="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-md shadow-teal-500/20">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
          </svg>
        </div>
        <div>
          <h3 class="text-xl font-bold text-white tracking-tight">Đăng Nhập</h3>
          <p class="text-xs text-slate-400">Đăng nhập tài khoản quản trị hoặc người dùng</p>
        </div>
      </div>

      <!-- Login Form -->
      <form id="landing-login-form" class="space-y-4">
        <!-- Identifier Input -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Tài khoản / Email</span>
          </label>
          <input 
            type="text" 
            id="login-email" 
            required 
            placeholder="email@example.com"
            class="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition"
          />
        </div>

        <!-- Password Input -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-slate-300">Mật khẩu</label>
          <input 
            type="password" 
            id="login-password" 
            required 
            placeholder="••••••••"
            class="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition"
          />
        </div>

        <!-- Error Banner -->
        <div id="login-error-box" class="hidden p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <svg class="w-4 h-4 shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span id="login-error-text">Sai tài khoản hoặc mật khẩu</span>
        </div>

        <!-- Success Banner -->
        <div id="login-success-box" class="hidden p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <svg class="w-4 h-4 shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <span id="login-success-text">Đăng nhập thành công!</span>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          id="btn-login-submit"
          class="w-full py-3 rounded-xl btn-glow text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98]"
        >
          <span>Đăng Nhập Ngay</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </button>
      </form>
    </div>
  </div>
  `;
}
