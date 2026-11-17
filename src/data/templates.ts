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
    html: `
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
    <!-- Stats Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition">
        <div class="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition"></div>
        <div class="flex justify-between items-start mb-3">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Revenue</span>
          <span class="text-emerald-400 text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">+18.2%</span>
        </div>
        <div class="text-3xl font-extrabold text-white mb-1">$128,430</div>
        <p class="text-xs text-slate-400">vs. $108,600 last month</p>
      </div>

      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition">
        <div class="absolute right-0 top-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition"></div>
        <div class="flex justify-between items-start mb-3">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Subscriptions</span>
          <span class="text-emerald-400 text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">+12.5%</span>
        </div>
        <div class="text-3xl font-extrabold text-white mb-1">2,490</div>
        <p class="text-xs text-slate-400">84% retention rate</p>
      </div>

      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition">
        <div class="absolute right-0 top-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition"></div>
        <div class="flex justify-between items-start mb-3">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Conversion Rate</span>
          <span class="text-rose-400 text-xs bg-rose-500/10 px-2 py-0.5 rounded-full font-medium">-0.4%</span>
        </div>
        <div class="text-3xl font-extrabold text-white mb-1">4.82%</div>
        <p class="text-xs text-slate-400">Target: 5.0%</p>
      </div>

      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition">
        <div class="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition"></div>
        <div class="flex justify-between items-start mb-3">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">API Requests</span>
          <span class="text-emerald-400 text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">+42.1%</span>
        </div>
        <div class="text-3xl font-extrabold text-white mb-1">14.2M</div>
        <p class="text-xs text-slate-400">99.99% uptime</p>
      </div>
    </div>

    <!-- Charts & Activity Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-lg font-bold">Revenue Overview</h2>
            <p class="text-xs text-slate-400">Monthly recurring revenue (MRR) trajectory</p>
          </div>
          <div class="flex gap-2">
            <button onclick="switchChartTab('1M')" class="chart-tab px-3 py-1 text-xs rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition">1M</button>
            <button onclick="switchChartTab('6M')" class="chart-tab px-3 py-1 text-xs rounded-lg bg-indigo-600 text-white font-medium">6M</button>
            <button onclick="switchChartTab('1Y')" class="chart-tab px-3 py-1 text-xs rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition">1Y</button>
          </div>
        </div>
        <div class="flex-1 flex items-end gap-3 h-64 pt-6 px-2">
          <div class="flex-1 flex flex-col items-center gap-2 group"><div class="w-full bg-indigo-600/30 group-hover:bg-indigo-500 rounded-t-lg transition h-[40%]"></div><span class="text-[10px] text-slate-400">Jun</span></div>
          <div class="flex-1 flex flex-col items-center gap-2 group"><div class="w-full bg-indigo-600/30 group-hover:bg-indigo-500 rounded-t-lg transition h-[55%]"></div><span class="text-[10px] text-slate-400">Jul</span></div>
          <div class="flex-1 flex flex-col items-center gap-2 group"><div class="w-full bg-indigo-600/30 group-hover:bg-indigo-500 rounded-t-lg transition h-[50%]"></div><span class="text-[10px] text-slate-400">Aug</span></div>
          <div class="flex-1 flex flex-col items-center gap-2 group"><div class="w-full bg-indigo-600/30 group-hover:bg-indigo-500 rounded-t-lg transition h-[70%]"></div><span class="text-[10px] text-slate-400">Sep</span></div>
          <div class="flex-1 flex flex-col items-center gap-2 group"><div class="w-full bg-indigo-600/30 group-hover:bg-indigo-500 rounded-t-lg transition h-[85%]"></div><span class="text-[10px] text-slate-400">Oct</span></div>
          <div class="flex-1 flex flex-col items-center gap-2 group"><div class="w-full bg-indigo-500 rounded-t-lg transition h-[95%] shadow-lg shadow-indigo-500/30"></div><span class="text-[10px] text-slate-200 font-bold">Nov</span></div>
        </div>
      </div>

      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col">
        <h2 class="text-lg font-bold mb-1">Recent Signups</h2>
        <p class="text-xs text-slate-400 mb-4">Latest enterprise tier customers</p>
        <div class="space-y-4 flex-1 overflow-y-auto">
          <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm">AC</div>
              <div>
                <h4 class="text-sm font-semibold">Acme Corp</h4>
                <p class="text-xs text-slate-400">alex@acme.io</p>
              </div>
            </div>
            <span class="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded-md">$499/mo</span>
          </div>
          <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-violet-500/20 text-violet-400 font-bold flex items-center justify-center text-sm">SL</div>
              <div>
                <h4 class="text-sm font-semibold">Starlight AI</h4>
                <p class="text-xs text-slate-400">sara@starlight.ai</p>
              </div>
            </div>
            <span class="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded-md">$999/mo</span>
          </div>
          <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-sm">VX</div>
              <div>
                <h4 class="text-sm font-semibold">Vortex Labs</h4>
                <p class="text-xs text-slate-400">dev@vortex.co</p>
              </div>
            </div>
            <span class="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded-md">$299/mo</span>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
`,
    css: ``,
    js: `
function switchChartTab(period) {
  alert('Switched analytics timeframe to: ' + period);
}
`,
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
    <!-- Stats Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition">
        <div class="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition"></div>
        <div class="flex justify-between items-start mb-3">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Revenue</span>
          <span class="text-emerald-400 text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">+18.2%</span>
        </div>
        <div class="text-3xl font-extrabold text-white mb-1">$128,430</div>
        <p class="text-xs text-slate-400">vs. $108,600 last month</p>
      </div>

      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition">
        <div class="absolute right-0 top-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition"></div>
        <div class="flex justify-between items-start mb-3">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Subscriptions</span>
          <span class="text-emerald-400 text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">+12.5%</span>
        </div>
        <div class="text-3xl font-extrabold text-white mb-1">2,490</div>
        <p class="text-xs text-slate-400">84% retention rate</p>
      </div>

      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition">
        <div class="absolute right-0 top-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition"></div>
        <div class="flex justify-between items-start mb-3">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Conversion Rate</span>
          <span class="text-rose-400 text-xs bg-rose-500/10 px-2 py-0.5 rounded-full font-medium">-0.4%</span>
        </div>
        <div class="text-3xl font-extrabold text-white mb-1">4.82%</div>
        <p class="text-xs text-slate-400">Target: 5.0%</p>
      </div>

      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition">
        <div class="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition"></div>
        <div class="flex justify-between items-start mb-3">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">API Requests</span>
          <span class="text-emerald-400 text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">+42.1%</span>
        </div>
        <div class="text-3xl font-extrabold text-white mb-1">14.2M</div>
        <p class="text-xs text-slate-400">99.99% uptime</p>
      </div>
    </div>

    <!-- Charts & Activity Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-lg font-bold">Revenue Overview</h2>
            <p class="text-xs text-slate-400">Monthly recurring revenue (MRR) trajectory</p>
          </div>
          <div class="flex gap-2">
            <button onclick="switchChartTab('1M')" class="chart-tab px-3 py-1 text-xs rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition">1M</button>
            <button onclick="switchChartTab('6M')" class="chart-tab px-3 py-1 text-xs rounded-lg bg-indigo-600 text-white font-medium">6M</button>
            <button onclick="switchChartTab('1Y')" class="chart-tab px-3 py-1 text-xs rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition">1Y</button>
          </div>
        </div>
        <div class="flex-1 flex items-end gap-3 h-64 pt-6 px-2">
          <div class="flex-1 flex flex-col items-center gap-2 group"><div class="w-full bg-indigo-600/30 group-hover:bg-indigo-500 rounded-t-lg transition h-[40%]"></div><span class="text-[10px] text-slate-400">Jun</span></div>
          <div class="flex-1 flex flex-col items-center gap-2 group"><div class="w-full bg-indigo-600/30 group-hover:bg-indigo-500 rounded-t-lg transition h-[55%]"></div><span class="text-[10px] text-slate-400">Jul</span></div>
          <div class="flex-1 flex flex-col items-center gap-2 group"><div class="w-full bg-indigo-600/30 group-hover:bg-indigo-500 rounded-t-lg transition h-[50%]"></div><span class="text-[10px] text-slate-400">Aug</span></div>
          <div class="flex-1 flex flex-col items-center gap-2 group"><div class="w-full bg-indigo-600/30 group-hover:bg-indigo-500 rounded-t-lg transition h-[70%]"></div><span class="text-[10px] text-slate-400">Sep</span></div>
          <div class="flex-1 flex flex-col items-center gap-2 group"><div class="w-full bg-indigo-600/30 group-hover:bg-indigo-500 rounded-t-lg transition h-[85%]"></div><span class="text-[10px] text-slate-400">Oct</span></div>
          <div class="flex-1 flex flex-col items-center gap-2 group"><div class="w-full bg-indigo-500 rounded-t-lg transition h-[95%] shadow-lg shadow-indigo-500/30"></div><span class="text-[10px] text-slate-200 font-bold">Nov</span></div>
        </div>
      </div>

      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col">
        <h2 class="text-lg font-bold mb-1">Recent Signups</h2>
        <p class="text-xs text-slate-400 mb-4">Latest enterprise tier customers</p>
        <div class="space-y-4 flex-1 overflow-y-auto">
          <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm">AC</div>
              <div>
                <h4 class="text-sm font-semibold">Acme Corp</h4>
                <p class="text-xs text-slate-400">alex@acme.io</p>
              </div>
            </div>
            <span class="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded-md">$499/mo</span>
          </div>
          <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-violet-500/20 text-violet-400 font-bold flex items-center justify-center text-sm">SL</div>
              <div>
                <h4 class="text-sm font-semibold">Starlight AI</h4>
                <p class="text-xs text-slate-400">sara@starlight.ai</p>
              </div>
            </div>
            <span class="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded-md">$999/mo</span>
          </div>
          <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-sm">VX</div>
              <div>
                <h4 class="text-sm font-semibold">Vortex Labs</h4>
                <p class="text-xs text-slate-400">dev@vortex.co</p>
              </div>
            </div>
            <span class="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded-md">$299/mo</span>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
  <script>
    function switchChartTab(period) {
      alert('Switched analytics timeframe to: ' + period);
    }
  </script>
