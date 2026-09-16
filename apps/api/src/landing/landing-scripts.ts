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
  `;
}
