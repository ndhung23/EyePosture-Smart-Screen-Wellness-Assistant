export function getDashboardScripts(): string {
  return `
    let rawDevices = [];
    let rawUsers = [];
    let rawStats = null;
    let currentTab = 'dashboard';
    let revenueChartInstance = null;
    let userChartInstance = null;
    let tierChartInstance = null;

    document.addEventListener('DOMContentLoaded', () => {
      checkAdminAuthentication();
    });

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
            submitBtn.innerHTML = '<span>Mở Khóa Quản Trị Hub</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>';
          }
        }
      });
    }

    function initNavigation() {
      const btnAdminLogout = document.getElementById('btn-admin-logout');
      if (btnAdminLogout && !btnAdminLogout.__initialized) {
        btnAdminLogout.__initialized = true;
        btnAdminLogout.addEventListener('click', () => {
          localStorage.removeItem('eyeposture_auth_token');
          localStorage.removeItem('eyeposture_admin_token');
          localStorage.removeItem('eyeposture_auth_user');
          location.reload();
        });
      }

      const navItems = document.querySelectorAll('.nav-item');
      navItems.forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const target = item.getAttribute('data-tab');
          switchTab(target);
        });
      });

      // Filter buttons in Users tab
      const filterBtns = document.querySelectorAll('.user-filter-btn');
      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => b.classList.remove('bg-teal-500/20', 'text-teal-300', 'border-teal-500/40'));
          filterBtns.forEach(b => b.classList.add('text-slate-400', 'border-slate-800'));
          btn.classList.add('bg-teal-500/20', 'text-teal-300', 'border-teal-500/40');
          btn.classList.remove('text-slate-400', 'border-slate-800');
          filterUsers(btn.getAttribute('data-filter'));
        });
      });
    }

    function switchTab(tabId) {
      currentTab = tabId;
      document.querySelectorAll('.nav-item').forEach(el => {
        if (el.getAttribute('data-tab') === tabId) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      });

      // Hide all panels
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));

      // Show selected panel
      const targetPanel = document.getElementById('panel-' + tabId);
      if (targetPanel) {
        targetPanel.classList.remove('hidden');
      }

      // Update breadcrumb
      const breadcrumb = document.getElementById('top-breadcrumb');
      if (breadcrumb) {
        const titles = {
          dashboard: 'Tổng Quan & Biểu Đồ Thống Kê',
          users: 'Chi Tiết Người Dùng Đang Sử Dụng',
          devices: 'Quản Lý Thiết Bị Phần Cứng',
          sepay: 'Cổng SePay VietQR & Webhook'
        };
        breadcrumb.innerText = titles[tabId] || 'Quản Trị';
      }

      // Re-render charts if dashboard is shown
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
        const [devRes, userRes, statsRes] = await Promise.all([
          fetch('/api/v1/admin/devices', { headers: authHeaders }).then(r => r.json()).catch(() => ({ devices: [] })),
          fetch('/api/v1/admin/users', { headers: authHeaders }).then(r => r.json()).catch(() => ({ users: [] })),
          fetch('/api/v1/admin/stats', { headers: authHeaders }).then(r => r.json()).catch(() => null)
        ]);

        rawDevices = devRes.devices || [];
        rawUsers = userRes.users || [];
        rawStats = statsRes;

        updateKpiCounters();
        renderCharts();
        renderUsersList(rawUsers);
        renderDevicesTable(rawDevices);
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

      // Dashboard KPI cards
      const elTotalRev = document.getElementById('kpi-revenue');
      const elUsers = document.getElementById('kpi-total-users');
      const elActiveDev = document.getElementById('kpi-active-devices');
      const elProRate = document.getElementById('kpi-pro-rate');

      const totalRev = rawStats?.totalRevenueVnd || (proCount * 59000);
      if (elTotalRev) elTotalRev.innerText = totalRev.toLocaleString('vi-VN') + ' đ';
      if (elUsers) elUsers.innerText = totalUsers;
      if (elActiveDev) elActiveDev.innerText = activeDev + ' / ' + totalDev;

      const rate = totalUsers > 0 ? Math.round((proCount / totalUsers) * 100) : 0;
      if (elProRate) elProRate.innerText = rate + '%';
    }

    function renderCharts() {
      if (typeof Chart === 'undefined') return;

      // 1. Revenue Chart (Doanh số theo tuần/tháng)
      const ctxRev = document.getElementById('chart-revenue');
      if (ctxRev) {
        const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
        const dataRev = rawStats?.revenueHistory || [295000, 413000, 354000, 590000, 708000, 885000, 1180000];

        if (revenueChartInstance) revenueChartInstance.destroy();
        revenueChartInstance = new Chart(ctxRev, {
          type: 'line',
          data: {
            labels: days,
            datasets: [{
              label: 'Doanh Số (VNĐ)',
              data: dataRev,
              borderColor: '#14b8a6',
              backgroundColor: 'rgba(20, 184, 166, 0.12)',
              borderWidth: 2.5,
              pointBackgroundColor: '#2dd4bf',
              pointRadius: 4,
              pointHoverRadius: 6,
              tension: 0.35,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => ' ' + ctx.raw.toLocaleString('vi-VN') + ' đ'
                }
              }
            },
            scales: {
              x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
              y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: {
                  color: '#94a3b8',
                  font: { size: 10 },
                  callback: (val) => (val >= 1000 ? (val / 1000) + 'k' : val)
                }
              }
            }
          }
        });
      }

      // 2. User Growth Chart
      const ctxUser = document.getElementById('chart-users');
      if (ctxUser) {
        const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        const userGrowth = rawStats?.userGrowth || [12, 19, 25, 32, 45, 58, Math.max(70, rawUsers.length * 10)];
        const activeTrend = rawStats?.activeTrend || [8, 15, 20, 26, 38, 50, Math.max(60, rawUsers.length * 8)];

        if (userChartInstance) userChartInstance.destroy();
        userChartInstance = new Chart(ctxUser, {
          type: 'bar',
          data: {
            labels: days,
            datasets: [
              {
                label: 'Người Dùng Mới',
                data: userGrowth,
                backgroundColor: '#38bdf8',
                borderRadius: 4
              },
              {
                label: 'Active Users',
                data: activeTrend,
                backgroundColor: '#14b8a6',
                borderRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: { color: '#cbd5e1', boxWidth: 10, font: { size: 10 } }
              }
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
              y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } }
            }
          }
        });
      }

      // 3. Tier Distribution (Free vs Pro vs Family)
      const ctxTier = document.getElementById('chart-tier');
      if (ctxTier) {
        const freeCount = rawUsers.filter(u => !u.subscription || u.subscription.tier === 'FREE').length || 1;
        const proCount = rawUsers.filter(u => u.subscription?.tier === 'PRO').length;
        const famCount = rawUsers.filter(u => u.subscription?.tier === 'FAMILY').length;

        if (tierChartInstance) tierChartInstance.destroy();
        tierChartInstance = new Chart(ctxTier, {
          type: 'doughnut',
          data: {
            labels: ['Gói Miễn Phí (Free)', 'Gói Chuyên Nghiệp (Pro)', 'Gói Gia Đình (Family)'],
            datasets: [{
              data: [freeCount, Math.max(proCount, 1), famCount],
              backgroundColor: ['#64748b', '#14b8a6', '#8b5cf6'],
              borderColor: '#090d16',
              borderWidth: 3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#cbd5e1', boxWidth: 8, font: { size: 10 }, padding: 12 }
              }
            }
          }
        });
      }
    }

    function renderUsersList(users) {
      const container = document.getElementById('users-cards-container');
      if (!container) return;

      if (!users || !users.length) {
        container.innerHTML = '<div class="p-8 text-center text-slate-500 text-xs">Chưa có người dùng nào đăng ký trên hệ thống.</div>';
        return;
      }

      container.innerHTML = users.map(user => {
        const isBlocked = Boolean(user.isBlocked);
        const sub = user.subscription || { tier: 'FREE' };
        const tier = sub.tier || 'FREE';
        const userDevices = rawDevices.filter(d => d.userId === user.id);

        let tierBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">FREE</span>';
        if (tier === 'PRO') {
          tierBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">★ PRO LICENSE</span>';
        } else if (tier === 'FAMILY') {
          tierBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">✦ FAMILY PASS</span>';
        }

        const deviceLimit = tier === 'FAMILY' ? 5 : tier === 'PRO' ? 3 : 1;
        const initialLetter = (user.name || user.email || 'U').charAt(0).toUpperCase();

        // Render devices of this user
        let devicesHtml = '';
        if (userDevices.length === 0) {
          devicesHtml = '<div class="text-[11px] text-slate-500 italic">Chưa liên kết máy tính nào.</div>';
        } else {
          devicesHtml = userDevices.map(d => {
            const devBlocked = Boolean(d.isBlocked);
            return \`
              <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <div class="flex items-center gap-2">
                  <div class="p-1.5 rounded bg-slate-800 text-slate-300">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/></svg>
                  </div>
                  <div>
                    <div class="font-medium text-slate-200 text-xs flex items-center gap-1.5">
                      \${d.deviceName || 'Windows PC'}
                      \${devBlocked
                        ? '<span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">MÁY BỊ CHẶN</span>'
                        : '<span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">MÁY ONLINE</span>'
                      }
                    </div>
                    <div class="text-[10px] text-slate-500 font-mono">\${d.deviceFingerprint} • \${d.os || 'Win 11'}</div>
                  </div>
                </div>
                <div>
                  \${devBlocked
                    ? \`<button onclick="toggleDeviceBlock('\${d.deviceFingerprint}', false)" class="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition">Mở Máy</button>\`
                    : \`<button onclick="toggleDeviceBlock('\${d.deviceFingerprint}', true)" class="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[10px] font-bold transition">Khóa Máy</button>\`
                  }
                </div>
              </div>
            \`;
          }).join('');
        }

        return \`
          <div class="glass-card rounded-xl p-5 space-y-4">
            <!-- Header User Card -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center font-extrabold text-slate-950 text-base shadow-md">
                  \${initialLetter}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="font-bold text-sm text-slate-100">\${user.name || 'Người Dùng'}</h3>
                    \${tierBadge}
                    \${isBlocked
                      ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600/20 text-rose-400 border border-rose-500/30">TÀI KHOẢN BỊ KHÓA</span>'
                      : '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">HOẠT ĐỘNG</span>'
                    }
                  </div>
                  <div class="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>\${user.email}</span>
                    <span>•</span>
                    <span class="text-[11px] text-slate-500">Gia nhập: \${new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              <!-- Quick Action Buttons -->
              <div class="flex items-center gap-2">
                \${tier === 'FREE'
                  ? \`<button onclick="quickUpgradeUser('\${user.id}', 'PRO')" class="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-bold transition flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      Cấp Pro Ngay
                    </button>\`
                  : ''
                }
                \${isBlocked
                  ? \`<button onclick="toggleUserBlock('\${user.id}', false)" class="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 11V7a5 5 0 0 1 9.9-1"/><rect width="18" height="11" x="3" y="11" rx="2"/></svg>
                      Mở Khóa Tài Khoản
                    </button>\`
                  : \`<button onclick="toggleUserBlock('\${user.id}', true)" class="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      Khóa Tài Khoản
                    </button>\`
                }
              </div>
            </div>

            <!-- Detail Device List for this user -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs text-slate-400">
                <span class="font-medium text-slate-300 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/></svg>
                  Máy tính đang sử dụng:
                </span>
                <span class="text-[11px] font-mono text-teal-300 bg-teal-950/40 px-2 py-0.5 rounded border border-teal-800/40">
                  \${userDevices.length} / \${deviceLimit} máy (Seat quota)
                </span>
              </div>
              <div class="space-y-1.5">
                \${devicesHtml}
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    function renderDevicesTable(devices) {
      const tbody = document.getElementById('devices-table-body');
      if (!tbody) return;

      if (!devices || !devices.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-10 text-slate-500">Chưa có thiết bị nào đăng ký với hệ thống.</td></tr>';
        return;
      }

      tbody.innerHTML = devices.map(d => {
        const isBlocked = d.isBlocked;
        return \`
          <tr class="hover:bg-slate-800/30 transition">
            <td class="py-3 px-4">
              <div class="flex items-center gap-2.5">
                <div class="p-2 rounded-lg bg-slate-800/80 text-slate-300">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/></svg>
                </div>
                <div>
                  <div class="font-semibold text-slate-200">\${d.deviceName || 'Windows PC'}</div>
                  <div class="text-[10px] text-slate-400">\${d.os || 'Windows 11'} • v\${d.appVersion || '1.0.0'}</div>
                </div>
              </div>
            </td>
            <td class="py-3 px-4">
              <div class="font-medium text-slate-300">\${d.userEmail}</div>
              <div class="text-[10px] text-slate-500">\${d.userName}</div>
            </td>
            <td class="py-3 px-4">
              <span class="font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400">\${d.deviceFingerprint}</span>
            </td>
            <td class="py-3 px-4">
              \${isBlocked
                ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">● BỊ CHẶN</span>'
                : '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">● HOẠT ĐỘNG</span>'
              }
            </td>
            <td class="py-3 px-4 text-slate-400 text-[11px]">
              \${new Date(d.lastActiveAt).toLocaleString('vi-VN')}
            </td>
            <td class="py-3 px-4 text-right">
              \${isBlocked
                ? \`<button onclick="toggleDeviceBlock('\${d.deviceFingerprint}', false)" class="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition inline-flex items-center gap-1">
                    Mở Khóa Máy
                  </button>\`
                : \`<button onclick="toggleDeviceBlock('\${d.deviceFingerprint}', true)" class="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-xs transition inline-flex items-center gap-1">
                    Chặn Máy Này
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

    function searchAll(query) {
      const q = (query || '').toLowerCase().trim();
      if (!q) {
        renderUsersList(rawUsers);
        renderDevicesTable(rawDevices);
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
    }

    async function toggleDeviceBlock(fingerprint, shouldBlock) {
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
          showToast(shouldBlock ? 'Đã chặn máy thành công' : 'Đã mở khóa máy thành công', false);
          loadAllData();
        } else {
          showToast(data.error || 'Thao tác thất bại', true);
        }
      } catch (err) {
        showToast('Lỗi mạng khi cập nhật thiết bị', true);
      }
    }

    async function toggleUserBlock(userId, shouldBlock) {
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
          showToast(shouldBlock ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản', false);
          loadAllData();
        } else {
          showToast(data.error || 'Thao tác thất bại', true);
        }
      } catch (err) {
        showToast('Lỗi mạng khi cập nhật tài khoản', true);
      }
    }

    async function quickUpgradeUser(userId, tier) {
      if (!confirm('Cấp ngay quyền ' + tier + ' cho tài khoản này?')) return;
      try {
        const token = localStorage.getItem('eyeposture_auth_token') || localStorage.getItem('eyeposture_admin_token');
        const res = await fetch('/api/v1/admin/users/upgrade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': 'Bearer ' + token } : {})
          },
          body: JSON.stringify({ userId, tier, days: 365 })
        });
        if (res.ok) {
          showToast('Đã nâng cấp gói ' + tier + ' thành công!', false);
          loadAllData();
        } else {
          showToast('Nâng cấp thất bại', true);
        }
      } catch (err) {
        showToast('Lỗi khi nâng cấp tài khoản', true);
      }
    }

    async function simulateSepayWebhook() {
      const email = document.getElementById('sim-email')?.value?.trim();
      if (!email) {
        alert('Vui lòng nhập Email người dùng cần kích hoạt bản quyền SePay!');
        return;
      }

      try {
        const res = await fetch('/api/v1/billing/webhook/sepay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Apikey demo_webhook_secret'
          },
          body: JSON.stringify({
            id: Date.now(),
            gateway: 'BIDV',
            transactionDate: new Date().toISOString(),
            accountNumber: '4661398013',
            subAccount: null,
            transferType: 'in',
            transferAmount: 59000,
            accumulated: 10000000,
            code: 'SEPAY' + Math.floor(Math.random() * 900000 + 100000),
            content: 'EYEPOSTURE ' + email,
            referenceCode: 'BIDV_' + Date.now(),
            description: 'Nang cap EyePosture Pro 1 thang'
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          showToast('Bắn Webhook SePay thành công! Gói PRO đã được kích hoạt!', false);
          loadAllData();
        } else {
          showToast(data.error || 'Webhook từ chối xử lý', true);
        }
      } catch (err) {
        showToast('Không thể gửi webhook giả lập', true);
      }
    }

    function showToast(msg, isError) {
      const toast = document.getElementById('toast');
      const box = document.getElementById('toast-box');
      const icon = document.getElementById('toast-icon');
      const text = document.getElementById('toast-msg');

      if (!toast) return;

      text.innerText = msg;
      if (isError) {
        box.className = 'glass-card border border-rose-500/40 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-2.5 text-xs text-rose-200 bg-slate-900/95';
        icon.innerText = '✕';
      } else {
        box.className = 'glass-card border border-teal-500/40 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-2.5 text-xs text-teal-200 bg-slate-900/95';
        icon.innerText = '✓';
      }

      toast.classList.remove('translate-y-20', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');

      setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
      }, 3500);
    }
  `;
}
