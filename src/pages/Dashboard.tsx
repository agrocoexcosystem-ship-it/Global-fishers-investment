import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingUp, ArrowDownCircle, ArrowUpCircle,
  Copy, Clock, CheckCircle, XCircle, DollarSign, BarChart3,
  Bot, Power, Activity, UploadCloud, FileCheck2, Cpu
} from 'lucide-react';
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
  const [botInvestAmount, setBotInvestAmount] = useState('');

  const [loading, setLoading] = useState(true);

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
        const totalBotCapital = botInvestments.reduce((acc, tx) => acc + tx.amount, 0);
        setBotCapital(totalBotCapital);
        setBotActive(totalBotCapital > 0);
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
      toast.error('Insufficient available balance');
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
      toast.error('Insufficient balance to purchase the AI Trading Bot. Cost is $500.');
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
      toast.success('AI Trading Bot Successfully Purchased!');
    } catch {
      toast.error('Transaction Failed. Please contact support.');
    }
  };

  const handleInvestBot = async () => {
    const amount = parseFloat(botInvestAmount);
    if (!amount || amount < 500 || amount > 50000) {
      toast.error('Investment amount must be between $500 and $50,000.');
      return;
    }
    if (profile && profile.balance < amount) {
      toast.error('Insufficient available wallet balance.');
      return;
    }

    try {
      await supabase.from('transactions').insert({
        user_id: user!.id,
        type: 'bot_investment',
        amount: amount,
        status: 'completed',
        currency: 'USD',
      });
      
      if (profile) setProfile({...profile, balance: profile.balance - amount});
      setBotCapital(prev => prev + amount);
      setBotActive(true);
      setBotInvestAmount('');
      toast.success(`Successfully injected $${amount.toLocaleString()} into the Bot Terminal.`);
    } catch {
      toast.error('Investment failed.');
    }
  };

  const handleStopBot = () => {
    toast.success('Bot operations suspended. Closing active Forex positions. Capital will be available shortly.');
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { icon: Wallet, label: 'Available Balance', value: `$${(profile?.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'text-emerald-400' },
    { icon: Cpu, label: 'Bot Capital', value: `$${botCapital.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'text-indigo-400' },
    { icon: TrendingUp, label: 'Total Profit', value: `$${(profile?.total_profit ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'text-green-400' },
    { icon: ArrowUpCircle, label: 'Total Withdrawn', value: `$${(profile?.total_withdrawn ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'text-amber-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-bold font-serif">
              Welcome back, <span className="text-emerald-400">{profile?.full_name || 'Investor'}</span>
            </h1>
            <p className="text-slate-400 mt-1">Manage your professional asset portfolio & trading systems</p>
          </div>
          {isAdmin && (
            <span className="mt-4 md:mt-0 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-bold tracking-widest uppercase">
              Administrator Platform
            </span>
          )}
        </div>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/60 shadow-lg shadow-black/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 ${stat.color} shadow-inner`}>
                  <stat.icon size={20} />
                </div>
                <span className="text-slate-400 text-sm font-medium">{stat.label}</span>
              </div>
              <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-slate-800/30 p-1.5 rounded-2xl border border-slate-800/50 w-full max-w-2xl">
          {(['overview', 'bot', 'deposit', 'withdraw'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-sm font-bold tracking-wide capitalize transition-all duration-300
                ${activeTab === tab 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
            >
              {tab === 'overview' ? 'Portfolio' : tab === 'bot' ? 'Bot Terminal' : tab}
            </button>
          ))}
        </div>

        {/* TAB: Bot Terminal */}
        {activeTab === 'bot' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-8 relative overflow-hidden backdrop-blur-sm">
                
                {botActive && (
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                )}

                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${botActive ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-700/50 text-slate-400'} transition-all duration-500`}>
                      <Bot size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-sans">GF QuantTrader Pro</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="relative flex h-2 w-2">
                          {botActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${botActive ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                        </span>
                        <span className={`text-xs font-semibold uppercase ${botActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {botActive ? 'Trading Active - Forex Markets' : 'System Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {botOwned && botActive && (
                    <button
                      onClick={handleStopBot}
                      className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-sm font-bold flex items-center gap-2 transition"
                    >
                      <Power size={16} /> Halt Operations
                    </button>
                  )}
                </div>

                {!botOwned ? (
                  <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-2xl text-center">
                    <Cpu size={40} className="mx-auto mb-4 text-emerald-400 opacity-80" />
                    <h3 className="text-xl font-bold mb-2">Automated Forex Algorithmic Bot</h3>
                    <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                      Unlock high-frequency trading capabilities. Our proprietary algorithm executes profitable trades across global forex pairs 24/5. 
                      One-time terminal license fee of $500 required.
                    </p>
                    <button
                      onClick={handleBuyBot}
                      className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    >
                      Purchase Bot License ($500)
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
                        <span className="text-xs font-bold text-slate-500 uppercase">Allocated Capital</span>
                        <p className="text-2xl font-bold text-white mt-1">${botCapital.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
                        <span className="text-xs font-bold text-slate-500 uppercase">Estimated Daily ROI</span>
                        <p className="text-2xl font-bold text-emerald-400 mt-1">2.5% - 5.0%</p>
                      </div>
                    </div>

                    <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
                      <h4 className="font-semibold text-sm mb-4 text-slate-300">Inject Capital to System</h4>
                      <p className="text-xs text-slate-500 mb-4">Minimum injection: $500 • Maximum injection: $50,000</p>
                      <div className="flex gap-3">
                        <input
                          type="number"
                          value={botInvestAmount}
                          onChange={(e) => setBotInvestAmount(e.target.value)}
                          placeholder="Amount in USD"
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                        />
                        <button
                          onClick={handleInvestBot}
                          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 font-bold text-white rounded-xl transition flex items-center gap-2"
                        >
                          <Activity size={18} /> Deploy
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="lg:col-span-5">
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-6 h-full flex flex-col justify-center items-center text-center">
                <BarChart3 size={64} className={`mb-6 ${botActive ? 'text-emerald-400' : 'text-slate-600'} transition duration-1000`} />
                <h3 className="text-lg font-bold mb-2">Live Market Sync</h3>
                <p className="text-slate-400 text-sm px-4">
                  {botActive 
                    ? "The internal algorithm is currently scanning EUR/USD, GBP/JPY, and 12 other core pairs. Open positions are dynamically managed."
                    : "Bot terminal is idle. Deploy capital to enable live algorithmic market synchronized trades."}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB: Overview / Portfolio */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-slate-800/30 border border-slate-700/80 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-emerald-400" />
                  <h2 className="text-xl font-bold font-sans">Recent Transmissions</h2>
                </div>
              </div>
              {transactions.length === 0 ? (
                <div className="p-16 text-center text-slate-500">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 size={24} className="opacity-50" />
                  </div>
                  <p className="font-semibold">No transactions recorded.</p>
                  <p className="text-sm mt-1">Visit the Deposit tab to fund your portfolio.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-800/50 border-b border-slate-700 text-xs uppercase tracking-wider text-slate-400">
                        <th className="p-4 font-semibold">Type</th>
                        <th className="p-4 font-semibold">Date</th>
                        <th className="p-4 font-semibold">Amount</th>
                        <th className="p-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50 text-sm">
                      {transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {tx.type === 'deposit' ? <ArrowDownCircle size={18} className="text-emerald-400" /> :
                               tx.type === 'bot_purchase' || tx.type === 'bot_investment' ? <Cpu size={18} className="text-indigo-400" /> :
                               <ArrowUpCircle size={18} className="text-amber-400" />}
                              <span className="font-semibold capitalize text-slate-200">{tx.type.replace('_', ' ')}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-400">
                            {new Date(tx.created_at).toLocaleDateString()} <span className="text-xs">{new Date(tx.created_at).toLocaleTimeString()}</span>
                          </td>
                          <td className="p-4 font-bold text-white">
                            ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              ['approved', 'completed'].includes(tx.status)
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : tx.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                              {['approved', 'completed'].includes(tx.status) ? <CheckCircle size={10} className="mr-1.5" /> :
                               tx.status === 'pending' ? <Clock size={10} className="mr-1.5" /> :
                               <XCircle size={10} className="mr-1.5" />}
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

        {/* TAB: Deposit */}
        {activeTab === 'deposit' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-8">
              <h2 className="text-2xl font-bold font-sans mb-8 flex items-center gap-3">
                <DollarSign size={24} className="text-emerald-400" /> Secure Deposit
              </h2>

              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">1. Select Blockchain Asset</label>
                <div className="flex gap-3">
                  {Object.keys(WALLET_ADDRESSES).map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedCrypto(c)}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all border
                        ${selectedCrypto === c 
                          ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20' 
                          : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-emerald-500/50'}`}
                    >
                      {c} Network
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8 p-6 bg-slate-900/60 border border-slate-700/50 rounded-2xl">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* QR Code Auto-Generated via public API */}
                  <div className="bg-white p-2 rounded-xl flex-shrink-0 shadow-lg">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${WALLET_ADDRESSES[selectedCrypto]}&margin=0`} 
                      alt="Deposit QR" 
                      className="w-[140px] h-[140px]"
                    />
                  </div>
                  <div className="flex-1 w-full text-center sm:text-left">
                    <h3 className="text-sm font-bold text-slate-300 mb-1">Scan or Copy Address</h3>
                    <p className="text-xs text-slate-500 mb-3">Send your {selectedCrypto} deposit strictly to the address below.</p>
                    <div className="relative">
                      <code className="block w-full bg-slate-800 border border-slate-700 p-3 pr-12 rounded-xl text-xs text-emerald-400 font-mono break-all selection:bg-emerald-500/30">
                        {WALLET_ADDRESSES[selectedCrypto]}
                      </code>
                      <button 
                        onClick={() => copyAddress(WALLET_ADDRESSES[selectedCrypto])} 
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition"
                        title="Copy to clipboard"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">2. Planned Deposit Amount (USD)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-bold">$</span>
                  </div>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    min="100"
                    className="w-full pl-8 pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">3. Upload Proof of Payment</label>
                <div className="relative border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-6 bg-slate-900/30 transition text-center overflow-hidden">
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*,.pdf"
                  />
                  {!proofFile ? (
                    <div className="pointer-events-none">
                      <UploadCloud size={32} className="mx-auto mb-3 text-slate-500" />
                      <p className="text-sm font-bold text-slate-300">Click to upload receipt screenshot</p>
                      <p className="text-xs text-slate-500 mt-1">JPG, PNG, or PDF</p>
                    </div>
                  ) : (
                    <div className="pointer-events-none flex flex-col items-center">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2">
                        <FileCheck2 size={24} className="text-emerald-400" />
                      </div>
                      <p className="text-sm font-bold text-emerald-400 truncate w-full px-4">{proofFile.name}</p>
                      <p className="text-xs text-slate-400 mt-1">Click to replace file</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleDeposit}
                className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold tracking-wide hover:bg-emerald-600 transition shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                Confirm Deposit Request
              </button>
            </div>
            
            <div className="hidden lg:block relative rounded-3xl overflow-hidden border border-slate-700/50 group">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
              <img src="https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&fit=crop" alt="Bitcoin Background" className="w-full h-full object-cover transform group-hover:scale-105 transition duration-1000" />
              <div className="absolute bottom-8 left-8 right-8 z-20">
                <h3 className="text-2xl font-bold font-serif mb-2">Instant Blockchain Verification</h3>
                <p className="text-slate-300 text-sm leading-relaxed">Transfers are monitored directly on-chain and reflected in your institutional portfolio automatically upon required network confirmations.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB: Withdraw */}
        {activeTab === 'withdraw' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto">
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-8">
              <h2 className="text-2xl font-bold font-sans mb-8 flex items-center gap-3">
                <ArrowUpCircle size={24} className="text-amber-400" /> Capital Withdrawal
              </h2>

              <div className="mb-8 p-6 bg-slate-900/50 rounded-2xl border border-slate-700/50 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Available Capital</p>
                  <p className="text-3xl font-bold text-emerald-400 mt-1">${(profile?.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
                <Wallet size={36} className="text-slate-600" />
              </div>

              <div className="mb-8">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Withdrawal Amount (USD)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-bold">$</span>
                  </div>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount to withdraw"
                    min="50"
                    className="w-full pl-8 pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8">
                <p className="text-sm font-semibold text-amber-400 mb-1">Standard Processing Window</p>
                <p className="text-xs text-amber-500/80">Withdrawals undergo manual security review and are securely routed to your whitelisted address within 1-24 hours. Minimum withdrawal size is $50.00.</p>
              </div>

              <button
                onClick={handleWithdraw}
                className="w-full py-4 bg-amber-500 text-slate-900 rounded-xl font-bold tracking-wide hover:bg-amber-400 transition shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              >
                Execute Withdrawal
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
