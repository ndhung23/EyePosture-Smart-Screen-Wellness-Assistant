import React, { useState } from 'react';
import { AppProvider } from './context/AppContext.js';
import { Sidebar, NavPage } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { BreakModal } from './components/BreakModal.js';
import { PasswordPromptModal } from './components/PasswordPromptModal.js';
import { AuthModal } from './components/AuthModal.js';
import { PerformancePanel } from './components/PerformancePanel.js';
import { UpdateModal } from './components/UpdateModal.js';

import { DashboardPage } from './pages/DashboardPage.js';
import { MonitorPage } from './pages/MonitorPage.js';
import { BreaksPage } from './pages/BreaksPage.js';
import { ScreenTimePage } from './pages/ScreenTimePage.js';
import { StatisticsPage } from './pages/StatisticsPage.js';
import { ProfilesPage } from './pages/ProfilesPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { SubscriptionPage } from './pages/SubscriptionPage.js';
import { PrivacyPage } from './pages/PrivacyPage.js';

const MainContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');

  React.useEffect(() => {
    try {
      let fingerprint = localStorage.getItem('eyeposture_device_fingerprint');
      if (!fingerprint) {
        fingerprint = 'win_' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem('eyeposture_device_fingerprint', fingerprint);
      }
      const isWin = navigator.userAgent.includes('Windows');
      const devName = isWin ? 'Windows PC (Desktop)' : 'Client Device';
      const endpoints = [
        'https://eyeposture.vercel.app/api/v1/devices/telemetry',
        'http://localhost:8080/api/v1/devices/telemetry',
      ];
      endpoints.forEach((ep) => {
        fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceFingerprint: fingerprint,
            deviceName: devName,
            os: isWin ? 'Windows 11 x64' : navigator.platform || 'Windows',
            appVersion: '1.0.0',
          }),
        }).catch(() => {});
      });
    } catch {}
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={(p) => setCurrentPage(p as NavPage)} />;
      case 'monitor':
        return <MonitorPage />;
      case 'breaks':
        return <BreaksPage />;
      case 'screenTime':
        return <ScreenTimePage />;
      case 'statistics':
        return <StatisticsPage />;
      case 'profiles':
        return <ProfilesPage />;
      case 'settings':
        return <SettingsPage />;
      case 'subscription':
        return <SubscriptionPage />;
      case 'privacy':
        return <PrivacyPage />;
      default:
        return <DashboardPage onNavigate={(p) => setCurrentPage(p as NavPage)} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar currentPage={currentPage} onSelectPage={setCurrentPage} />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>

      {/* Modals & Overlays */}
      <BreakModal />
      <PasswordPromptModal />
      <AuthModal />
      <PerformancePanel />
      <UpdateModal autoCheckOnMount={true} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};
