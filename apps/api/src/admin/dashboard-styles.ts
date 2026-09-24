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

    html.light {
      --bg-main: #f8fafc;
      --bg-sidebar: #ffffff;
      --bg-card: #ffffff;
      --border-card: #e2e8f0;
      --accent-teal: #0d9488;
      --accent-cyan: #0284c7;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg-main);
      color: #f1f5f9;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      transition: background-color 0.25s ease, color 0.25s ease;
    }

    html.light body {
      background-color: #f8fafc;
      color: #0f172a;
    }

    h1, h2, h3, h4, .brand-font {
      font-family: 'Outfit', sans-serif;
    }

    /* Custom Glassmorphism */
    .glass-sidebar {
      background: rgba(13, 18, 31, 0.85);
      backdrop-filter: blur(16px);
      border-right: 1px solid var(--border-card);
      transition: all 0.25s ease;
    }

    html.light .glass-sidebar {
      background: #ffffff;
      border-right: 1px solid #e2e8f0;
      box-shadow: 2px 0 16px rgba(15, 23, 42, 0.04);
    }

    .glass-card {
      background: var(--bg-card);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border-card);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    html.light .glass-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
    }

    .glass-card:hover {
      border-color: rgba(20, 184, 166, 0.3);
      box-shadow: 0 10px 30px -10px rgba(20, 184, 166, 0.15);
    }

    html.light .glass-card:hover {
      border-color: rgba(13, 148, 136, 0.35);
      box-shadow: 0 10px 25px -8px rgba(15, 23, 42, 0.08);
    }

    html.light header.glass-card {
      background: rgba(255, 255, 255, 0.9);
      border-bottom: 1px solid #e2e8f0;
    }

    /* Light mode text & element overrides */
    html.light .text-slate-100 { color: #0f172a !important; }
    html.light .text-slate-200 { color: #1e293b !important; }
    html.light .text-slate-300 { color: #334155 !important; }
    html.light .text-slate-400 { color: #64748b !important; }
    html.light .text-slate-500 { color: #94a3b8 !important; }
    html.light .bg-slate-900 { background-color: #f1f5f9 !important; }
    html.light .bg-slate-950 { background-color: #f8fafc !important; }
    html.light .border-slate-800 { border-color: #e2e8f0 !important; }
    html.light .border-slate-700 { border-color: #cbd5e1 !important; }
    html.light tbody tr:hover { background-color: #f8fafc !important; }

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

    html.light .nav-item.active {
      background: linear-gradient(90deg, rgba(13, 148, 136, 0.12) 0%, rgba(2, 132, 199, 0.04) 100%);
      border-left: 3px solid #0d9488;
      color: #0d9488;
    }

    .nav-item:not(.active):hover {
      background: rgba(255, 255, 255, 0.04);
      color: #f8fafc;
    }

    html.light .nav-item:not(.active):hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #090d16;
    }
    html.light ::-webkit-scrollbar-track {
      background: #f1f5f9;
    }
    ::-webkit-scrollbar-thumb {
      background: #1e293b;
      border-radius: 4px;
    }
    html.light ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
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
