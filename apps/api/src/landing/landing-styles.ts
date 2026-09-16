export function getLandingStyles(): string {
  return `
    :root {
      --primary: #14b8a6;
      --primary-glow: rgba(20, 184, 166, 0.35);
      --accent: #06b6d4;
      --accent-purple: #8b5cf6;
      --bg-dark: #070a12;
      --bg-card: rgba(15, 23, 42, 0.75);
      --border-card: rgba(255, 255, 255, 0.08);
      --text-muted: #94a3b8;
    }

    * {
      box-sizing: border-box;
      scroll-behavior: smooth;
    }

    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg-dark);
      color: #f8fafc;
      overflow-x: hidden;
    }

    /* Ambient background lighting */
    .ambient-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(120px);
      pointer-events: none;
      z-index: 0;
      opacity: 0.45;
    }

    .ambient-teal {
      background: radial-gradient(circle, #14b8a6 0%, rgba(20, 184, 166, 0) 70%);
    }

    .ambient-cyan {
      background: radial-gradient(circle, #06b6d4 0%, rgba(6, 182, 212, 0) 70%);
    }

    .ambient-indigo {
      background: radial-gradient(circle, #6366f1 0%, rgba(99, 102, 241, 0) 70%);
    }

    /* Glassmorphism */
    .glass-nav {
      background: rgba(7, 10, 18, 0.82);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    }

    .glass-card {
      background: var(--bg-card);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--border-card);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .glass-card:hover {
      border-color: rgba(45, 212, 191, 0.3);
      transform: translateY(-4px);
      box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.5), 0 0 24px -6px var(--primary-glow);
    }

    /* Gradient typography */
    .gradient-text {
      background: linear-gradient(135deg, #ffffff 20%, #99f6e4 70%, #2dd4bf 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .gradient-accent {
      background: linear-gradient(135deg, #2dd4bf 0%, #38bdf8 50%, #818cf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Button effects */
    .btn-glow {
      position: relative;
      background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
      box-shadow: 0 0 25px -3px rgba(20, 184, 166, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25);
      transition: all 0.25s ease;
    }

    .btn-glow:hover {
      background: linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%);
      box-shadow: 0 0 35px 2px rgba(45, 212, 191, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.35);
      transform: scale(1.02);
    }

    /* Interactive Demo widget */
    .simulator-box {
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(10, 15, 28, 0.95) 100%);
      border: 1px solid rgba(45, 212, 191, 0.25);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px -10px rgba(20, 184, 166, 0.25);
    }

    /* Range slider custom styling */
    input[type=range] {
      -webkit-appearance: none;
      width: 100%;
      background: #1e293b;
      height: 8px;
      border-radius: 4px;
      outline: none;
    }

    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #2dd4bf;
      cursor: pointer;
      box-shadow: 0 0 12px rgba(45, 212, 191, 0.8);
      border: 2px solid #ffffff;
      transition: all 0.15s ease;
    }

    input[type=range]::-webkit-slider-thumb:hover {
      transform: scale(1.15);
      background: #5eead4;
    }

    /* Shimmer effect for badges */
    .shimmer-badge {
      background: linear-gradient(90deg, rgba(20, 184, 166, 0.1) 0%, rgba(45, 212, 191, 0.25) 50%, rgba(20, 184, 166, 0.1) 100%);
      background-size: 200% 100%;
      animation: shimmer 3s infinite linear;
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    /* Pulse dot */
    .pulse-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #22c55e;
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
      animation: pulse-ring 1.8s infinite cubic-bezier(0.66, 0, 0, 1);
    }

    @keyframes pulse-ring {
      0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
      70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
      100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
    }

    /* Modal Animation */
    .modal-enter {
      animation: modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes modalFadeIn {
      from { opacity: 0; transform: scale(0.96) translateY(8px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
  `;
}
