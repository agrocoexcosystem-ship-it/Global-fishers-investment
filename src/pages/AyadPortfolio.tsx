import { motion } from 'framer-motion';
import { 
  TrendingUp, Wallet, BarChart3, PieChart as PieChartIcon, 
  ArrowUpRight, ShieldCheck, Globe, Briefcase, ChevronRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const PERFORMANCE_DATA = [
  { month: 'Jan', value: 45000 },
  { month: 'Feb', value: 52000 },
  { month: 'Mar', value: 48000 },
  { month: 'Apr', value: 61000 },
  { month: 'May', value: 85000 },
  { month: 'Jun', value: 102000 },
  { month: 'Jul', value: 125000 },
  { month: 'Aug', value: 142000 },
  { month: 'Sep', value: 162000 },
];

const ALLOCATION_DATA = [
  { name: 'Forex', value: 35, color: '#10b981' },
  { name: 'Equities', value: 25, color: '#3b82f6' },
  { name: 'Commodities', value: 20, color: '#f59e0b' },
  { name: 'Digital Assets', value: 20, color: '#8b5cf6' },
];

export default function AyadPortfolio() {
  const stats = [
    { label: 'Net Worth', value: '€21,000.00', icon: Wallet, color: 'text-emerald-400' },
    { label: 'Total Profit', value: '€162,000.00', icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Annual ROI', value: '24.8%', icon: ArrowUpRight, color: 'text-emerald-400' },
    { label: 'Risk Level', value: 'Moderate', icon: ShieldCheck, color: 'text-emerald-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-50" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center gap-8 mb-12"
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-800 flex items-center justify-center text-4xl font-bold border-4 border-slate-800 shadow-xl shadow-emerald-500/20">
              AF
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-bold mb-2">Ayad Fadel</h1>
              <p className="text-emerald-400 font-medium flex items-center justify-center md:justify-start gap-2">
                <Briefcase size={18} /> Elite Institutional Investor
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-400">ID: GF-99284</span>
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400 font-semibold uppercase">Verified Account</span>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg bg-slate-900 ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                  <span className="text-slate-400 text-sm font-medium">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Chart */}
          <div className="lg:col-span-2 p-8 rounded-3xl bg-slate-800/30 border border-slate-700">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BarChart3 className="text-emerald-400" /> Performance History
              </h2>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-emerald-500 text-white rounded-md text-xs font-bold">ALL</button>
                <button className="px-3 py-1 bg-slate-700 text-slate-300 rounded-md text-xs">1Y</button>
                <button className="px-3 py-1 bg-slate-700 text-slate-300 rounded-md text-xs">6M</button>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PERFORMANCE_DATA}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Asset Allocation */}
          <div className="p-8 rounded-3xl bg-slate-800/30 border border-slate-700">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
              <PieChartIcon className="text-emerald-400" /> Asset Allocation
            </h2>
            <div className="h-[250px] w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ALLOCATION_DATA}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ALLOCATION_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {ALLOCATION_DATA.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-slate-400">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Investment Details */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Globe className="text-emerald-400" size={20} /> Regional Exposure
            </h3>
            <div className="space-y-4">
              {[
                { region: 'Europe (EU)', exposure: '45%' },
                { region: 'North America', exposure: '30%' },
                { region: 'Asia Pacific', exposure: '15%' },
                { region: 'Emerging Markets', exposure: '10%' },
              ].map((r, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">{r.region}</span>
                    <span className="font-bold">{r.exposure}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: r.exposure }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ShieldCheck className="text-emerald-400" size={20} /> Strategy Overview
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Ayad Fadel's portfolio follows a diversified institutional approach, 
                leveraging Global Fishers' proprietary algorithmic trading models. 
                The current strategy focuses on high-liquidity forex pairs and 
                large-cap equities to maintain a moderate risk profile while 
                maximizing compound growth.
              </p>
            </div>
            <button className="w-full py-4 bg-slate-800 border border-slate-700 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition">
              View Detailed Audit Report <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-emerald-500/5 border-t border-slate-800">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Invest Like a Professional</h2>
          <p className="text-slate-400 mb-8">
            Global Fishers provides the same institutional-grade infrastructure and 
            quantitative strategies used by elite investors like Ayad Fadel.
          </p>
          <button className="px-10 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20">
            Open Your Account Today
          </button>
        </div>
      </section>
    </div>
  );
}
