export function getDashboardScripts(): string {
  return `
    let rawDevices = [];
    let rawUsers = [];
    let rawVouchers = [];
    let rawStats = null;
    let currentTab = 'dashboard';
    let revenueChartInstance = null;
    let userChartInstance = null;
    let tierChartInstance = null;

    document.addEventListener('DOMContentLoaded', () => {
      initAdminTheme();
      checkAdminAuthentication();
      initVoucherForm();
    });

    // ================= ADMIN THEME TOGGLE =================
    function initAdminTheme() {
      const theme = localStorage.getItem('eyeposture_theme') || 'dark';
      applyAdminTheme(theme);
    }

    function applyAdminTheme(theme) {
      const htmlEl = document.documentElement;
      const iconEl = document.getElementById('admin-theme-icon');
      const labelEl = document.getElementById('admin-theme-label');

      if (theme === 'light') {
        htmlEl.classList.remove('dark');
        htmlEl.classList.add('light');
        if (iconEl) iconEl.textContent = '☀️';
        if (labelEl) labelEl.textContent = 'Sáng';
      } else {
        htmlEl.classList.remove('light');
        htmlEl.classList.add('dark');
        if (iconEl) iconEl.textContent = '🌙';
        if (labelEl) labelEl.textContent = 'Tối';
      }
      localStorage.setItem('eyeposture_theme', theme);
    }

    window.toggleAdminTheme = function() {
      const current = document.documentElement.classList.contains('light') ? 'light' : 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      applyAdminTheme(next);
      setTimeout(renderCharts, 100);
    };

    function checkAdminAuthentication() {
      const token = localStorage.getItem('eyeposture_auth_token') || localStorage.getItem('eyeposture_admin_token');
      const storedUser = localStorage.getItem('eyeposture_auth_user');
      let user = null;
      try {
        if (storedUser) user = JSON.parse(storedUser);
      } catch {}

      const dashboardWrapper = document.getElementById('dashboard-wrapper');
      const adminGate = document.getElementById('admin-auth-gate');
      const adminProfileName = document.getElementById('admin-profile-name');

      if (token && user && user.role === 'ADMIN') {
        if (adminGate) adminGate.classList.add('hidden');
        if (dashboardWrapper) {
          dashboardWrapper.classList.remove('hidden');
          dashboardWrapper.style.display = 'flex';
        }
        if (adminProfileName) adminProfileName.innerText = user.name || user.email;

        initNavigation();
        loadAllData();
        if (!window.__adminIntervalSet) {
          window.__adminIntervalSet = true;
          setInterval(loadAllData, 30000);
        }
      } else {
        if (dashboardWrapper) {
          dashboardWrapper.classList.add('hidden');
          dashboardWrapper.style.display = 'none';
        }
        if (adminGate) adminGate.classList.remove('hidden');
        initAdminGateForm();
      }
    }

    function initAdminGateForm() {
      const gateForm = document.getElementById('admin-gate-form');
      const emailInput = document.getElementById('gate-email');
      const passInput = document.getElementById('gate-password');
      const errorBox = document.getElementById('gate-error-box');
      const errorText = document.getElementById('gate-error-text');
      const submitBtn = document.getElementById('btn-gate-submit');

      if (!gateForm || gateForm.__initialized) return;
      gateForm.__initialized = true;

      gateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const password = passInput.value;

        if (errorBox) errorBox.classList.add('hidden');
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
            throw new Error(data.error || 'Sai thông tin đăng nhập');
          }

          if (data.user.role !== 'ADMIN') {
            throw new Error('Tài khoản này không có quyền Quản trị viên (ADMIN)!');
          }

          localStorage.setItem('eyeposture_auth_token', data.token);
          localStorage.setItem('eyeposture_admin_token', data.token);
          localStorage.setItem('eyeposture_auth_user', JSON.stringify(data.user));

          checkAdminAuthentication();
        } catch (err) {
          if (errorBox && errorText) {
            errorText.textContent = err.message || 'Lỗi xác thực quản trị';
            errorBox.classList.remove('hidden');
          }
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Mở Khóa Bảng Điều Khiển</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>';
          }
        }
      });
    }

    const logoutBtn = document.getElementById('btn-admin-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('eyeposture_auth_token');
        localStorage.removeItem('eyeposture_admin_token');
        localStorage.removeItem('eyeposture_auth_user');
        window.location.reload();
      });
    }

    function initNavigation() {
      const navLinks = document.querySelectorAll('.nav-item');
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const tab = link.getAttribute('data-tab');
          if (!tab) return;

          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');

          switchTab(tab);
        });
      });

      // Filter buttons on Users Table
      const filterBtns = document.querySelectorAll('.user-filter-btn');
      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => {
            b.className = 'user-filter-btn px-3 py-1.5 rounded-lg text-slate-400 border border-slate-800 hover:bg-slate-800/60 transition';
          });
          btn.className = 'user-filter-btn px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold transition';

          const filter = btn.getAttribute('data-filter');
          filterUsers(filter);
        });
      });
    }

    function switchTab(tabId) {
      currentTab = tabId;

      document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));

      const targetPanel = document.getElementById('panel-' + tabId);
      if (targetPanel) {
        targetPanel.classList.remove('hidden');
      }

      const breadcrumb = document.getElementById('top-breadcrumb');
      if (breadcrumb) {
        const titles = {
          dashboard: 'Tổng Quan & Biểu Đồ Thống Kê',
          users: 'Quản Lý Người Dùng (Dạng Bảng)',
          vouchers: 'Quản Lý Voucher Giảm Giá & Khuyến Mãi',
          devices: 'Quản Lý Thiết Bị Phần Cứng',
          sepay: 'Cổng SePay VietQR & Webhook'
        };
        breadcrumb.innerText = titles[tabId] || 'Quản Trị';
      }

      if (tabId === 'dashboard') {
        setTimeout(renderCharts, 50);
      }
    }

    async function loadAllData() {
      const refreshIcon = document.getElementById('refresh-icon');
      if (refreshIcon) refreshIcon.classList.add('animate-spin');

      try {
        const token = localStorage.getItem('eyeposture_auth_token') || localStorage.getItem('eyeposture_admin_token');
        const authHeaders = token ? { 'Authorization': 'Bearer ' + token } : {};
        const [devRes, userRes, statsRes, vouchRes] = await Promise.all([
          fetch('/api/v1/admin/devices', { headers: authHeaders }).then(r => r.json()).catch(() => ({ devices: [] })),
          fetch('/api/v1/admin/users', { headers: authHeaders }).then(r => r.json()).catch(() => ({ users: [] })),
          fetch('/api/v1/admin/stats', { headers: authHeaders }).then(r => r.json()).catch(() => null),
          fetch('/api/v1/admin/vouchers', { headers: authHeaders }).then(r => r.json()).catch(() => ({ vouchers: [] }))
        ]);

        rawDevices = devRes.devices || [];
        rawUsers = userRes.users || [];
        rawStats = statsRes;
        rawVouchers = vouchRes.vouchers || [];

        updateKpiCounters();
        renderCharts();
        renderUsersList(rawUsers);
        renderDevicesTable(rawDevices);
        renderVouchersList(rawVouchers);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        showToast('Lỗi đồng bộ dữ liệu Cloud API', true);
      } finally {
        if (refreshIcon) {
          setTimeout(() => refreshIcon.classList.remove('animate-spin'), 600);
        }
      }
    }

    function updateKpiCounters() {
      const totalDev = rawDevices.length;
      const blockedDev = rawDevices.filter(d => d.isBlocked).length;
      const activeDev = totalDev - blockedDev;
      const proCount = rawUsers.filter(u => u.subscription?.tier === 'PRO' || u.subscription?.tier === 'FAMILY').length;
      const totalUsers = rawUsers.length;

      // Badges in sidebar
      const badgeUsers = document.getElementById('sidebar-user-count');
      if (badgeUsers) badgeUsers.innerText = totalUsers;
      const badgeDev = document.getElementById('sidebar-device-count');
      if (badgeDev) badgeDev.innerText = totalDev;
      const badgeVouch = document.getElementById('sidebar-voucher-count');
      if (badgeVouch) badgeVouch.innerText = rawVouchers.length;

      // Top KPI Cards
      const kpiRev = document.getElementById('kpi-revenue');
      const kpiUsers = document.getElementById('kpi-total-users');
      const kpiDev = document.getElementById('kpi-active-devices');
      const kpiPro = document.getElementById('kpi-pro-rate');

      if (kpiRev && rawStats) {
        kpiRev.innerText = (rawStats.totalRevenueVnd || 0).toLocaleString('vi-VN') + ' đ';
      }
      if (kpiUsers) kpiUsers.innerText = totalUsers;
      if (kpiDev) kpiDev.innerText = activeDev + ' / ' + totalDev;
      if (kpiPro) {
        const rate = totalUsers > 0 ? Math.round((proCount / totalUsers) * 100) : 0;
        kpiPro.innerText = rate + '% (' + proCount + ' máy)';
      }

      // Voucher KPIs
      const kpiVouchTotal = document.getElementById('kpi-voucher-total');
      const kpiVouchActive = document.getElementById('kpi-voucher-active');
      const kpiVouchUsed = document.getElementById('kpi-voucher-used');

      if (kpiVouchTotal) kpiVouchTotal.innerText = rawVouchers.length;
      if (kpiVouchActive) {
        const now = Date.now();
        const activeCount = rawVouchers.filter(v => v.isActive && new Date(v.validUntil).getTime() > now).length;
        kpiVouchActive.innerText = activeCount;
      }
      if (kpiVouchUsed) {
        const totalUsed = rawVouchers.reduce((sum, v) => sum + (v.usedCount || 0), 0);
        kpiVouchUsed.innerText = totalUsed;
      }
    }

    function renderCharts() {
      if (currentTab !== 'dashboard') return;
      const isLight = document.documentElement.classList.contains('light');
      const textColor = isLight ? '#475569' : '#94a3b8';
      const gridColor = isLight ? 'rgba(203, 213, 225, 0.4)' : 'rgba(255, 255, 255, 0.05)';

      // 1. Revenue Chart
      const ctxRev = document.getElementById('chart-revenue');
      if (ctxRev && rawStats && rawStats.revenueHistory) {
        if (revenueChartInstance) revenueChartInstance.destroy();
        revenueChartInstance = new Chart(ctxRev, {
          type: 'line',
          data: {
            labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'Hôm Nay'],
            datasets: [{
              label: 'Doanh Số SePay VietQR (VNĐ)',
              data: rawStats.revenueHistory,
              borderColor: '#14b8a6',
              backgroundColor: isLight ? 'rgba(13, 148, 136, 0.12)' : 'rgba(20, 184, 166, 0.15)',
              borderWidth: 2.5,
              fill: true,
              tension: 0.35,
              pointBackgroundColor: '#2dd4bf',
              pointBorderColor: '#ffffff',
              pointRadius: 4,
              pointHoverRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => 'Doanh thu: ' + (ctx.raw || 0).toLocaleString('vi-VN') + ' đ'
                }
              }
            },
            scales: {
              x: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 } } },
              y: {
                grid: { color: gridColor },
                ticks: {
                  color: textColor,
                  font: { size: 10 },
                  callback: (val) => (val / 1000) + 'k'
                }
              }
            }
          }
        });
      }

      // 2. Users Growth Chart
      const ctxUsers = document.getElementById('chart-users');
      if (ctxUsers && rawStats && rawStats.userGrowth) {
        if (userChartInstance) userChartInstance.destroy();
        userChartInstance = new Chart(ctxUsers, {
          type: 'bar',
          data: {
            labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5', 'Tuần 6', 'Hiện tại'],
            datasets: [
              {
                label: 'Người dùng mới',
                data: rawStats.userGrowth,
                backgroundColor: 'rgba(56, 189, 248, 0.8)',
                borderRadius: 6
              },
              {
                label: 'Hoạt động (Active)',
                data: rawStats.activeTrend,
                backgroundColor: 'rgba(20, 184, 166, 0.8)',
                borderRadius: 6
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: { color: textColor, boxWidth: 12, font: { size: 11 } }
              }
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11 } } },
              y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 } } }
            }
          }
        });
      }

      // 3. Tier Distribution Chart
      const ctxTier = document.getElementById('chart-tier');
      if (ctxTier) {
        const freeCount = rawUsers.filter(u => !u.subscription || u.subscription.tier === 'FREE').length;
        const proCount = rawUsers.filter(u => u.subscription?.tier === 'PRO').length;
        const famCount = rawUsers.filter(u => u.subscription?.tier === 'FAMILY').length;

        if (tierChartInstance) tierChartInstance.destroy();
        tierChartInstance = new Chart(ctxTier, {
          type: 'doughnut',
          data: {
            labels: ['Gói Miễn Phí (Free)', 'Bản Quyền PRO', 'Family Pass'],
            datasets: [{
              data: [freeCount, proCount, famCount],
              backgroundColor: ['#64748b', '#f59e0b', '#8b5cf6'],
              borderColor: isLight ? '#ffffff' : '#0f172a',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: textColor, boxWidth: 12, font: { size: 11 } }
              }
            },
            cutout: '65%'
          }
        });
      }
    }

    // ================= RENDER USERS AS DATA TABLE =================
    function renderUsersList(users) {
      const tbody = document.getElementById('users-table-body');
      if (!tbody) return;

      if (!users || !users.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-10 text-slate-500 text-xs">Không tìm thấy người dùng phù hợp.</td></tr>';
        return;
      }

      tbody.innerHTML = users.map(user => {
        const isBlocked = Boolean(user.isBlocked);
        const sub = user.subscription || { tier: 'FREE' };
        const tier = sub.tier || 'FREE';
        const userDevices = rawDevices.filter(d => d.userId === user.id);
        const deviceLimit = tier === 'FAMILY' ? 5 : tier === 'PRO' ? 3 : 1;
        const initialLetter = (user.name || user.email || 'U').charAt(0).toUpperCase();

        let tierBadge = '<span class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">GÓI FREE</span>';
        if (tier === 'PRO') {
          tierBadge = '<span class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-amber-500/15 text-amber-400 border border-amber-500/30">★ PRO LICENSE</span>';
        } else if (tier === 'FAMILY') {
          tierBadge = '<span class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-purple-500/15 text-purple-400 border border-purple-500/30">✦ FAMILY PASS</span>';
        }

        const dateStr = user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Mới';
        const isAdmin = user.role === 'ADMIN';

        return \`
          <tr class="hover:bg-slate-800/40 transition">
            <!-- Col 1: User Profile -->
            <td class="py-3.5 px-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl gradient-teal flex items-center justify-center font-black text-slate-950 text-xs shadow-md shrink-0">
                  \${initialLetter}
                </div>
                <div>
                  <div class="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <span>\${user.name || 'Người Dùng'}</span>
                    \${isAdmin ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-teal-500/30 font-bold text-teal-300">ADMIN</span>' : ''}
                  </div>
                  <div class="text-[11px] text-slate-400 font-mono">\${user.email}</div>
                </div>
              </div>
            </td>

            <!-- Col 2: Subscription Tier -->
            <td class="py-3.5 px-4">
              <div>\${tierBadge}</div>
              <div class="text-[10px] text-slate-500 mt-1">
                \${sub.expiresAt ? 'Hạn: ' + new Date(sub.expiresAt).toLocaleDateString('vi-VN') : 'Dùng trọn đời'}
              </div>
            </td>

            <!-- Col 3: Status -->
            <td class="py-3.5 px-4">
              \${isBlocked
                ? '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-600/20 text-rose-400 border border-rose-500/30"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> BỊ KHÓA</span>'
                : '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> HOẠT ĐỘNG</span>'
              }
            </td>

            <!-- Col 4: Devices -->
            <td class="py-3.5 px-4">
              <div class="flex items-center gap-1.5">
                <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-teal-300 border border-slate-700">
                  \${userDevices.length} / \${deviceLimit} máy
                </span>
              </div>
              \${userDevices.length > 0 ? \`
                <div class="text-[10px] text-slate-400 truncate max-w-[160px] mt-0.5" title="\${userDevices.map(d => d.deviceName).join(', ')}">
                  \${userDevices.map(d => d.deviceName || 'PC').join(', ')}
                </div>
              \` : '<div class="text-[10px] text-slate-500 italic mt-0.5">Chưa cài app</div>'}
            </td>

            <!-- Col 5: Created Date -->
            <td class="py-3.5 px-4 text-[11px] text-slate-400 font-mono">
              \${dateStr}
            </td>

            <!-- Col 6: Actions -->
            <td class="py-3.5 px-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                \${tier === 'FREE' ? \`
                  <button onclick="upgradeUserPlan('\${user.id}', 'PRO')" class="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-[11px] font-bold transition">
                    + Cấp Pro
                  </button>
                \` : \`
                  <button onclick="upgradeUserPlan('\${user.id}', 'FREE')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px] font-medium transition">
                    Hạ Free
                  </button>
                \`}

                \${!isAdmin ? (isBlocked ? \`
                  <button onclick="toggleUserBlock('\${user.id}', false)" class="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition">
                    Mở Khóa
                  </button>
                \` : \`
                  <button onclick="toggleUserBlock('\${user.id}', true)" class="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[11px] font-bold transition">
                    Khóa
                  </button>
                \`) : ''}
              </div>
            </td>
          </tr>
        \`;
      }).join('');
    }

    // ================= RENDER VOUCHERS LIST =================
    function renderVouchersList(vouchers) {
      const tbody = document.getElementById('vouchers-table-body');
      if (!tbody) return;

      if (!vouchers || !vouchers.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-10 text-slate-500 text-xs">Chưa có voucher giảm giá nào. Hãy tạo mã khuyến mãi đầu tiên ở trên!</td></tr>';
        return;
      }

      const now = Date.now();

      tbody.innerHTML = vouchers.map(v => {
        const expiryTime = new Date(v.validUntil).getTime();
        const isExpired = now > expiryTime;
        const isLive = v.isActive && !isExpired;
        const expiryStr = new Date(v.validUntil).toLocaleString('vi-VN');

        return \`
          <tr class="hover:bg-slate-800/40 transition">
            <!-- Col 1: Voucher Code -->
            <td class="py-3.5 px-4">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 rounded-lg font-mono font-extrabold text-xs bg-rose-500/15 text-rose-300 border border-rose-500/30 tracking-wider">
                  \${v.code}
                </span>
                <button onclick="copyToClipboard('\${v.code}')" title="Sao chép mã" class="p-1 text-slate-400 hover:text-white transition">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </button>
              </div>
            </td>

            <!-- Col 2: Discount Percent -->
            <td class="py-3.5 px-4 font-black text-rose-400 text-sm">
              -\${v.discountPercent}%
            </td>

            <!-- Col 3: Validity & Expiry -->
            <td class="py-3.5 px-4">
              <div class="text-[11px] text-slate-300 font-mono">\${expiryStr}</div>
              <div class="text-[10px] mt-0.5">
                \${isExpired
                  ? '<span class="text-rose-400 font-bold">Hết hạn</span>'
                  : '<span class="text-emerald-400 font-medium">Còn hiệu lực</span>'
                }
              </div>
            </td>

            <!-- Col 4: Usage Limit -->
            <td class="py-3.5 px-4 text-xs font-mono text-slate-300">
              <span class="font-bold text-teal-300">\${v.usedCount || 0}</span>
              \${v.maxUses > 0 ? \` / \${v.maxUses} lượt\` : ' lượt (Không giới hạn)'}
            </td>

            <!-- Col 5: Description -->
            <td class="py-3.5 px-4 text-[11px] text-slate-400 max-w-[200px] truncate" title="\${v.description || ''}">
              \${v.description || 'Ưu đãi EyePosture'}
            </td>

            <!-- Col 6: Status -->
            <td class="py-3.5 px-4">
              \${isLive ? \`
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ĐANG BẬT
                </span>
              \` : \`
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                  ĐÃ TẮT
                </span>
              \`}
            </td>

            <!-- Col 7: Actions -->
            <td class="py-3.5 px-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <button onclick="toggleVoucherActive('\${v.id}')" class="px-2.5 py-1 rounded-lg \${v.isActive ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'} text-[11px] font-bold transition">
                  \${v.isActive ? 'Tạm Ngưng' : 'Kích Hoạt'}
                </button>
                <button onclick="deleteVoucher('\${v.id}', '\${v.code}')" class="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition" title="Xóa voucher">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            </td>
          </tr>
        \`;
      }).join('');
    }

    // ================= VOUCHER ACTIONS =================
    function initVoucherForm() {
      const form = document.getElementById('create-voucher-form');
      if (!form || form.__initialized) return;
      form.__initialized = true;

      // Set default expiry date to 30 days ahead
      setExpiryDaysPreset(30);

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('new-voucher-code').value.trim();
        const discountPercent = document.getElementById('new-voucher-discount').value;
        const validUntilInput = document.getElementById('new-voucher-expiry').value;
        const maxUses = document.getElementById('new-voucher-max-uses').value;
        const description = document.getElementById('new-voucher-desc').value.trim();

        if (!code) {
          showToast('Vui lòng nhập mã voucher', true);
          return;
        }

        const validUntil = new Date(validUntilInput).toISOString();

        try {
          const token = localStorage.getItem('eyeposture_auth_token') || localStorage.getItem('eyeposture_admin_token');
          const res = await fetch('/api/v1/admin/vouchers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': 'Bearer ' + token } : {})
            },
            body: JSON.stringify({
              code,
              discountPercent: Number(discountPercent),
              validUntil,
              maxUses: Number(maxUses) || 0,
              description
            })
          });
          const data = await res.json();
          if (res.ok) {
            showToast('Tạo voucher ' + code + ' (-' + discountPercent + '%) thành công!');
            form.reset();
            autoGenerateVoucherCode();
            setExpiryDaysPreset(30);
            loadAllData();
          } else {
            showToast(data.error || 'Không thể tạo voucher', true);
          }
        } catch (err) {
          showToast('Lỗi kết nối khi tạo voucher', true);
        }
      });
    }

    window.autoGenerateVoucherCode = function() {
      const prefixes = ['EYE', 'WELLNESS', 'HEALTH', 'SUMMER', 'VIP', 'SALE'];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const pcts = ['20', '30', '40', '50'];
      const pct = pcts[Math.floor(Math.random() * pcts.length)];
      const codeInput = document.getElementById('new-voucher-code');
      const discountInput = document.getElementById('new-voucher-discount');
      if (codeInput) codeInput.value = prefix + pct;
      if (discountInput) discountInput.value = pct;
    };

    window.setDiscountPreset = function(pct) {
      const discountInput = document.getElementById('new-voucher-discount');
      if (discountInput) discountInput.value = pct;
    };

    window.setExpiryDaysPreset = function(days) {
      const expiryInput = document.getElementById('new-voucher-expiry');
      if (expiryInput) {
        const target = new Date(Date.now() + days * 86400 * 1000);
        // format to yyyy-MM-ddThh:mm
        const pad = (n) => n.toString().padStart(2, '0');
        const str = target.getFullYear() + '-' + pad(target.getMonth() + 1) + '-' + pad(target.getDate()) + 'T' + pad(target.getHours()) + ':' + pad(target.getMinutes());
        expiryInput.value = str;
      }
    };

    window.toggleVoucherActive = async function(id) {
      try {
        const token = localStorage.getItem('eyeposture_auth_token') || localStorage.getItem('eyeposture_admin_token');
        const res = await fetch('/api/v1/admin/vouchers/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': 'Bearer ' + token } : {})
          },
          body: JSON.stringify({ id })
        });
        const data = await res.json();
        if (res.ok) {
          showToast('Đã cập nhật trạng thái voucher');
          loadAllData();
        } else {
          showToast(data.error || 'Cập nhật thất bại', true);
        }
      } catch (err) {
        showToast('Lỗi mạng', true);
      }
    };

    window.deleteVoucher = async function(id, code) {
      if (!confirm('Bạn có chắc chắn muốn xóa voucher ' + code + '?')) return;
      try {
        const token = localStorage.getItem('eyeposture_auth_token') || localStorage.getItem('eyeposture_admin_token');
        const res = await fetch('/api/v1/admin/vouchers/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': 'Bearer ' + token } : {})
          },
          body: JSON.stringify({ id })
        });
        if (res.ok) {
          showToast('Đã xóa voucher thành công');
          loadAllData();
        } else {
          showToast('Xóa voucher thất bại', true);
        }
      } catch (err) {
        showToast('Lỗi kết nối', true);
      }
    };

    window.copyToClipboard = function(text) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Đã sao chép mã: ' + text);
      }).catch(() => {});
    };

    // ================= RENDER DEVICES TABLE =================
    function renderDevicesTable(devices) {
      const tbody = document.getElementById('devices-table-body');
      if (!tbody) return;

      if (!devices || !devices.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-10 text-slate-500 text-xs">Chưa có thiết bị máy tính nào được đăng ký.</td></tr>';
        return;
      }

      tbody.innerHTML = devices.map(d => {
        const isBlocked = Boolean(d.isBlocked);
        const lastActive = d.lastActiveAt ? new Date(d.lastActiveAt).toLocaleString('vi-VN') : 'Mới';

        return \`
          <tr class="hover:bg-slate-800/40 transition">
            <td class="py-3 px-4">
              <div class="flex items-center gap-2.5">
                <div class="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
                </div>
                <div>
                  <div class="font-bold text-slate-200 text-xs">\${d.deviceName || 'Windows PC'}</div>
                  <div class="text-[10px] text-slate-500 font-mono">\${d.os || 'Windows 11'} • v\${d.appVersion || '1.0.0'}</div>
                </div>
              </div>
            </td>
            <td class="py-3 px-4">
              <div class="text-xs text-slate-200 font-medium">\${d.userName || 'Người Dùng'}</div>
              <div class="text-[10px] text-slate-400 font-mono">\${d.userEmail || 'Chưa định danh'}</div>
            </td>
            <td class="py-3 px-4 font-mono text-[11px] text-teal-400">
              \${d.deviceFingerprint}
            </td>
            <td class="py-3 px-4">
              \${isBlocked
                ? '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600/20 text-rose-400 border border-rose-500/30">BỊ CHẶN</span>'
                : '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">ONLINE</span>'
              }
            </td>
            <td class="py-3 px-4 text-[11px] text-slate-400 font-mono">
              \${lastActive}
            </td>
            <td class="py-3 px-4 text-right">
              \${isBlocked
                ? \`<button onclick="toggleDeviceBlock('\${d.deviceFingerprint}', false)" class="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition">
                    Mở Máy
                  </button>\`
                : \`<button onclick="toggleDeviceBlock('\${d.deviceFingerprint}', true)" class="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-xs transition">
                    Chặn Máy
                  </button>\`
              }
            </td>
          </tr>
        \`;
      }).join('');
    }

    function filterUsers(type) {
      if (type === 'all') {
        renderUsersList(rawUsers);
      } else if (type === 'pro') {
        renderUsersList(rawUsers.filter(u => u.subscription?.tier === 'PRO' || u.subscription?.tier === 'FAMILY'));
      } else if (type === 'free') {
        renderUsersList(rawUsers.filter(u => !u.subscription || u.subscription.tier === 'FREE'));
      } else if (type === 'blocked') {
        renderUsersList(rawUsers.filter(u => u.isBlocked));
      }
    }

    window.searchAll = function(query) {
      const q = (query || '').toLowerCase().trim();
      if (!q) {
        renderUsersList(rawUsers);
        renderDevicesTable(rawDevices);
        renderVouchersList(rawVouchers);
        return;
      }

      // Filter users
      const matchedUsers = rawUsers.filter(u =>
        (u.email || '').toLowerCase().includes(q) ||
        (u.name || '').toLowerCase().includes(q)
      );
      renderUsersList(matchedUsers);

      // Filter devices
      const matchedDevs = rawDevices.filter(d =>
        (d.deviceName || '').toLowerCase().includes(q) ||
        (d.userEmail || '').toLowerCase().includes(q) ||
        (d.deviceFingerprint || '').toLowerCase().includes(q)
      );
      renderDevicesTable(matchedDevs);

      // Filter vouchers
      const matchedVouchers = rawVouchers.filter(v =>
        (v.code || '').toLowerCase().includes(q) ||
        (v.description || '').toLowerCase().includes(q)
      );
      renderVouchersList(matchedVouchers);
    };

    window.toggleDeviceBlock = async function(fingerprint, shouldBlock) {
      const actionText = shouldBlock ? 'CHẶN MÁY' : 'MỞ KHÓA MÁY';
      if (!confirm('Xác nhận ' + actionText + ' (' + fingerprint + ')?')) return;

      const endpoint = shouldBlock ? '/api/v1/admin/devices/block' : '/api/v1/admin/devices/unblock';
      try {
        const token = localStorage.getItem('eyeposture_auth_token') || localStorage.getItem('eyeposture_admin_token');
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': 'Bearer ' + token } : {})
          },
          body: JSON.stringify({ deviceFingerprint: fingerprint })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(shouldBlock ? 'Đã chặn máy thành công' : 'Đã mở khóa máy thành công');
          loadAllData();
        } else {
          showToast(data.error || 'Thao tác thất bại', true);
        }
      } catch (err) {
        showToast('Lỗi mạng khi cập nhật thiết bị', true);
      }
    };

    window.toggleUserBlock = async function(userId, shouldBlock) {
      const actionText = shouldBlock ? 'KHÓA TÀI KHOẢN' : 'MỞ KHÓA TÀI KHOẢN';
      if (!confirm('Xác nhận ' + actionText + '?')) return;

      const endpoint = shouldBlock ? '/api/v1/admin/users/block' : '/api/v1/admin/users/unblock';
      try {
        const token = localStorage.getItem('eyeposture_auth_token') || localStorage.getItem('eyeposture_admin_token');
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': 'Bearer ' + token } : {})
          },
          body: JSON.stringify({ userId })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(shouldBlock ? 'Tài khoản đã bị tạm khóa' : 'Tài khoản đã được mở khóa');
          loadAllData();
        } else {
          showToast(data.error || 'Lỗi xử lý', true);
        }
      } catch (err) {
        showToast('Lỗi mạng khi xử lý tài khoản', true);
      }
    };

    window.upgradeUserPlan = async function(userId, targetTier) {
      const days = targetTier === 'PRO' ? 365 : 0;
      const text = targetTier === 'PRO' ? 'CẤP BẢN QUYỀN PRO 1 NĂM' : 'HẠ VỀ GÓI MIỄN PHÍ';
      if (!confirm('Xác nhận ' + text + ' cho người dùng này?')) return;

      try {
        const token = localStorage.getItem('eyeposture_auth_token') || localStorage.getItem('eyeposture_admin_token');
        const res = await fetch('/api/v1/admin/users/upgrade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': 'Bearer ' + token } : {})
          },
          body: JSON.stringify({ userId, tier: targetTier, days })
        });
        const data = await res.json();
        if (res.ok) {
          showToast('Đã cập nhật bản quyền ' + targetTier + ' thành công');
          loadAllData();
        } else {
          showToast(data.error || 'Cấp quyền thất bại', true);
        }
      } catch (err) {
        showToast('Lỗi kết nối khi cập nhật bản quyền', true);
      }
    };

    window.simulateSepayWebhook = async function() {
      const emailInput = document.getElementById('sim-email');
      const email = emailInput ? emailInput.value.trim() : '';
      if (!email) {
        showToast('Vui lòng nhập email để mô phỏng', true);
        return;
      }

      showToast('Đang gửi webhook mô phỏng...');
      try {
        const res = await fetch('/api/v1/billing/webhook/sepay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: 'SIM-' + Date.now(),
            gateway: 'BIDV',
            transactionDate: new Date().toISOString(),
            accountNumber: '4661398013',
            transferType: 'in',
            transferAmount: 59000,
            content: 'EYEPOPRO ' + email,
            referenceCode: 'REF' + Math.floor(Math.random() * 900000 + 100000)
          })
        });
        const data = await res.json();
        if (res.ok) {
          showToast('Kích hoạt Pro thành công qua SePay Webhook!');
          loadAllData();
        } else {
          showToast(data.error || 'Webhook thất bại', true);
        }
      } catch (err) {
        showToast('Lỗi kết nối webhook SePay', true);
      }
    };

    function showToast(msg, isError = false) {
      const toast = document.getElementById('toast');
      const toastBox = document.getElementById('toast-box');
      const toastMsg = document.getElementById('toast-msg');
      const toastIcon = document.getElementById('toast-icon');

      if (!toast || !toastBox || !toastMsg) return;

      toastMsg.innerText = msg;
      if (isError) {
        toastBox.className = 'glass-card border border-rose-500/50 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-2.5 text-xs text-rose-200 bg-slate-900/95';
        if (toastIcon) toastIcon.innerText = '✕';
      } else {
        toastBox.className = 'glass-card border border-teal-500/50 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-2.5 text-xs text-teal-200 bg-slate-900/95';
        if (toastIcon) toastIcon.innerText = '✓';
      }

      toast.classList.remove('opacity-0', 'translate-y-20');
      toast.classList.add('opacity-100', 'translate-y-0');

      setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'translate-y-20');
      }, 3500);
    }
  `;
}
