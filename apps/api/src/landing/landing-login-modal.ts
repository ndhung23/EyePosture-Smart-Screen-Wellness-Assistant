export function getLoginModalHtml(): string {
  return `
  <!-- ================= AUTH MODAL (LOGIN / REGISTER / FORGOT PASSWORD) ================= -->
  <div id="login-modal" class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all">
    <div class="relative w-full max-w-md rounded-3xl border border-slate-700/80 dark:border-slate-700/80 light:border-slate-200 bg-slate-900/95 dark:bg-slate-900/95 light:bg-white p-6 sm:p-8 shadow-2xl shadow-teal-500/10 animate-fadeIn transition-colors">
      
      <!-- Close Button -->
      <button id="close-login-modal" class="absolute top-5 right-5 text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 p-1.5 rounded-xl hover:bg-slate-800/60 dark:hover:bg-slate-800/60 light:hover:bg-slate-100 transition" aria-label="Đóng">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <!-- Modal Header with App Icon -->
      <div class="flex items-center gap-3.5 mb-6">
        <div class="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-md shadow-teal-500/20 shrink-0">
          <svg id="auth-modal-icon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
          </svg>
        </div>
        <div>
          <h3 id="auth-modal-title" class="text-xl font-extrabold text-white dark:text-white light:text-slate-900 tracking-tight">Tài Khoản EyePosture</h3>
          <p id="auth-modal-subtitle" class="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">Đăng nhập tài khoản hoặc đăng ký mới</p>
        </div>
      </div>

      <!-- Navigation Tabs (Login / Register / Forgot) -->
      <div class="flex rounded-xl bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-100 p-1 mb-5 border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200">
        <button type="button" id="tab-btn-login" onclick="switchAuthTab('login')" class="flex-1 py-2 text-xs font-bold rounded-lg transition-all text-teal-300 dark:text-teal-300 light:text-teal-700 bg-slate-800/90 dark:bg-slate-800/90 light:bg-white shadow-sm">
          Đăng Nhập
        </button>
        <button type="button" id="tab-btn-register" onclick="switchAuthTab('register')" class="flex-1 py-2 text-xs font-semibold rounded-lg transition-all text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-slate-200">
          Đăng Ký
        </button>
        <button type="button" id="tab-btn-forgot" onclick="switchAuthTab('forgot')" class="flex-1 py-2 text-xs font-semibold rounded-lg transition-all text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-slate-200">
          Quên Mật Khẩu
        </button>
      </div>

      <!-- Notification Alerts -->
      <div id="auth-error-box" class="hidden mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
        <svg class="w-4 h-4 shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span id="auth-error-text">Thông tin không chính xác</span>
      </div>

      <div id="auth-success-box" class="hidden mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
        <svg class="w-4 h-4 shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <span id="auth-success-text">Thành công!</span>
      </div>

      <!-- ================= 1. TAB LOGIN ================= -->
      <form id="landing-login-form" class="space-y-4">
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700">Tài khoản / Email</label>
          <input 
            type="text" 
            id="login-email" 
            required 
            placeholder="admin hoặc email@domain.com"
            class="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 text-sm text-slate-100 dark:text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition"
          />
        </div>

        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700">Mật khẩu</label>
            <button type="button" onclick="switchAuthTab('forgot')" class="text-[11px] text-teal-400 dark:text-teal-400 light:text-teal-600 hover:underline">Quên mật khẩu?</button>
          </div>
          <div class="relative">
            <input 
              type="password" 
              id="login-password" 
              required 
              placeholder="••••••••"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 text-sm text-slate-100 dark:text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition pr-10"
            />
            <button type="button" onclick="togglePasswordVisibility('login-password')" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          id="btn-login-submit"
          class="w-full py-3 rounded-xl btn-glow text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-lg shadow-teal-500/20"
        >
          <span>Đăng Nhập Ngay</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </button>

        <div class="text-center pt-2">
          <span class="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">Chưa có tài khoản? </span>
          <button type="button" onclick="switchAuthTab('register')" class="text-xs font-bold text-teal-400 dark:text-teal-400 light:text-teal-600 hover:underline">
            Đăng ký tài khoản miễn phí
          </button>
        </div>
      </form>

      <!-- ================= 2. TAB REGISTER ================= -->
      <form id="landing-register-form" class="space-y-3.5 hidden">
        <div class="space-y-1">
          <label class="text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700">Họ và tên</label>
          <input 
            type="text" 
            id="register-name" 
            required 
            placeholder="Nguyễn Văn A"
            class="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 text-sm text-slate-100 dark:text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700">Địa chỉ Email</label>
          <input 
            type="email" 
            id="register-email" 
            required 
            placeholder="email@example.com"
            class="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 text-sm text-slate-100 dark:text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700">Mật khẩu mới</label>
          <div class="relative">
            <input 
              type="password" 
              id="register-password" 
              required 
              placeholder="Tối thiểu 4 ký tự"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 text-sm text-slate-100 dark:text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition pr-10"
            />
            <button type="button" onclick="togglePasswordVisibility('register-password')" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
          </div>
        </div>

        <div class="space-y-1">
          <label class="text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700">Xác nhận mật khẩu</label>
          <input 
            type="password" 
            id="register-confirm-password" 
            required 
            placeholder="Nhập lại mật khẩu"
            class="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 text-sm text-slate-100 dark:text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition"
          />
        </div>

        <button 
          type="submit" 
          id="btn-register-submit"
          class="w-full py-3 rounded-xl btn-glow text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-lg shadow-teal-500/20 mt-2"
        >
          <span>Đăng Ký Tài Khoản</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </button>

        <div class="text-center pt-2">
          <span class="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">Đã có tài khoản? </span>
          <button type="button" onclick="switchAuthTab('login')" class="text-xs font-bold text-teal-400 dark:text-teal-400 light:text-teal-600 hover:underline">
            Đăng nhập ngay
          </button>
        </div>
      </form>

      <!-- ================= 3. TAB FORGOT PASSWORD ================= -->
      <div id="landing-forgot-container" class="space-y-4 hidden">
        <!-- Step 1: Request OTP -->
        <form id="form-forgot-step1" class="space-y-4">
          <p class="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">
            Nhập email tài khoản của bạn để nhận mã xác thực OTP khôi phục mật khẩu.
          </p>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700">Email đăng ký</label>
            <input 
              type="email" 
              id="forgot-email" 
              required 
              placeholder="email@example.com"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 text-sm text-slate-100 dark:text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition"
            />
          </div>

          <button 
            type="submit" 
            id="btn-forgot-step1-submit"
            class="w-full py-3 rounded-xl btn-glow text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-lg shadow-teal-500/20"
          >
            <span>Gửi Mã Xác Nhận OTP</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </form>

        <!-- Step 2: Enter OTP & New Password -->
        <form id="form-forgot-step2" class="space-y-3.5 hidden">
          <div class="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300 space-y-1">
            <div class="font-bold flex items-center gap-1.5">
              <span>✓ Mã OTP đã được gửi</span>
            </div>
            <p id="forgot-otp-hint" class="text-[11px] text-slate-300 dark:text-slate-300 light:text-slate-600">
              Kiểm tra hộp thư đến của bạn để lấy mã xác thực 6 số.
            </p>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700">Mã xác thực OTP (6 chữ số)</label>
            <input 
              type="text" 
              id="forgot-code" 
              required 
              maxlength="6"
              placeholder="VD: 123456"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 text-center font-mono tracking-widest text-base font-bold text-teal-300 focus:outline-none focus:border-teal-500 transition"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700">Mật khẩu mới</label>
            <input 
              type="password" 
              id="forgot-new-password" 
              required 
              placeholder="Ít nhất 4 ký tự"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 text-sm text-slate-100 dark:text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700">Xác nhận mật khẩu mới</label>
            <input 
              type="password" 
              id="forgot-confirm-password" 
              required 
              placeholder="Nhập lại mật khẩu mới"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 text-sm text-slate-100 dark:text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition"
            />
          </div>

          <button 
            type="submit" 
            id="btn-forgot-step2-submit"
            class="w-full py-3 rounded-xl btn-glow text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-lg shadow-teal-500/20 mt-2"
          >
            <span>Đặt Lại Mật Khẩu</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </button>

          <button type="button" onclick="resetForgotFlow()" class="w-full text-center text-xs text-slate-400 hover:text-slate-200 py-1">
            ← Nhập lại email khác
          </button>
        </form>

        <div class="text-center pt-1">
          <button type="button" onclick="switchAuthTab('login')" class="text-xs font-bold text-teal-400 dark:text-teal-400 light:text-teal-600 hover:underline">
            ← Quay lại đăng nhập
          </button>
        </div>
      </div>

    </div>
  </div>
  `;
}