</body>
</html>`
  },
  {
    id: 'ecommerce-store',
    title: 'Urban Sneaker Store',
    category: 'E-Commerce',
    description: 'High-end streetwear and sneaker storefront with shopping cart modal and interactive filters.',
    prompt: 'Build a modern e-commerce sneaker storefront with product grid, category tabs, add to cart functionality, and checkout modal.',
    badge: 'Featured',
    iconName: 'ShoppingBag',
    html: `
<div class="min-h-screen bg-slate-50 text-slate-900 font-sans">
  <header class="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-xs">
    <div class="flex items-center gap-8">
      <h1 class="text-xl font-black tracking-tighter uppercase bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">KICKS // LAB</h1>
      <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <a href="#" class="text-slate-900 font-semibold">New Drops</a>
        <a href="#" class="hover:text-rose-600 transition">Sneakers</a>
        <a href="#" class="hover:text-rose-600 transition">Apparel</a>
        <a href="#" class="hover:text-rose-600 transition">Sale</a>
      </nav>
    </div>
    <div class="flex items-center gap-4">
      <button onclick="toggleCart()" class="relative bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-slate-800 transition shadow-md">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        <span>Cart</span>
        <span id="cart-count" class="bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">0</span>
      </button>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative bg-slate-900 text-white overflow-hidden py-20 px-6">
    <div class="absolute inset-0 opacity-30 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:16px_16px]"></div>
    <div class="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div class="space-y-6">
        <span class="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Limited Edition Drop</span>
        <h2 class="text-4xl sm:text-6xl font-black tracking-tight leading-none">AIR MAX VORTEX '26</h2>
        <p class="text-slate-300 text-base max-w-lg">Engineered for absolute comfort, futuristic aesthetics, and elite street presence. Grab yours before they sell out.</p>
        <div class="flex gap-4">
          <button onclick="addToCart('Air Max Vortex', 189)" class="bg-rose-600 hover:bg-rose-500 text-white font-bold px-8 py-3.5 rounded-full transition shadow-lg shadow-rose-600/30">Shop Now - $189</button>
          <button onclick="alert('Viewing lookbook')" class="border border-slate-700 hover:border-slate-500 text-white font-medium px-6 py-3.5 rounded-full transition">Explore Lookbook</button>
        </div>
      </div>
      <div class="bg-gradient-to-tr from-rose-500/25 to-amber-500/25 p-8 rounded-3xl border border-slate-800 flex items-center justify-center">
        <div class="text-center font-black text-6xl text-slate-700/40 select-none">👟 VORTEX</div>
      </div>
    </div>
  </section>

  <!-- Product Grid -->
  <main class="max-w-7xl mx-auto px-6 py-16">
    <div class="flex items-center justify-between mb-8">
      <h3 class="text-2xl font-bold tracking-tight">Featured Releases</h3>
      <div class="flex gap-2 text-sm font-medium">
        <button onclick="filterProducts('all')" class="px-4 py-1.5 rounded-full bg-slate-900 text-white">All</button>
        <button onclick="filterProducts('sneakers')" class="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100">Sneakers</button>
        <button onclick="filterProducts('apparel')" class="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100">Apparel</button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-lg transition group">
        <div class="bg-slate-100 h-64 rounded-xl flex items-center justify-center text-4xl mb-4 group-hover:scale-[1.02] transition">⚡</div>
        <div class="flex justify-between items-start mb-1">
          <h4 class="font-bold text-lg">CyberRunner Kinetic</h4>
          <span class="font-extrabold text-rose-600">$165</span>
        </div>
        <p class="text-slate-500 text-xs mb-4">High-performance responsive cushioning</p>
        <button onclick="addToCart('CyberRunner Kinetic', 165)" class="w-full bg-slate-900 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-xl transition text-sm">Add to Cart</button>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-lg transition group">
        <div class="bg-slate-100 h-64 rounded-xl flex items-center justify-center text-4xl mb-4 group-hover:scale-[1.02] transition">🔥</div>
        <div class="flex justify-between items-start mb-1">
          <h4 class="font-bold text-lg">Apex Stealth Pro</h4>
          <span class="font-extrabold text-rose-600">$210</span>
        </div>
        <p class="text-slate-500 text-xs mb-4">Matte black waterproof knit upper</p>
        <button onclick="addToCart('Apex Stealth Pro', 210)" class="w-full bg-slate-900 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-xl transition text-sm">Add to Cart</button>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-lg transition group">
        <div class="bg-slate-100 h-64 rounded-xl flex items-center justify-center text-4xl mb-4 group-hover:scale-[1.02] transition">🌊</div>
        <div class="flex justify-between items-start mb-1">
          <h4 class="font-bold text-lg">NeoTokyo Runner</h4>
          <span class="font-extrabold text-rose-600">$145</span>
        </div>
        <p class="text-slate-500 text-xs mb-4">Retro futuristic colorway aesthetics</p>
        <button onclick="addToCart('NeoTokyo Runner', 145)" class="w-full bg-slate-900 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-xl transition text-sm">Add to Cart</button>
      </div>
    </div>
  </main>
