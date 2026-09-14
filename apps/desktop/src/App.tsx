import React, { useState } from 'react';
import { AppProvider } from './context/AppContext.js';
import { Sidebar, NavPage } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { BreakModal } from './components/BreakModal.js';
import { PerformancePanel } from './components/PerformancePanel.js';

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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
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
      <PerformancePanel />
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
