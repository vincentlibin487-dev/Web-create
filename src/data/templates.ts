import { Template } from '../types';

export const TEMPLATES: Template[] = [
  {
    id: 'saas-dashboard',
    title: 'SaaS Analytics Dashboard',
    category: 'Dashboard',
    description: 'Modern SaaS metrics dashboard with interactive stat cards, revenue charts, and user tables.',
    prompt: 'Build a modern SaaS analytics dashboard with dark mode, revenue metrics, user growth charts, and recent activity feed.',
    badge: 'Popular',
    iconName: 'BarChart3',
    files: [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NexusPulse AI - SaaS Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <link rel="stylesheet" href="style.css">
</head>
<body class="bg-slate-950 text-slate-100 font-sans antialiased">
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col">
    <!-- Top Navbar -->
    <header class="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/30">N</div>
        <div>
          <h1 class="font-bold text-lg leading-tight">NexusPulse AI</h1>
          <p class="text-xs text-slate-400">Enterprise Workspace</p>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="relative hidden sm:block">
          <input type="text" placeholder="Search analytics..." class="bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-1.5 text-sm focus:outline-none focus:border-indigo-500 w-64 text-slate-200 placeholder-slate-500">
        </div>
        <button onclick="alert('Notification center')" class="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
          <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        </button>
        <div class="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center font-semibold text-sm">JD</div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Revenue</span>
          <div class="text-3xl font-extrabold text-white mt-1">$128,430</div>
        </div>
        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Subscriptions</span>
          <div class="text-3xl font-extrabold text-white mt-1">2,490</div>
        </div>
      </div>
    </main>
  </div>
  <script src="script.js"></script>
</body>
</html>`
      },
      {
        path: 'style.css',
        content: '/* Custom dashboard styles */\nbody { background-color: #020617; }'
      },
      {
        path: 'script.js',
        content: 'console.log("NexusPulse Dashboard initialized");'
      },
      {
        path: 'package.json',
        content: JSON.stringify({
          name: "nexus-pulse-dashboard",
          version: "1.0.0",
          private: true,
          dependencies: {
            "tailwindcss": "^4.0.0"
          }
        }, null, 2)
      },
      {
        path: 'README.md',
        content: '# NexusPulse SaaS Dashboard\nGenerated with AI Workspace.'
      }
    ],
    fullCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NexusPulse AI - SaaS Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body class="bg-slate-950 text-slate-100 font-sans antialiased">
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col">
    <header class="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/30">N</div>
        <div>
          <h1 class="font-bold text-lg leading-tight">NexusPulse AI</h1>
          <p class="text-xs text-slate-400">Enterprise Workspace</p>
        </div>
      </div>
    </header>
    <main class="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Revenue</span>
          <div class="text-3xl font-extrabold text-white mt-1">$128,430</div>
        </div>
      </div>
    </main>
  </div>
</body>
</html>`
  }
];
