export function getLandingScripts(): string {
  return `
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

        // Close all
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

      if (scoreVal) {
        scoreVal.textContent = Math.max(10, score) + '/100';
      }

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

    // Download Modal Logic
    const downloadModal = document.getElementById('download-modal');
    const downloadButtons = document.querySelectorAll('.trigger-download');
    const closeModalBtn = document.getElementById('close-modal-btn');

    function openDownloadModal() {
      if (downloadModal) {
        downloadModal.classList.remove('hidden');
        downloadModal.classList.add('flex');
        
        // Trigger download directly via iframe or location
        setTimeout(() => {
          window.location.href = '/download/win';
        }, 800);
      }
    }

    function closeDownloadModal() {
      if (downloadModal) {
        downloadModal.classList.add('hidden');
        downloadModal.classList.remove('flex');
      }
    }

    downloadButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openDownloadModal();
      });
    });

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeDownloadModal);
    if (downloadModal) {
      downloadModal.addEventListener('click', (e) => {
        if (e.target === downloadModal) closeDownloadModal();
      });
    }

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

    // ================= AUTH LOGIN MODAL LOGIC =================
    const loginModal = document.getElementById('login-modal');
    const closeLoginModalBtn = document.getElementById('close-login-modal');
    const openLoginBtns = document.querySelectorAll('.trigger-login-modal');
    const quickFillAdminBtn = document.getElementById('btn-quick-fill-admin');
    const loginForm = document.getElementById('landing-login-form');
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const loginErrorBox = document.getElementById('login-error-box');
    const loginErrorText = document.getElementById('login-error-text');
    const loginSuccessBox = document.getElementById('login-success-box');
    const loginSuccessText = document.getElementById('login-success-text');
    const navAuthContainer = document.getElementById('nav-auth-container');
    const mobileAuthContainer = document.getElementById('mobile-auth-container');

    function openLogin() {
      if (!loginModal) return;
      if (loginErrorBox) loginErrorBox.classList.add('hidden');
      if (loginSuccessBox) loginSuccessBox.classList.add('hidden');
      loginModal.classList.remove('hidden');
      loginModal.classList.add('flex');
    }

    function closeLogin() {
      if (!loginModal) return;
      loginModal.classList.add('hidden');
      loginModal.classList.remove('flex');
    }

    openLoginBtns.forEach(btn => btn.addEventListener('click', openLogin));
    if (closeLoginModalBtn) closeLoginModalBtn.addEventListener('click', closeLogin);
    if (loginModal) {
      loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) closeLogin();
      });
    }

    if (quickFillAdminBtn && loginEmailInput && loginPasswordInput) {
      quickFillAdminBtn.addEventListener('click', () => {
        loginEmailInput.value = 'admin';
        loginPasswordInput.value = '1';
        if (loginErrorBox) loginErrorBox.classList.add('hidden');
      });
    }

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
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-teal-500/30 text-xs">
              <span class="w-2 h-2 rounded-full bg-teal-400"></span>
              <span class="font-semibold text-slate-200 max-w-[120px] truncate">\${user.name || user.email}</span>
              \${isAdmin ? '<span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300">ADMIN</span>' : ''}
              <button id="btn-logout" title="Đăng xuất" class="text-slate-400 hover:text-rose-400 ml-1 p-0.5 transition">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
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
            <button class="trigger-login-modal px-3 py-2 rounded-xl text-xs font-semibold text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 transition flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
              <span>Đăng Nhập</span>
            </button>
          \`;
          const triggerBtn = navAuthContainer.querySelector('.trigger-login-modal');
          if (triggerBtn) triggerBtn.addEventListener('click', openLogin);
        }
      }

      if (mobileAuthContainer) {
        if (user) {
          mobileAuthContainer.innerHTML = \`
            <div class="flex items-center justify-between p-2 rounded-lg bg-slate-900 text-xs">
              <span class="text-teal-300 font-semibold">\${user.name || user.email}</span>
              <button id="btn-mobile-logout" class="text-rose-400 font-medium text-xs">Đăng xuất</button>
            </div>
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
            <button class="trigger-login-modal w-full py-2 rounded-lg text-xs font-semibold text-teal-300 bg-teal-500/10 border border-teal-500/30 text-center">
              Đăng Nhập Tài Khoản
            </button>
          \`;
          const triggerMob = mobileAuthContainer.querySelector('.trigger-login-modal');
          if (triggerMob) triggerMob.addEventListener('click', openLogin);
        }
      }
    }

    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginEmailInput.value.trim();
        const password = loginPasswordInput.value;
        const submitBtn = document.getElementById('btn-login-submit');

        if (loginErrorBox) loginErrorBox.classList.add('hidden');
        if (loginSuccessBox) loginSuccessBox.classList.add('hidden');
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
          if (!res.ok) {
            throw new Error(data.error || 'Đăng nhập không thành công');
          }

          localStorage.setItem('eyeposture_auth_token', data.token);
          localStorage.setItem('eyeposture_auth_user', JSON.stringify(data.user));

          if (loginSuccessBox && loginSuccessText) {
            loginSuccessText.textContent = 'Đăng nhập thành công! Xin chào ' + (data.user.name || data.user.email);
            loginSuccessBox.classList.remove('hidden');
          }

          updateNavAuthState();

          setTimeout(() => {
            closeLogin();
            if (data.user && data.user.role === 'ADMIN') {
              window.location.href = '/admin';
            }
          }, 600);
        } catch (err) {
          if (loginErrorBox && loginErrorText) {
            loginErrorText.textContent = err.message || 'Lỗi kết nối máy chủ';
            loginErrorBox.classList.remove('hidden');
          }
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Đăng Nhập Ngay</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>';
          }
        }
      });
    }

    // Initialize Auth state
    updateNavAuthState();
  `;
}
