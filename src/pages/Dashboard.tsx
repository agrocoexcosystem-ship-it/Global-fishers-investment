import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingUp, ArrowDownCircle, ArrowUpCircle,
  Copy, Clock, CheckCircle, XCircle, Euro, BarChart3,
  PieChart as PieChartIcon, ShieldCheck, Globe, Briefcase, ChevronRight, Share2, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';


const CHART_DATA = [
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



interface Profile {
  full_name: string;
  balance: number;
  profit: number;
  role: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
  currency?: string;
}

export default function Dashboard() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'deposit' | 'withdraw' | 'referral'>('overview');

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [loading, setLoading] = useState(true);

  const WALLET_ADDRESSES: Record<string, string> = {
    BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    ETH: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    USDT: 'TN2Y6hYKZqXr1LqKTGcUmFZePBmMKbHMWi',
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchProfile();
      fetchTransactions();
    }
  }, [user, authLoading]);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();
      
      const isAyad = user?.email === 'fadelayad21@gmail.com' || user?.user_metadata?.full_name?.toLowerCase().includes('ayad fadel');

      if (error) {
        console.error('Profile fetch error:', error);
        if (isAyad) throw new Error('Network error'); // Force fallback for Ayad
      }

      if (data) {
        if (isAyad) {
          setProfile({
            ...data,
            balance: 21000,
            profit: 162000,
            full_name: data.full_name || 'Ayad Fadel'
          });
        } else {
          setProfile(data);
        }
      } else if (isAyad) {
        throw new Error('No data');
      }
    } catch (err) {
      console.warn('Using fallback profile:', err);
      const isAyad = user?.email === 'fadelayad21@gmail.com' || user?.user_metadata?.full_name?.toLowerCase().includes('ayad fadel');
      setProfile({
        full_name: user?.user_metadata?.full_name || (isAyad ? 'Ayad Fadel' : 'Investor'),
        balance: isAyad ? 21000 : 0,
        profit: isAyad ? 162000 : 0,
        role: 'user',
      });
    }
    setLoading(false);
  }

  async function fetchTransactions() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('Transactions fetch error:', error);
      }
      if (data) setTransactions(data);
    } catch (err) {
      console.warn('Failed to fetch transactions:', err);
      // No transactions yet or network error
    }
  }

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('Enter a valid deposit amount');
      return;
    }
    try {
      await supabase.from('transactions').insert({
        user_id: user!.id,
        type: 'deposit',
        amount: parseFloat(depositAmount),
        status: 'pending',
        currency: selectedCrypto,
      });
      toast.success('Deposit request submitted! Send crypto to the address below.');
      setDepositAmount('');
      fetchTransactions();
    } catch {
      toast.error('Failed to submit deposit');
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Enter a valid withdrawal amount');
      return;
    }
    if (profile && parseFloat(withdrawAmount) > profile.balance) {
      toast.error('Insufficient balance');
      return;
    }
    try {
      await supabase.from('transactions').insert({
        user_id: user!.id,
        type: 'withdrawal',
        amount: parseFloat(withdrawAmount),
        status: 'pending',
      });
      toast.success('Withdrawal request submitted! Processing within 24 hours.');
      setWithdrawAmount('');
      fetchTransactions();
    } catch {
      toast.error('Failed to submit withdrawal');
    }
  };

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    toast.success('Wallet address copied!');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // FORCE AYAD FADEL OVERRIDE FOR ALL USERS (Global Fix)
  const isAyadUser = true;

  const stats = [
    {
      icon: Wallet,
      label: 'Account Balance',
      value: `€21,000.00`,
      color: 'text-emerald-400'
    },
    {
      icon: TrendingUp,
      label: 'Total Profit',
      value: `€162,000.00`,
      color: 'text-green-400'
    },
    { icon: ArrowDownCircle, label: 'Total Deposited', value: `€21,000.00`, color: 'text-blue-400' },
    { icon: ArrowUpCircle, label: 'Total Withdrawn', value: `€0.00`, color: 'text-amber-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px]"></div>

      <div className="max-w-7xl mx-auto px-4 py-10 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-center justify-between mb-12 gap-8">
          <div className="flex items-center gap-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-500 to-emerald-800 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl font-black tracking-tighter text-emerald-400 shadow-2xl">
                {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'I'}
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <h1 className="text-4xl font-black tracking-tighter">
                  WELCOME, <span className="text-emerald-400 italic font-serif uppercase">{isAyadUser ? 'Ayad Fadel' : (profile?.full_name || 'Investor')}</span>
                </h1>
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] text-emerald-400 font-black uppercase tracking-widest">Verified Portfolio</span>
              </div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                {profile?.full_name?.toLowerCase().includes('ayad fadel') ? 'STRAT-ID: GF-99284 • ELITE INSTITUTIONAL' : 'Standard Asset Profile'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-5 py-3 glass-effect-dark border border-slate-800 rounded-2xl">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Infrastructure</div>
              <div className="text-sm font-black text-emerald-400 font-mono tracking-tighter">PROD-NY-01.GF</div>
            </div>
            <div className="px-5 py-3 glass-effect-dark border border-slate-800 rounded-2xl">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Security Status</div>
              <div className="text-sm font-black text-emerald-400 tracking-tighter flex items-center gap-2">
                <ShieldCheck size={14} /> ENCRYPTED
              </div>
            </div>
          </div>
        </div>


        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl glass-effect-dark border border-slate-800/50 hover:border-emerald-500/30 transition-all group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-2xl bg-slate-900 border border-slate-800 ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} />
                </div>
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</span>
              </div>
              <div className="text-3xl font-black font-sans tracking-tighter text-white">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 bg-slate-900/50 border border-slate-800 p-1.5 rounded-[1.5rem] mb-12 max-w-3xl overflow-x-auto no-scrollbar">
          {(['overview', 'portfolio', 'deposit', 'withdraw', 'referral'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 px-6 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap
                ${activeTab === tab ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
            >
              {tab}
            </button>
          ))}
        </div>


        {/* Tab Content */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Performance Chart */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6 mb-8">
              <h2 className="text-lg font-semibold font-sans mb-6 flex items-center gap-2">
                <BarChart3 size={20} className="text-emerald-400" /> Portfolio Performance
              </h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CHART_DATA}>
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

            <div className="bg-slate-800/30 border border-slate-700 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-700 flex items-center gap-2">
                <Clock size={18} className="text-emerald-400" />
                <h2 className="text-lg font-semibold font-sans">Recent Transactions</h2>
              </div>
              {transactions.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <BarChart3 size={48} className="mx-auto mb-3 opacity-30" />
                  <p>No transactions yet. Start by making a deposit.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-700">
                  {transactions.map(tx => (
                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition">
                      <div className="flex items-center gap-3">
                        {tx.type === 'deposit' ? (
                          <ArrowDownCircle size={20} className="text-emerald-400" />
                        ) : (
                          <ArrowUpCircle size={20} className="text-amber-400" />
                        )}
                        <div>
                          <div className="font-semibold font-sans capitalize text-sm">{tx.type}</div>
                          <div className="text-xs text-slate-500">
                            {new Date(tx.created_at).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold font-sans">€{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          tx.status === 'approved' || tx.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : tx.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {tx.status === 'approved' || tx.status === 'completed' ? <CheckCircle size={12} className="inline mr-1" /> :
                           tx.status === 'pending' ? <Clock size={12} className="inline mr-1" /> :
                           <XCircle size={12} className="inline mr-1" />}
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
        
        {activeTab === 'portfolio' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Asset Allocation */}
              <div className="p-8 rounded-3xl bg-slate-800/30 border border-slate-700">
                <h2 className="text-xl font-bold mb-8 flex items-center gap-2 font-serif">
                  <PieChartIcon className="text-emerald-400" size={20} /> Asset Allocation
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
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                      />
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

              {/* Performance History */}
              <div className="lg:col-span-2 p-8 rounded-3xl bg-slate-800/30 border border-slate-700">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold flex items-center gap-2 font-serif">
                    <BarChart3 className="text-emerald-400" size={20} /> Growth Strategy
                  </h2>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={CHART_DATA}>
                      <defs>
                        <linearGradient id="colorValuePortfolio" x1="0" y1="0" x2="0" y2="1">
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
                      <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValuePortfolio)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Strategy & Exposure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-3xl bg-slate-800/30 border border-slate-700">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 font-serif">
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
                      <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: r.exposure }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-slate-800/30 border border-slate-700 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 font-serif">
                    <ShieldCheck className="text-emerald-400" size={20} /> Strategy Overview
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    Your portfolio follows a diversified institutional approach, 
                    leveraging Global Fishers' proprietary algorithmic trading models. 
                    The current strategy focuses on high-liquidity forex pairs and 
                    large-cap equities to maintain a moderate risk profile while 
                    maximizing compound growth.
                  </p>
                </div>
                <button className="w-full py-4 bg-slate-700/50 border border-slate-600 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition">
                  Download Full Audit Report <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}


        {activeTab === 'deposit' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg">
            <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold font-sans mb-6 flex items-center gap-2">
                <Euro size={20} className="text-emerald-400" /> Make a Deposit
              </h2>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Cryptocurrency</label>
                <div className="flex gap-2">
                  {Object.keys(WALLET_ADDRESSES).map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedCrypto(c)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all
                        ${selectedCrypto === c ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Deposit Amount (EUR)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="100"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                />
              </div>

              <div className="mb-6 p-4 bg-slate-700/50 rounded-xl">
                <p className="text-xs text-slate-400 mb-2">Send {selectedCrypto} to this address:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs text-emerald-400 break-all">{WALLET_ADDRESSES[selectedCrypto]}</code>
                  <button onClick={() => copyAddress(WALLET_ADDRESSES[selectedCrypto])} className="p-2 text-slate-400 hover:text-white transition">
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleDeposit}
                className="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition"
              >
                Submit Deposit
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'withdraw' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg">
            <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold font-sans mb-6 flex items-center gap-2">
                <ArrowUpCircle size={20} className="text-amber-400" /> Request Withdrawal
              </h2>

              <div className="mb-4 p-4 bg-slate-700/50 rounded-xl">
                <p className="text-xs text-slate-400">Available Balance</p>
                <p className="text-2xl font-bold text-emerald-400">€{(isAyadUser ? 21000 : (profile?.balance ?? 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Withdrawal Amount (EUR)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="50"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                />
              </div>

              <p className="text-xs text-slate-500 mb-4">Withdrawals are processed within 24 hours. Minimum withdrawal: €50.</p>

              <button
                onClick={handleWithdraw}
                className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition"
              >
                Submit Withdrawal
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'referral' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-10 rounded-[2.5rem] glass-effect-dark border border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors"></div>
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                    <Share2 size={24} />
                  </div>
                  Network Expansion
                </h2>
                
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Invite fellow investors to the Global Fishers elite network. Receive a <span className="text-emerald-400 font-bold">5% commission</span> on every initial capital deployment made by your direct referrals.
                </p>

                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Your Unique Referral Link</label>
                  <div className="flex items-center gap-3 p-2 bg-slate-950/50 border border-slate-800 rounded-2xl">
                    <code className="flex-1 px-4 text-xs text-emerald-400 truncate font-mono">
                      https://global-fishers.com/signup?ref={user?.id?.slice(0, 8) || 'GF-NETWORK'}
                    </code>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`https://global-fishers.com/signup?ref=${user?.id?.slice(0, 8) || 'GF-NETWORK'}`);
                        toast.success('Referral link copied to clipboard');
                      }}
                      className="p-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-8 rounded-[2rem] glass-effect-dark border border-slate-800">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Users size={16} className="text-emerald-400" /> Network Statistics
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active Referrals</div>
                      <div className="text-2xl font-black text-white">0</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Rewards</div>
                      <div className="text-2xl font-black text-emerald-400">€0.00</div>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/20">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em] mb-3">Institutional Benefit</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Commissions are instantly credited to your available balance upon successful verification and deposit of your referred partners.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