</div>
`,
    css: ``,
    js: `
let cartCount = 0;
let cartItems = [];

function addToCart(name, price) {
  cartCount++;
  cartItems.push({ name, price });
  document.getElementById('cart-count').innerText = cartCount;
  alert('Added ' + name + ' to your cart!');
}

function toggleCart() {
  if (cartItems.length === 0) {
    alert('Your cart is currently empty.');
  } else {
    const list = cartItems.map(i => i.name + ' - $' + i.price).join('\\n');
    alert('Cart Items:\\n' + list + '\\n\\nTotal Items: ' + cartCount);
  }
}

function filterProducts(category) {
  alert('Filtered products by category: ' + category);
}
`,
    fullCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KICKS // LAB - Urban Sneaker Store</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body class="bg-slate-50 text-slate-900 font-sans">
  <div class="min-h-screen bg-slate-50 text-slate-900 font-sans">
  <header class="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-xs">
    <div class="flex items-center gap-8">
      <h1 class="text-xl font-black tracking-tighter uppercase bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">KICKS // LAB</h1>
      <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <a href="#" class="text-slate-900 font-semibold">New Drops</a>
        <a href="#" class="hover:text-rose-600 transition">Sneakers</a>
        <a href="#" class="hover:text-rose-600 transition">Apparel</a>
        <a href="#" class="hover:text-rose-600 transition">Sale</a>
      </nav>
    </div>
    <div class="flex items-center gap-4">
      <button onclick="toggleCart()" class="relative bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-slate-800 transition shadow-md">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        <span>Cart</span>
        <span id="cart-count" class="bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">0</span>
      </button>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative bg-slate-900 text-white overflow-hidden py-20 px-6">
    <div class="absolute inset-0 opacity-30 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:16px_16px]"></div>
    <div class="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div class="space-y-6">
        <span class="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Limited Edition Drop</span>
        <h2 class="text-4xl sm:text-6xl font-black tracking-tight leading-none">AIR MAX VORTEX '26</h2>
        <p class="text-slate-300 text-base max-w-lg">Engineered for absolute comfort, futuristic aesthetics, and elite street presence. Grab yours before they sell out.</p>
        <div class="flex gap-4">
          <button onclick="addToCart('Air Max Vortex', 189)" class="bg-rose-600 hover:bg-rose-500 text-white font-bold px-8 py-3.5 rounded-full transition shadow-lg shadow-rose-600/30">Shop Now - $189</button>
          <button onclick="alert('Viewing lookbook')" class="border border-slate-700 hover:border-slate-500 text-white font-medium px-6 py-3.5 rounded-full transition">Explore Lookbook</button>
        </div>
      </div>
      <div class="bg-gradient-to-tr from-rose-500/25 to-amber-500/25 p-8 rounded-3xl border border-slate-800 flex items-center justify-center">
        <div class="text-center font-black text-6xl text-slate-700/40 select-none">👟 VORTEX</div>
      </div>
    </div>
  </section>

  <!-- Product Grid -->
  <main class="max-w-7xl mx-auto px-6 py-16">
    <div class="flex items-center justify-between mb-8">
      <h3 class="text-2xl font-bold tracking-tight">Featured Releases</h3>
      <div class="flex gap-2 text-sm font-medium">
        <button onclick="filterProducts('all')" class="px-4 py-1.5 rounded-full bg-slate-900 text-white">All</button>
        <button onclick="filterProducts('sneakers')" class="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100">Sneakers</button>
        <button onclick="filterProducts('apparel')" class="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100">Apparel</button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-lg transition group">
        <div class="bg-slate-100 h-64 rounded-xl flex items-center justify-center text-4xl mb-4 group-hover:scale-[1.02] transition">⚡</div>
        <div class="flex justify-between items-start mb-1">
          <h4 class="font-bold text-lg">CyberRunner Kinetic</h4>
          <span class="font-extrabold text-rose-600">$165</span>
        </div>
        <p class="text-slate-500 text-xs mb-4">High-performance responsive cushioning</p>
        <button onclick="addToCart('CyberRunner Kinetic', 165)" class="w-full bg-slate-900 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-xl transition text-sm">Add to Cart</button>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-lg transition group">
        <div class="bg-slate-100 h-64 rounded-xl flex items-center justify-center text-4xl mb-4 group-hover:scale-[1.02] transition">🔥</div>
        <div class="flex justify-between items-start mb-1">
          <h4 class="font-bold text-lg">Apex Stealth Pro</h4>
          <span class="font-extrabold text-rose-600">$210</span>
        </div>
        <p class="text-slate-500 text-xs mb-4">Matte black waterproof knit upper</p>
        <button onclick="addToCart('Apex Stealth Pro', 210)" class="w-full bg-slate-900 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-xl transition text-sm">Add to Cart</button>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-lg transition group">
        <div class="bg-slate-100 h-64 rounded-xl flex items-center justify-center text-4xl mb-4 group-hover:scale-[1.02] transition">🌊</div>
        <div class="flex justify-between items-start mb-1">
          <h4 class="font-bold text-lg">NeoTokyo Runner</h4>
          <span class="font-extrabold text-rose-600">$145</span>
        </div>
        <p class="text-slate-500 text-xs mb-4">Retro futuristic colorway aesthetics</p>
        <button onclick="addToCart('NeoTokyo Runner', 145)" class="w-full bg-slate-900 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-xl transition text-sm">Add to Cart</button>
      </div>
    </div>
  </main>
</div>
  <script>
    let cartCount = 0;
    let cartItems = [];

    function addToCart(name, price) {
      cartCount++;
      cartItems.push({ name, price });
      document.getElementById('cart-count').innerText = cartCount;
      alert('Added ' + name + ' to your cart!');
    }

    function toggleCart() {
      if (cartItems.length === 0) {
        alert('Your cart is currently empty.');
      } else {
        const list = cartItems.map(i => i.name + ' - $' + i.price).join('\\n');
        alert('Cart Items:\\n' + list + '\\n\\nTotal Items: ' + cartCount);
      }
    }

    function filterProducts(category) {
      alert('Filtered products by category: ' + category);
    }
  </script>
</body>
</html>`
  },
  {
    id: 'pomodoro-timer',
    title: 'FocusFlow Pomodoro Timer',
    category: 'Utility',
    description: 'Productivity timer with session customization, task manager, and audio chime alerts.',
    prompt: 'Build a Pomodoro focus timer with 25m work / 5m break modes, audio notification simulation, and task checklist.',
    badge: 'Utility',
    iconName: 'Clock',
    html: `
<div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
  <div class="max-w-md w-full bg-slate-800/80 border border-slate-700/80 rounded-3xl p-8 shadow-2xl backdrop-blur">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-xl font-bold flex items-center gap-2">🍅 FocusFlow</h1>
      <div class="flex bg-slate-900/80 p-1 rounded-xl text-xs font-semibold">
        <button onclick="setMode('work')" id="btn-work" class="px-3 py-1.5 rounded-lg bg-rose-600 text-white transition">Pomodoro</button>
        <button onclick="setMode('break')" id="btn-break" class="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition">Break</button>
      </div>
    </div>

    <!-- Timer Circle -->
    <div class="flex flex-col items-center justify-center my-8">
      <div class="w-64 h-64 rounded-full border-8 border-slate-700/60 flex items-center justify-center relative shadow-inner bg-slate-900/40">
        <div class="text-center">
          <div id="timer-display" class="text-5xl font-extrabold tracking-tighter mb-1">25:00</div>
          <p id="timer-status" class="text-xs text-rose-400 font-semibold uppercase tracking-wider">Ready to Focus</p>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex gap-4 mb-8">
      <button onclick="toggleTimer()" id="btn-toggle" class="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-rose-600/30">Start Focus</button>
      <button onclick="resetTimer()" class="px-5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3.5 rounded-2xl transition">Reset</button>
    </div>

    <!-- Tasks -->
    <div>
      <h3 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Today's Focus Tasks</h3>
      <div class="space-y-2">
        <div class="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
          <input type="checkbox" checked class="rounded border-slate-700 text-rose-600 focus:ring-0">
          <span class="text-sm line-through text-slate-500">Design landing page wireframes</span>
        </div>
        <div class="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
          <input type="checkbox" class="rounded border-slate-700 text-rose-600 focus:ring-0">
          <span class="text-sm text-slate-200">Implement authentication backend</span>
        </div>
      </div>
    </div>
  </div>
</div>
`,
    css: ``,
    js: `
let timerInterval = null;
let timeLeft = 1500;
let isRunning = false;
let currentMode = 'work';

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById('timer-display').innerText = 
    String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

function toggleTimer() {
  const btn = document.getElementById('btn-toggle');
  if (isRunning) {
    clearInterval(timerInterval);
    isRunning = false;
    btn.innerText = 'Resume';
    btn.className = 'flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-emerald-600/30';
  } else {
    isRunning = true;
    btn.innerText = 'Pause';
    btn.className = 'flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-amber-600/30';
    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
      } else {
        clearInterval(timerInterval);
        isRunning = false;
        alert('Pomodoro session completed! Take a break.');
        resetTimer();
      }
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  timeLeft = currentMode === 'work' ? 1500 : 300;
  updateDisplay();
  const btn = document.getElementById('btn-toggle');
  btn.innerText = 'Start Focus';
  btn.className = 'flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-rose-600/30';
}

function setMode(mode) {
  currentMode = mode;
  clearInterval(timerInterval);
  isRunning = false;
  timeLeft = mode === 'work' ? 1500 : 300;
  updateDisplay();
  document.getElementById('btn-work').className = mode === 'work' ? 'px-3 py-1.5 rounded-lg bg-rose-600 text-white transition' : 'px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition';
  document.getElementById('btn-break').className = mode === 'break' ? 'px-3 py-1.5 rounded-lg bg-emerald-600 text-white transition' : 'px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition';
  document.getElementById('timer-status').innerText = mode === 'work' ? 'Ready to Focus' : 'Relax & Recharge';
}
`,
    fullCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FocusFlow Pomodoro Timer</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body class="bg-slate-900 text-slate-100 font-sans">
  <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
  <div class="max-w-md w-full bg-slate-800/80 border border-slate-700/80 rounded-3xl p-8 shadow-2xl backdrop-blur">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-xl font-bold flex items-center gap-2">🍅 FocusFlow</h1>
      <div class="flex bg-slate-900/80 p-1 rounded-xl text-xs font-semibold">
        <button onclick="setMode('work')" id="btn-work" class="px-3 py-1.5 rounded-lg bg-rose-600 text-white transition">Pomodoro</button>
        <button onclick="setMode('break')" id="btn-break" class="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition">Break</button>
      </div>
    </div>

    <!-- Timer Circle -->
    <div class="flex flex-col items-center justify-center my-8">
      <div class="w-64 h-64 rounded-full border-8 border-slate-700/60 flex items-center justify-center relative shadow-inner bg-slate-900/40">
        <div class="text-center">
          <div id="timer-display" class="text-5xl font-extrabold tracking-tighter mb-1">25:00</div>
          <p id="timer-status" class="text-xs text-rose-400 font-semibold uppercase tracking-wider">Ready to Focus</p>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex gap-4 mb-8">
      <button onclick="toggleTimer()" id="btn-toggle" class="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-rose-600/30">Start Focus</button>
      <button onclick="resetTimer()" class="px-5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3.5 rounded-2xl transition">Reset</button>
    </div>

    <!-- Tasks -->
    <div>
      <h3 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Today's Focus Tasks</h3>
      <div class="space-y-2">
        <div class="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
          <input type="checkbox" checked class="rounded border-slate-700 text-rose-600 focus:ring-0">
          <span class="text-sm line-through text-slate-500">Design landing page wireframes</span>
        </div>
        <div class="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
          <input type="checkbox" class="rounded border-slate-700 text-rose-600 focus:ring-0">
          <span class="text-sm text-slate-200">Implement authentication backend</span>
        </div>
      </div>
    </div>
  </div>
</div>
  <script>
    let timerInterval = null;
    let timeLeft = 1500;
    let isRunning = false;
    let currentMode = 'work';

    function updateDisplay() {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      document.getElementById('timer-display').innerText = 
        String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    }

    function toggleTimer() {
      const btn = document.getElementById('btn-toggle');
      if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
        btn.innerText = 'Resume';
        btn.className = 'flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-emerald-600/30';
      } else {
        isRunning = true;
        btn.innerText = 'Pause';
        btn.className = 'flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-amber-600/30';
        timerInterval = setInterval(() => {
          if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
          } else {
            clearInterval(timerInterval);
            isRunning = false;
            alert('Pomodoro session completed! Take a break.');
            resetTimer();
          }
        }, 1000);
      }
    }

    function resetTimer() {
      clearInterval(timerInterval);
      isRunning = false;
      timeLeft = currentMode === 'work' ? 1500 : 300;
      updateDisplay();
      const btn = document.getElementById('btn-toggle');
      btn.innerText = 'Start Focus';
      btn.className = 'flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-rose-600/30';
    }

    function setMode(mode) {
      currentMode = mode;
      clearInterval(timerInterval);
      isRunning = false;
      timeLeft = mode === 'work' ? 1500 : 300;
      updateDisplay();
      document.getElementById('btn-work').className = mode === 'work' ? 'px-3 py-1.5 rounded-lg bg-rose-600 text-white transition' : 'px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition';
      document.getElementById('btn-break').className = mode === 'break' ? 'px-3 py-1.5 rounded-lg bg-emerald-600 text-white transition' : 'px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition';
      document.getElementById('timer-status').innerText = mode === 'work' ? 'Ready to Focus' : 'Relax & Recharge';
    }
  </script>
</body>
</html>`
  }
];
