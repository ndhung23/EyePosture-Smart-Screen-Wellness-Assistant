export function getLandingScripts(): string {
  return `
    // ================= THEME TOGGLE (DARK / LIGHT) =================
    function initTheme() {
      const savedTheme = localStorage.getItem('eyeposture_theme') || 'dark';
      applyTheme(savedTheme);
    }

    function applyTheme(theme) {
      const htmlEl = document.documentElement;
      const sunIcon = document.getElementById('icon-sun');
      const moonIcon = document.getElementById('icon-moon');

      if (theme === 'light') {
        htmlEl.classList.remove('dark');
        htmlEl.classList.add('light');
        if (sunIcon) sunIcon.classList.remove('hidden');
        if (moonIcon) moonIcon.classList.add('hidden');
      } else {
        htmlEl.classList.remove('light');
        htmlEl.classList.add('dark');
        if (sunIcon) sunIcon.classList.add('hidden');
        if (moonIcon) moonIcon.classList.remove('hidden');
      }
      localStorage.setItem('eyeposture_theme', theme);
    }

    function toggleTheme() {
      const current = document.documentElement.classList.contains('light') ? 'light' : 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
    }

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', toggleTheme);
    }
    const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle-btn');
    if (mobileThemeToggleBtn) {
      mobileThemeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Initialize theme immediately
    initTheme();

    // Mobile navigation toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }

    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(button => {
      button.addEventListener('click', () => {
        const answer = button.nextElementSibling;
        const icon = button.querySelector('.faq-icon');
        const isExpanded = !answer.classList.contains('hidden');

        document.querySelectorAll('.faq-answer').forEach(a => a.classList.add('hidden'));
        document.querySelectorAll('.faq-icon').forEach(i => i.classList.remove('rotate-180'));

        if (!isExpanded) {
          answer.classList.remove('hidden');
          if (icon) icon.classList.add('rotate-180');
        }
      });
    });

    // Interactive Distance & Posture Simulator
    const distanceSlider = document.getElementById('sim-distance-slider');
    const distanceValueEl = document.getElementById('sim-distance-val');
    const postureSelect = document.getElementById('sim-posture-select');
    const statusPill = document.getElementById('sim-status-pill');
    const adviceText = document.getElementById('sim-advice-text');
    const scoreVal = document.getElementById('sim-score-val');
    const avatarState = document.getElementById('sim-avatar');
    const alertBox = document.getElementById('sim-alert-box');

    function updateSimulation() {
      if (!distanceSlider) return;
      const dist = parseInt(distanceSlider.value, 10);
      if (distanceValueEl) distanceValueEl.textContent = dist + ' cm';

      const posture = postureSelect ? postureSelect.value : 'GOOD';
      let score = 100;
      let statusType = 'SAFE';
      let msg = 'Khoảng cách và tư thế đều lý tưởng. Bạn đang bảo vệ đôi mắt rất tốt!';

      if (dist < 45) {
        score -= 40;
        statusType = 'DANGER';
        msg = '⚠️ CẢNH BÁO: Bạn đang ngồi quá gần màn hình (<45cm)! Hãy lùi xa ít nhất 50cm để tránh cận thị và mỏi mắt.';
      } else if (dist < 50) {
        score -= 20;
        statusType = 'WARNING';
        msg = 'Cảnh giác: Khoảng cách hơi sát màn hình. Nên duy trì từ 55cm đến 70cm.';
      }

      if (posture === 'SLOUCH') {
        score -= 35;
        if (statusType === 'SAFE') {
          statusType = 'WARNING';
          msg = '⚠️ CẢNH BÁO TƯ THẾ: Phát hiện lưng đang cong hoặc cúi đầu quá mức! Hãy nâng vai và giữ thẳng cột sống.';
        } else {
          msg += ' Kèm theo tư thế cúi gù lưng!';
        }
      } else if (posture === 'TILT') {
        score -= 20;
        if (statusType === 'SAFE') {
          statusType = 'WARNING';
          msg = 'Nhắc nhở: Đầu đang bị nghiêng về một bên, dễ gây mỏi cơ cổ một bên.';
        }
      }

      if (scoreVal) scoreVal.textContent = Math.max(10, score) + '/100';

      if (statusPill && adviceText && alertBox && avatarState) {
        if (statusType === 'DANGER') {
          statusPill.className = 'px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1.5';
          statusPill.innerHTML = '<span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> QUÁ GẦN MÀN HÌNH';
          alertBox.className = 'p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 transition';
          avatarState.innerHTML = '🚨';
        } else if (statusType === 'WARNING') {
          statusPill.className = 'px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5';
          statusPill.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> CẦN ĐIỀU CHỈNH';
          alertBox.className = 'p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5 transition';
          avatarState.innerHTML = '⚠️';
        } else {
          statusPill.className = 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5';
          statusPill.innerHTML = '<span class="pulse-dot"></span> CHUẨN CÔNG THÁI HỌC';
          alertBox.className = 'p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2.5 transition';
          avatarState.innerHTML = '✨';
        }
        adviceText.textContent = msg;
      }
    }

    if (distanceSlider) distanceSlider.addEventListener('input', updateSimulation);
    if (postureSelect) postureSelect.addEventListener('change', updateSimulation);

    // Direct Download Logic
    const downloadButtons = document.querySelectorAll('.trigger-download');
    downloadButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/download/win';
      });
    });

    // Interactive 20-20-20 Mini Timer
    let timerSeconds = 20 * 60;
    let timerInterval = null;
    const timerDisplay = document.getElementById('mini-timer-display');
    const timerBtn = document.getElementById('mini-timer-btn');

    function formatTime(sec) {
      const m = Math.floor(sec / 60).toString().padStart(2, '0');
      const s = (sec % 60).toString().padStart(2, '0');
      return m + ':' + s;
    }

    if (timerBtn && timerDisplay) {
      timerBtn.addEventListener('click', () => {
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
          timerBtn.textContent = 'Tiếp Tục';
          timerBtn.className = 'px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg transition';
        } else {
          timerBtn.textContent = 'Tạm Dừng';
          timerBtn.className = 'px-2.5 py-1 text-xs bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded-lg border border-teal-500/30 transition';
          timerInterval = setInterval(() => {
            if (timerSeconds > 0) {
              timerSeconds--;
              timerDisplay.textContent = formatTime(timerSeconds);
            } else {
              clearInterval(timerInterval);
              timerInterval = null;
              timerDisplay.textContent = '00:20 (Nghỉ Mắt)';
              timerDisplay.className = 'text-base font-mono font-bold text-rose-400 animate-bounce';
            }
          }, 1000);
        }
      });
    }

    // ================= AUTH MODAL (LOGIN / REGISTER / FORGOT) =================
    const loginModal = document.getElementById('login-modal');
    const closeLoginModalBtn = document.getElementById('close-login-modal');
    const authErrorBox = document.getElementById('auth-error-box');
    const authErrorText = document.getElementById('auth-error-text');
    const authSuccessBox = document.getElementById('auth-success-box');
    const authSuccessText = document.getElementById('auth-success-text');

    const formLogin = document.getElementById('landing-login-form');
    const formRegister = document.getElementById('landing-register-form');
    const containerForgot = document.getElementById('landing-forgot-container');
    const formForgotStep1 = document.getElementById('form-forgot-step1');
    const formForgotStep2 = document.getElementById('form-forgot-step2');

    const tabBtnLogin = document.getElementById('tab-btn-login');
    const tabBtnRegister = document.getElementById('tab-btn-register');
    const tabBtnForgot = document.getElementById('tab-btn-forgot');

    const navAuthContainer = document.getElementById('nav-auth-container');
    const mobileAuthContainer = document.getElementById('mobile-auth-container');

    window.openLogin = function() {
      if (!loginModal) return;
      clearAuthAlerts();
      switchAuthTab('login');
      loginModal.classList.remove('hidden');
      loginModal.classList.add('flex');
    };

    window.closeLogin = function() {
      if (!loginModal) return;
      loginModal.classList.add('hidden');
      loginModal.classList.remove('flex');
    };

    if (closeLoginModalBtn) closeLoginModalBtn.addEventListener('click', window.closeLogin);
    if (loginModal) {
      loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) window.closeLogin();
      });
    }

    function clearAuthAlerts() {
      if (authErrorBox) authErrorBox.classList.add('hidden');
      if (authSuccessBox) authSuccessBox.classList.add('hidden');
    }

    function showAuthError(msg) {
      if (authErrorBox && authErrorText) {
        authErrorText.textContent = msg;
        authErrorBox.classList.remove('hidden');
      }
      if (authSuccessBox) authSuccessBox.classList.add('hidden');
    }

    function showAuthSuccess(msg) {
      if (authSuccessBox && authSuccessText) {
        authSuccessText.textContent = msg;
        authSuccessBox.classList.remove('hidden');
      }
      if (authErrorBox) authErrorBox.classList.add('hidden');
    }

    window.switchAuthTab = function(tab) {
      clearAuthAlerts();
      const activeClass = 'text-teal-300 dark:text-teal-300 light:text-teal-700 bg-slate-800/90 dark:bg-slate-800/90 light:bg-white shadow-sm font-bold';
      const inactiveClass = 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-slate-200 font-semibold';

      if (formLogin) formLogin.classList.add('hidden');
      if (formRegister) formRegister.classList.add('hidden');
      if (containerForgot) containerForgot.classList.add('hidden');

      if (tabBtnLogin) tabBtnLogin.className = 'flex-1 py-2 text-xs rounded-lg transition-all ' + (tab === 'login' ? activeClass : inactiveClass);
      if (tabBtnRegister) tabBtnRegister.className = 'flex-1 py-2 text-xs rounded-lg transition-all ' + (tab === 'register' ? activeClass : inactiveClass);
      if (tabBtnForgot) tabBtnForgot.className = 'flex-1 py-2 text-xs rounded-lg transition-all ' + (tab === 'forgot' ? activeClass : inactiveClass);

      const titleEl = document.getElementById('auth-modal-title');
      const subEl = document.getElementById('auth-modal-subtitle');

      if (tab === 'login') {
        if (formLogin) formLogin.classList.remove('hidden');
        if (titleEl) titleEl.textContent = 'Đăng Nhập EyePosture';
        if (subEl) subEl.textContent = 'Chào mừng bạn quay trở lại';
      } else if (tab === 'register') {
        if (formRegister) formRegister.classList.remove('hidden');
        if (titleEl) titleEl.textContent = 'Tạo Tài Khoản Mới';
        if (subEl) subEl.textContent = 'Bắt đầu sử dụng trợ lý thị lực AI miễn phí';
      } else if (tab === 'forgot') {
        if (containerForgot) containerForgot.classList.remove('hidden');
        resetForgotFlow();
        if (titleEl) titleEl.textContent = 'Khôi Phục Mật Khẩu';
        if (subEl) subEl.textContent = 'Nhận mã OTP khôi phục tài khoản qua email';
      }
    };

    window.togglePasswordVisibility = function(inputId) {
      const input = document.getElementById(inputId);
      if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
      }
    };

    window.resetForgotFlow = function() {
      if (formForgotStep1) formForgotStep1.classList.remove('hidden');
      if (formForgotStep2) formForgotStep2.classList.add('hidden');
    };

    // 1. Submit Login
    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAuthAlerts();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const submitBtn = document.getElementById('btn-login-submit');

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>Đang xác thực...</span>';
        }

        try {
          const res = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Sai tài khoản hoặc mật khẩu');

          localStorage.setItem('eyeposture_auth_token', data.token);
          localStorage.setItem('eyeposture_auth_user', JSON.stringify(data.user));

          showAuthSuccess('Đăng nhập thành công! Xin chào ' + (data.user.name || data.user.email));
          updateNavAuthState();

          setTimeout(() => {
            window.closeLogin();
            if (data.user && data.user.role === 'ADMIN') {
              window.location.href = '/admin';
            }
          }, 600);
        } catch (err) {
          showAuthError(err.message || 'Lỗi kết nối máy chủ');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Đăng Nhập Ngay</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>';
          }
        }
      });
    }

    // 2. Submit Register
    if (formRegister) {
      formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAuthAlerts();
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const submitBtn = document.getElementById('btn-register-submit');

        if (password !== confirmPassword) {
          showAuthError('Mật khẩu xác nhận không khớp');
          return;
        }

        if (password.length < 4) {
          showAuthError('Mật khẩu phải có ít nhất 4 ký tự');
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>Đang khởi tạo tài khoản...</span>';
        }

        try {
          const res = await fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Đăng ký không thành công');

          localStorage.setItem('eyeposture_auth_token', data.token);
          localStorage.setItem('eyeposture_auth_user', JSON.stringify(data.user));

          showAuthSuccess('Chúc mừng ' + (data.user.name || '') + '! Tài khoản đã được tạo thành công.');
          updateNavAuthState();

          setTimeout(() => {
            window.closeLogin();
          }, 1200);
        } catch (err) {
          showAuthError(err.message || 'Lỗi kết nối');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Đăng Ký Tài Khoản</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
          }
        }
      });
    }

    // 3. Submit Forgot Password Step 1 (Request OTP)
    let forgotUserEmail = '';
    if (formForgotStep1) {
      formForgotStep1.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAuthAlerts();
        const email = document.getElementById('forgot-email').value.trim();
        forgotUserEmail = email;
        const submitBtn = document.getElementById('btn-forgot-step1-submit');

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>Đang gửi mã xác nhận...</span>';
        }

        try {
          const res = await fetch('/api/v1/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Không thể gửi mã xác nhận');

          formForgotStep1.classList.add('hidden');
          formForgotStep2.classList.remove('hidden');

          const hintEl = document.getElementById('forgot-otp-hint');
          if (hintEl) {
            if (data.simulated && data.testCode) {
              hintEl.innerHTML = 'Môi trường Test: Mã OTP của bạn là: <strong class="text-teal-300 font-mono text-xs bg-slate-900 px-2 py-0.5 rounded border border-teal-500/40">' + data.testCode + '</strong>';
              const codeInput = document.getElementById('forgot-code');
              if (codeInput) codeInput.value = data.testCode;
            } else {
              hintEl.textContent = 'Mã xác nhận đã gửi tới ' + email + '. Vui lòng kiểm tra hộp thư.';
            }
          }
          showAuthSuccess('Mã xác thực đã được gửi!');
        } catch (err) {
          showAuthError(err.message || 'Lỗi gửi yêu cầu');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Gửi Mã Xác Nhận OTP</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>';
          }
        }
      });
    }

    // 4. Submit Forgot Password Step 2 (Reset Password)
    if (formForgotStep2) {
      formForgotStep2.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAuthAlerts();
        const code = document.getElementById('forgot-code').value.trim();
        const newPassword = document.getElementById('forgot-new-password').value;
        const confirmPassword = document.getElementById('forgot-confirm-password').value;
        const submitBtn = document.getElementById('btn-forgot-step2-submit');

        if (newPassword !== confirmPassword) {
          showAuthError('Mật khẩu xác nhận không khớp');
          return;
        }

        if (newPassword.length < 4) {
          showAuthError('Mật khẩu mới phải có ít nhất 4 ký tự');
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>Đang cập nhật mật khẩu...</span>';
        }

        try {
          const res = await fetch('/api/v1/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: forgotUserEmail, code, newPassword })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Đặt lại mật khẩu thất bại');

          showAuthSuccess('Đổi mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.');
          setTimeout(() => {
            switchAuthTab('login');
            const loginEmailInput = document.getElementById('login-email');
            if (loginEmailInput) loginEmailInput.value = forgotUserEmail;
          }, 1500);
        } catch (err) {
          showAuthError(err.message || 'Lỗi đặt lại mật khẩu');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Đặt Lại Mật Khẩu</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
          }
        }
      });
    }

    // ================= TOP NAV AUTH STATE =================
    // Removed "Quản Trị Hub" for guests as requested
    function updateNavAuthState() {
      const storedUser = localStorage.getItem('eyeposture_auth_user');
      let user = null;
      try {
        if (storedUser) user = JSON.parse(storedUser);
      } catch {}

      if (navAuthContainer) {
        if (user) {
          const isAdmin = user.role === 'ADMIN';
          navAuthContainer.innerHTML = \`
            <div class="flex items-center gap-2 whitespace-nowrap">
              \${isAdmin ? \`
                <a href="/admin" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-xs font-bold text-teal-300 dark:text-teal-300 light:text-teal-700 transition">
                  <span class="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                  <span>👑 Bảng Quản Trị</span>
                </a>
              \` : \`
                <div class="px-3 py-1.5 rounded-xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 text-xs font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800 flex items-center gap-1.5">
                  <span>👤</span>
                  <span class="max-w-[120px] truncate">\${user.name || user.email}</span>
                </div>
              \`}
              <button id="btn-logout" title="Đăng xuất" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 dark:hover:bg-slate-800/60 light:hover:bg-slate-200 rounded-xl transition" aria-label="Đăng xuất">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              </button>
            </div>
          \`;
          const btnLogout = document.getElementById('btn-logout');
          if (btnLogout) {
            btnLogout.addEventListener('click', () => {
              localStorage.removeItem('eyeposture_auth_token');
              localStorage.removeItem('eyeposture_auth_user');
              updateNavAuthState();
            });
          }
        } else {
          navAuthContainer.innerHTML = \`
            <button onclick="openLogin()" class="px-3.5 py-2 rounded-xl text-xs font-bold text-teal-300 dark:text-teal-300 light:text-teal-700 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 transition flex items-center gap-1.5 whitespace-nowrap shadow-sm">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
              <span>Đăng Nhập / Đăng Ký</span>
            </button>
          \`;
        }
      }

      if (mobileAuthContainer) {
        if (user) {
          const isAdmin = user.role === 'ADMIN';
          mobileAuthContainer.innerHTML = \`
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 text-xs">
              <span class="text-teal-300 font-bold">\${user.name || user.email} \${isAdmin ? '(Admin)' : ''}</span>
              <button id="btn-mobile-logout" class="text-rose-400 font-semibold text-xs hover:underline">Đăng xuất</button>
            </div>
            \${isAdmin ? '<a href="/admin" class="block text-center py-2 text-xs font-bold rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40">Vào Bảng Quản Trị Hệ Thống</a>' : ''}
          \`;
          const btnMobLogout = document.getElementById('btn-mobile-logout');
          if (btnMobLogout) {
            btnMobLogout.addEventListener('click', () => {
              localStorage.removeItem('eyeposture_auth_token');
              localStorage.removeItem('eyeposture_auth_user');
              updateNavAuthState();
            });
          }
        } else {
          mobileAuthContainer.innerHTML = \`
            <button onclick="openLogin()" class="w-full py-2.5 rounded-xl text-xs font-bold text-teal-300 dark:text-teal-300 light:text-teal-700 bg-teal-500/15 border border-teal-500/30 text-center">
              Đăng Nhập / Đăng Ký Tài Khoản
            </button>
          \`;
        }
      }
    }

    // ================= VOUCHER DISCOUNT LOGIC (PRICING) =================
    let currentAppliedVoucher = null;
    const originalProPrice = 49000;

    window.applyVoucher = async function() {
      const codeInput = document.getElementById('pricing-voucher-input');
      const msgBox = document.getElementById('pricing-voucher-msg');
      const priceDisplay = document.getElementById('pro-price-display');
      const badgeDiscount = document.getElementById('pro-discount-badge');
      if (!codeInput) return;

      const code = codeInput.value.trim().toUpperCase();
      if (!code) {
        if (msgBox) {
          msgBox.className = 'text-xs text-rose-400 pt-1 block';
          msgBox.textContent = 'Vui lòng nhập mã voucher';
        }
        return;
      }

      try {
        const res = await fetch('/api/v1/vouchers/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, amount: originalProPrice })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Mã giảm giá không hợp lệ');

        currentAppliedVoucher = data.voucher;
        if (priceDisplay) {
          priceDisplay.innerHTML = \`
            <span class="text-xs text-slate-400 line-through mr-1.5">49.000đ</span>
            <span class="text-4xl font-black text-teal-300">\${data.finalAmount.toLocaleString('vi-VN')}đ</span>
          \`;
        }
        if (badgeDiscount) {
          badgeDiscount.textContent = '-' + data.discountPercent + '% ĐÃ ÁP DỤNG';
          badgeDiscount.classList.remove('hidden');
        }
        if (msgBox) {
          msgBox.className = 'text-xs text-emerald-400 pt-1 block font-medium';
          msgBox.innerHTML = '✓ Đã giảm ' + data.discountPercent + '% (-' + data.discountAmount.toLocaleString('vi-VN') + 'đ) với mã <strong>' + data.voucher.code + '</strong>';
        }
      } catch (err) {
        currentAppliedVoucher = null;
        if (priceDisplay) {
          priceDisplay.innerHTML = '<span class="text-4xl font-black text-teal-300">49.000đ</span>';
        }
        if (badgeDiscount) badgeDiscount.classList.add('hidden');
        if (msgBox) {
          msgBox.className = 'text-xs text-rose-400 pt-1 block';
          msgBox.textContent = err.message || 'Mã voucher không hợp lệ';
        }
      }
    };

    // Attach click for trigger-login-modal buttons
    document.querySelectorAll('.trigger-login-modal').forEach(btn => btn.addEventListener('click', window.openLogin));

    // Initialize Auth state
    updateNavAuthState();
  `;
}
