export function getDashboardStyles(): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap');

    :root {
      --bg-main: #090d16;
      --bg-sidebar: #0d121f;
      --bg-card: rgba(18, 24, 38, 0.7);
      --border-card: rgba(255, 255, 255, 0.07);
      --accent-teal: #14b8a6;
      --accent-cyan: #06b6d4;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg-main);
      color: #f1f5f9;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
    }

    h1, h2, h3, h4, .brand-font {
      font-family: 'Outfit', sans-serif;
    }

    /* Custom Glassmorphism */
    .glass-sidebar {
      background: rgba(13, 18, 31, 0.85);
      backdrop-filter: blur(16px);
      border-right: 1px solid var(--border-card);
    }

    .glass-card {
      background: var(--bg-card);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border-card);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .glass-card:hover {
      border-color: rgba(20, 184, 166, 0.3);
      box-shadow: 0 10px 30px -10px rgba(20, 184, 166, 0.15);
    }

    .gradient-teal {
      background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%);
    }

    .gradient-orange {
      background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
    }

    .gradient-purple {
      background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
    }

    .gradient-text {
      background: linear-gradient(135deg, #2dd4bf 0%, #38bdf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Active Sidebar Item */
    .nav-item {
      transition: all 0.2s ease;
    }

    .nav-item.active {
      background: linear-gradient(90deg, rgba(20, 184, 166, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%);
      border-left: 3px solid #14b8a6;
      color: #2dd4bf;
      font-weight: 600;
    }

    .nav-item:not(.active):hover {
      background: rgba(255, 255, 255, 0.04);
      color: #f8fafc;
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #090d16;
    }
    ::-webkit-scrollbar-thumb {
      background: #1e293b;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #334155;
    }

    /* Chart Containers */
    .chart-box {
      position: relative;
      height: 260px;
      width: 100%;
    }

    .chart-box-sm {
      position: relative;
      height: 220px;
      width: 100%;
    }
  `;
}
