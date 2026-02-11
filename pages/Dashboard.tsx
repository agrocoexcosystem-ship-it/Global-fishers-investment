import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { INVESTMENT_PLANS, Logo } from '../constants';
import { ActiveInvestment, Transaction, BotTrade } from '../types';
import { supabase } from '../lib/supabase';
import BotTerminal from '../components/BotTerminal';
import {
  Wifi,
  Terminal,
  LogOut,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  ShieldCheck,
  Cpu,
  Globe,
  Zap,
  LayoutDashboard,
  CreditCard,
  History,
  Send,
  User,
  AlertTriangle,
  X,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  time: string;
  role: 'analyst' | 'bot' | 'user';
  type?: 'signal' | 'news' | 'chat';
}

const WALLET_ADDRESSES: Record<string, string> = {
  'Bitcoin (BTC)': 'bc1quv7wal02yhzhr5e67sdgjvpw2zxl6cevs2jy4n',
  'Ethereum (ETH)': '0xfd30aF1aff62C7602a874AA38155396347eECF0a',
  'USDT (TRC20)': 'T9yD8N34G6S6G6S6G6S6G6S6G6S6G6S6G6'
};

// ... (Constants remain same)
const FOREX_PAIRS = ['EUR/USD', 'GBP/JPY', 'USD/CHF', 'AUD/USD', 'XAU/USD'];
const BOT_STRATEGIES = [
  { id: 'scalp', name: 'Forex Scalper Pro', risk: 'Low', winRate: '92%', icon: '🏹' },
  { id: 'trend', name: 'Macro Trend Master', risk: 'Medium', winRate: '78%', icon: '🌊' },
  { id: 'neural', name: 'Neural Forex Arb', risk: 'High', winRate: '65%', icon: '🧠' },
];
const INITIAL_CHAT: ChatMessage[] = [
  { id: '1', user: 'Alpha Analyst', message: 'Watching XAU/USD closely at resistance level 2732.12.', time: '09:41', role: 'analyst', type: 'news' },
  { id: '2', user: 'Bot v3.1', message: 'SIGNAL: GBP/JPY BUY order executed at 191.45. TP: 192.10', time: '09:42', role: 'bot', type: 'signal' },
];

const getQRCodeUrl = (address: string) => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}`;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [view, setView] = useState<'overview' | 'bot' | 'documents' | 'security'>('overview');
  const [mainBalance, setMainBalance] = useState(0.00);
  const [profitBalance, setProfitBalance] = useState(0.00);
  const [activeInvestments, setActiveInvestments] = useState<ActiveInvestment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [botActive, setBotActive] = useState(false);
  const [botBalance, setBotBalance] = useState(0);
  const [botProfit, setBotProfit] = useState(0);
  const [selectedStrategy, setSelectedStrategy] = useState(BOT_STRATEGIES[0]);
  const [botHistory, setBotHistory] = useState<BotTrade[]>([]);
  const [chartData, setChartData] = useState<{ time: string; value: number; ma: number; rsi: number }[]>([]);
  const [botActiveInvestments, setBotActiveInvestments] = useState<ActiveInvestment[]>([]);

  // Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [cryptoPrices, setCryptoPrices] = useState([
    { symbol: 'EUR/USD', name: 'Euro', price: 1.0824, change: 0.12 },
    { symbol: 'GBP/JPY', name: 'Pound', price: 191.45, change: -0.22 },
    { symbol: 'XAU/USD', name: 'Gold', price: 2732.12, change: 1.45 },
    { symbol: 'BTC', name: 'Bitcoin', price: 92450.25, change: 1.25 },
  ]);

  const [activeModal, setActiveModal] = useState<'deposit' | 'withdraw' | 'invest-choice' | 'bot-fund' | 'bot-invest-confirm' | 'swap' | null>(null);
  const [withdrawStep, setWithdrawStep] = useState<'source' | 'details'>('source');
  const [withdrawSource, setWithdrawSource] = useState<'main' | 'profit'>('main');
  const [selectedPlanForInvest, setSelectedPlanForInvest] = useState<any>(null);
  const [amountInput, setAmountInput] = useState('');
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [assetType, setAssetType] = useState('Bitcoin (BTC)');
  const [isProcessing, setIsProcessing] = useState(false);
  const [addressError, setAddressError] = useState(false);
  const [fundSource, setFundSource] = useState<'main' | 'external'>('main');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      // Guest Mode Check
      const isGuest = localStorage.getItem('guestMode') === 'true';

      if ((error || !session) && !isGuest) {
        navigate('/login');
      } else {
        const currentUser = session?.user || (isGuest ? {
          id: 'guest',
          email: 'guest@investor.com',
          user_metadata: { full_name: 'Guest Investor' }
        } : null);

        setUser(currentUser);

        // Fetch Real Data or use Mock for Guest
        if (currentUser && !isGuest) {
          const { data: txData } = await supabase.from('transactions').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false });
          if (txData) setTransactions(txData as any);

          const { data: invData } = await supabase.from('investments').select('*').eq('user_id', currentUser.id).eq('status', 'active');
          if (invData) {
            const formattedInvestments: ActiveInvestment[] = invData.map((inv: any) => ({
              id: inv.id,
              planId: inv.plan_id,
              planName: INVESTMENT_PLANS.find(p => p.id === inv.plan_id)?.name || 'Custom Plan',
              amount: inv.amount,
              dailyReturn: inv.daily_return,
              startDate: inv.start_date,
              profitEarned: inv.total_profit,
              daysActive: Math.floor((Date.now() - new Date(inv.start_date).getTime()) / 86400000),
              totalDuration: Math.floor((new Date(inv.end_date).getTime() - new Date(inv.start_date).getTime()) / 86400000)
            }));
            setActiveInvestments(formattedInvestments);
          }

        } else {
          // Mock Transactions & Investments for Guest
          setTransactions([
            { id: '1', user_id: 'guest', type: 'deposit', amount: 5000, status: 'completed', created_at: new Date().toISOString(), method: 'Bitcoin', profiles: { username: 'Guest' } },
            { id: '2', user_id: 'guest', type: 'profit', amount: 150, status: 'completed', created_at: new Date(Date.now() - 86400000).toISOString(), method: 'System' }
          ]);
          setActiveInvestments([
            { id: '1', planId: 'gold', planName: 'Gold Wealth', amount: 2000, dailyReturn: 3.2, startDate: new Date().toISOString(), profitEarned: 64, daysActive: 1, totalDuration: 90 }
          ]);
        }

        setLoading(false);
      }
    };
    checkUser();

    // Listen for auth state changes locally
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const isGuest = localStorage.getItem('guestMode') === 'true';
      if (!session && !isGuest) navigate('/login');
      else if (session) setUser(session.user);
    });

    return () => subscription.unsubscribe();
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Google Translate Initialization for Dashboard
  useEffect(() => {
    const initTranslate = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,de,es,fr,zh-CN,hi,ar,pt,ru,ja,ko,it,tr,nl,vi,id,pl,th,sv,no,fi,el,cs,da,hu,ro,sk,bg,uk,he',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'google_translate_element');
      }
    };

    window.googleTranslateElementInit = initTranslate;

    if (window.google?.translate?.TranslateElement) {
      initTranslate();
    }
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error logging out:', error.message);
    navigate('/login');
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!loading) scrollToBottom();
  }, [chatMessages, loading]);

  useEffect(() => {
    if (loading) return;
    const timer = setInterval(() => {
      let totalPortfolioInc = 0;
      let totalBotInc = 0;

      if (activeInvestments.length > 0) {
        setActiveInvestments(prev => prev.map(inv => {
          const inc = (inv.amount * (inv.dailyReturn / 100)) / 28800;
          totalPortfolioInc += inc;
          return { ...inv, profitEarned: inv.profitEarned + inc };
        }));
      }

      if (botActive && botActiveInvestments.length > 0) {
        setBotActiveInvestments(prev => prev.map(inv => {
          const inc = (inv.amount * (inv.dailyReturn / 100)) / 28800;
          totalBotInc += inc;
          return { ...inv, profitEarned: inv.profitEarned + inc };
        }));
      }

      if (totalPortfolioInc > 0) setProfitBalance(p => p + totalPortfolioInc);
      if (totalBotInc > 0) {
        setBotProfit(p => p + totalBotInc);
        setBotBalance(b => b + totalBotInc);
      }
    }, 3000);

    const botTradeTimer = setInterval(() => {
      if (botActive && botBalance > 50) {
        const isWin = Math.random() < parseFloat(selectedStrategy.winRate) / 100;
        const pips = (Math.random() * 20 + 5) * (isWin ? 1 : -0.8);
        const tradeAmount = botBalance * 0.05;
        const tradePnl = (tradeAmount * (pips / 1000)) * (selectedStrategy.risk === 'High' ? 2 : 1);

        const newTrade: BotTrade = {
          id: Math.random().toString(36).substr(2, 6).toUpperCase(),
          pair: FOREX_PAIRS[Math.floor(Math.random() * FOREX_PAIRS.length)],
          type: Math.random() > 0.5 ? 'BUY' : 'SELL',
          price: 1.08 + (Math.random() * 0.1),
          amount: tradeAmount,
          pnl: tradePnl,
          pips: Math.floor(pips),
          timestamp: new Date().toLocaleTimeString()
        };

        setBotHistory(prev => [newTrade, ...prev].slice(0, 30));
        setBotProfit(p => p + tradePnl);
        setBotBalance(b => b + tradePnl);

        setChartData(prev => {
          const time = new Date().toLocaleTimeString([], { second: '2-digit' });
          const value = botProfit + tradePnl;
          const lastMa = prev.length > 0 ? prev[prev.length - 1].ma : value;
          const ma = lastMa * 0.9 + value * 0.1; // Simple smoothing
          const rsi = 30 + Math.random() * 40; // Mock RSI

          const newData = [...prev, { time, value, ma, rsi }];
          return newData.slice(-30);
        });

        if (Math.random() > 0.8) {
          const chatSignal: ChatMessage = {
            id: Date.now().toString(),
            user: 'Elite Bot',
            message: `SIGNAL: ${newTrade.type === 'BUY' ? 'BUY' : 'SELL'} order closed for ${newTrade.pair}. PnL: ${newTrade.pnl >= 0 ? '+' : ''}€${Math.abs(newTrade.pnl).toFixed(2)}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            role: 'bot',
            type: 'signal'
          };
          setChatMessages(prev => [...prev.slice(-20), chatSignal]);
        }
      }
    }, 4000);

    return () => { clearInterval(timer); clearInterval(botTradeTimer); };
  }, [activeInvestments, botActive, botActiveInvestments, botBalance, botProfit, selectedStrategy, loading]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      user: user?.email?.split('@')[0] || 'You',
      message: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role: 'user'
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      const analystMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        user: 'Alpha Analyst',
        message: 'Understood. Monitoring liquidity.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role: 'analyst'
      };
      setChatMessages(prev => [...prev, analystMsg]);
    }, 2000);
  };

  const openModal = (modal: typeof activeModal, plan?: any) => {
    setAmountInput('');
    setSelectedPlanForInvest(plan || null);
    setActiveModal(modal);
    if (modal === 'withdraw') { setWithdrawStep('source'); setWithdrawalAddress(''); }
  };

  const handleMainDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    const amt = parseFloat(amountInput);

    // Persist to Supabase
    if (user) {
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'deposit',
        amount: amt,
        status: 'pending',
        method: assetType
      });
    }

    setTimeout(() => {
      // Optimistic update with proper type
      const newTx: Transaction = {
        id: Date.now().toString(),
        user_id: user?.id,
        type: 'deposit',
        amount: amt,
        created_at: new Date().toISOString(),
        status: 'pending',
        method: assetType
      };
      setTransactions(prev => [newTx, ...prev]);
      setIsProcessing(false); setActiveModal(null); setAmountInput('');
      toast.success(`Deposit request of €${amt.toLocaleString()} sent successfully!`);
    }, 2000);
  };

  const handleMainWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError(false);
    const amt = parseFloat(amountInput);
    const sourceBalance = withdrawSource === 'main' ? mainBalance : profitBalance;

    if (amt > sourceBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (!withdrawalAddress.trim()) {
      setAddressError(true);
      toast.error('Input address');
      return;
    }

    setIsProcessing(true);

    // Persist to Supabase
    if (user) {
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'withdrawal',
        amount: amt,
        status: 'pending',
        method: `${assetType} (${withdrawSource})`
      });
    }

    setTimeout(() => {
      if (withdrawSource === 'main') setMainBalance(prev => prev - amt);
      else setProfitBalance(prev => prev - amt);

      const newTx: Transaction = {
        id: Date.now().toString(),
        user_id: user?.id,
        type: 'withdrawal',
        amount: amt,
        created_at: new Date().toISOString(),
        status: 'pending',
        method: `${assetType} (${withdrawSource})`
      };
      setTransactions(prev => [newTx, ...prev]);

      setIsProcessing(false); setActiveModal(null); setAmountInput('');
      toast.success(`Withdrawal request of €${amt.toLocaleString()} in process.`);
    }, 2500);
  };

  const handleSwap = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amountInput);
    if (amt > profitBalance) { toast.error('Insufficient profit balance.'); return; }
    setIsProcessing(true);
    setTimeout(() => {
      setProfitBalance(prev => prev - amt); setMainBalance(prev => prev + amt);
      setIsProcessing(false); setActiveModal(null); setAmountInput('');
      toast.success(`€${amt.toLocaleString()} successfully swapped to main balance!`);
    }, 1200);
  };

  const handleBotFund = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amountInput);
    if (isNaN(num) || num <= 0) return;
    if (num > mainBalance) { toast.error('Insufficient portfolio balance.'); return; }
    setMainBalance(prev => prev - num); setBotBalance(prev => prev + num);
    setActiveModal(null); setAmountInput('');
    toast.success(`€${num.toLocaleString()} successfully transferred to Bot Terminal!`);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <RefreshCw className="text-emerald-500 animate-spin" size={40} />
        <p className="text-emerald-500 font-bold uppercase tracking-[0.3em] text-[10px]">Authentication</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-24 pb-20 relative overflow-x-hidden font-sans">
      {/* Ticker Bar */}
      <div className="fixed top-0 left-0 w-full bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 z-50 h-10 flex items-center overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...cryptoPrices, ...cryptoPrices, ...cryptoPrices].map((item, i) => (
            <div key={i} className="flex items-center gap-4 px-8 border-r border-slate-800">
              <span className="font-black text-slate-500 text-[10px] uppercase tracking-widest">{item.symbol}</span>
              <span className="font-mono text-xs font-bold">${item.price.toFixed(item.symbol.includes('/') ? 4 : 2)}</span>
              <span className={`text-[10px] font-black ${item.change >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Navigation */}
      <header className="fixed top-10 left-0 w-full bg-[#020617]/90 backdrop-blur-xl border-b border-slate-800 z-40 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="scale-75 origin-left opacity-80 hover:opacity-100 transition-opacity"><Logo /></Link>
        </div>
        <div className="flex items-center gap-4">
          <div id="google_translate_element" className="mr-2"></div>
          <div className="text-right hidden sm:block">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Operator Identity</div>
            <div className="text-xs font-bold text-emerald-400 font-mono">{user?.email}</div>
          </div>
          <button onClick={handleLogout} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 mt-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex gap-2 bg-slate-900/40 p-1.5 rounded-xl border border-slate-800 w-fit">
            <button onClick={() => setView('overview')} className={`px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'overview' ? 'bg-emerald-600 shadow-xl text-white' : 'text-slate-500 hover:text-white'}`}>
              <LayoutDashboard size={16} /> Portfolio
            </button>
            <button onClick={() => setView('bot')} className={`px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'bot' ? 'bg-indigo-600 shadow-xl text-white' : 'text-slate-500 hover:text-white'}`}>
              <Terminal size={16} /> Bot Terminal
            </button>
            <button onClick={() => setView('documents')} className={`px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'documents' ? 'bg-indigo-600 shadow-xl text-white' : 'text-slate-500 hover:text-white'}`}>
              <FileText size={16} /> Documents
            </button>
            <button onClick={() => setView('security')} className={`px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'security' ? 'bg-indigo-600 shadow-xl text-white' : 'text-slate-500 hover:text-white'}`}>
              <ShieldCheck size={16} /> Security
            </button>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-emerald-500 text-xs font-bold">
            <Wifi size={14} className="animate-pulse" />
            System Active
          </div>
        </div>

        {view === 'overview' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            {/* Balance Cards */}
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-slate-800 rounded-lg"><Wallet className="text-white" size={20} /></div>
                    <span className="text-xs font-bold text-slate-500">EUR</span>
                  </div>
                  <div className="text-3xl font-black text-white tracking-tight">€{mainBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Main Capital</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-slate-800 rounded-lg"><TrendingUp className="text-emerald-400" size={20} /></div>
                    {profitBalance > 0 && <button onClick={() => openModal('swap')} className="text-[10px] bg-emerald-600/20 text-emerald-400 px-2 py-1 rounded font-bold hover:bg-emerald-600 hover:text-white transition-colors">SWAP</button>}
                  </div>
                  <div className="text-3xl font-black text-emerald-400 tracking-tight">€{profitBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Cumulative Profit</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-slate-800 rounded-lg"><CreditCard className="text-indigo-400" size={20} /></div>
                </div>
                <div className="text-3xl font-black text-indigo-400 tracking-tight">{activeInvestments.length}</div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Active Contracts</div>
              </div>

              <div className="bg-emerald-600 p-6 rounded-3xl relative overflow-hidden cursor-pointer hover:bg-emerald-500 transition-colors" onClick={() => openModal('deposit')}>
                <div className="absolute -right-4 -bottom-4 opacity-20"><ArrowDownLeft size={100} /></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="p-2 bg-white/20 w-fit rounded-lg"><ArrowDownLeft className="text-white" size={20} /></div>
                  <div>
                    <div className="text-2xl font-black text-white">Deposit</div>
                    <div className="text-[10px] uppercase tracking-widest text-emerald-100 font-bold mt-1">Top up balance</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-lg font-bold flex items-center gap-2"><Globe size={18} className="text-slate-400" /> Investment Tiers</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {INVESTMENT_PLANS.slice(0, 4).map((plan) => (
                    <div key={plan.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all group">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-200">{plan.name}</h4>
                        <span className="text-emerald-400 font-bold text-xs">+{plan.dailyReturn}% Daily</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <div className="text-[10px] text-slate-500 font-bold uppercase">Min</div>
                          <div className="text-slate-300 font-mono font-bold">€{plan.minDeposit.toLocaleString()}</div>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <div className="text-[10px] text-slate-500 font-bold uppercase">Duration</div>
                          <div className="text-slate-300 font-mono font-bold">{plan.durationDays} Days</div>
                        </div>
                      </div>
                      <button onClick={() => navigate('/plans')} className="w-full py-3 bg-slate-800 text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest group-hover:bg-emerald-600 group-hover:text-white transition-all">Select Strategy</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-lg font-bold flex items-center gap-2"><History size={18} className="text-slate-400" /> Recent Transactions</h2>
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 min-h-[300px]">
                  {transactions.length > 0 ? (
                    <div className="space-y-3">
                      {transactions.map(tx => (
                        <div key={tx.id} className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                              {tx.type === 'deposit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-slate-300 capitalize">{tx.type}</div>
                              <div className="text-[9px] text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-sm text-white">€{Number(tx.amount).toLocaleString()}</div>
                            <div className={`text-[9px] font-bold uppercase ${tx.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`}>{tx.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
                      <History size={40} />
                      <p className="text-xs font-bold mt-2">No History</p>
                    </div>
                  )}
                </div>

                <button onClick={() => openModal('withdraw')} className="w-full py-4 bg-slate-800 border border-slate-700 rounded-2xl text-slate-400 font-bold hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-2">
                  <ArrowUpRight size={18} /> Request Withdrawal
                </button>
              </div>
            </div>
          </motion.div>
        ) : view === 'bot' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
            <BotTerminal active={botActive} onToggle={() => setBotActive(!botActive)} userId={user?.id} />
          </motion.div>
        ) : view === 'documents' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-slate-800 rounded-xl"><FileText size={24} className="text-slate-400" /></div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Document Vault</h2>
                  <p className="text-slate-400 text-sm">Access your monthly statements, tax forms, and contracts.</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Recent Statements</h3>
                  <div className="space-y-2">
                    {['December 2024 Statement', 'November 2024 Statement', 'October 2024 Statement'].map((doc, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-600 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-slate-900 rounded-lg text-rose-500"><FileText size={18} /></div>
                          <div>
                            <p className="font-bold text-slate-200 group-hover:text-white">{doc}</p>
                            <p className="text-[10px] text-slate-500">PDF • 1.2 MB</p>
                          </div>
                        </div>
                        <button className="text-slate-500 hover:text-emerald-500"><ArrowDownLeft size={20} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Legal & Taxes</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-950 rounded-xl border border-slate-800">
                      <ShieldCheck size={24} className="text-emerald-500 mb-4" />
                      <h4 className="font-bold text-white">Client Agreement</h4>
                      <p className="text-xs text-slate-500 mt-2 mb-4">Signed on {new Date(user?.created_at || Date.now()).toLocaleDateString()}</p>
                      <button className="text-xs font-bold text-emerald-500 hover:text-emerald-400">View Contract</button>
                    </div>
                    <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 opacity-50">
                      <FileText size={24} className="text-slate-500 mb-4" />
                      <h4 className="font-bold text-white">Tax Form 1099-B</h4>
                      <p className="text-xs text-slate-500 mt-2 mb-4">Available from Feb 15, 2025</p>
                      <button className="text-xs font-bold text-slate-500 cursor-not-allowed">Not generated</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-slate-800 rounded-xl"><ShieldCheck size={24} className="text-emerald-500" /></div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Security Center</h2>
                  <p className="text-slate-400 text-sm">Manage your account protection and login methods.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white">Two-Factor Authentication</h4>
                    <p className="text-xs text-slate-500 mt-1">Add an extra layer of security to your account.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-rose-500">Disabled</span>
                    <button className="px-4 py-2 bg-slate-800 rounded-lg text-xs font-bold text-white hover:bg-slate-700">Enable 2FA</button>
                  </div>
                </div>

                <div className="p-6 bg-slate-950 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-white mb-4">Change Password</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input type="password" placeholder="Current Password" className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-sm" />
                    <input type="password" placeholder="New Password" className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-sm" />
                  </div>
                  <div className="mt-4 text-right">
                    <button className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700">Update Password</button>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-4">Recent Login Activity</h4>
                  <div className="space-y-2">
                    {[
                      { ip: '192.168.1.1', loc: 'New York, USA', time: 'Just now', device: 'Chrome / Windows' },
                      { ip: '192.168.1.1', loc: 'New York, USA', time: '2 days ago', device: 'Chrome / Windows' },
                    ].map((login, i) => (
                      <div key={i} className="flex justify-between items-center p-3 border-b border-slate-800 last:border-0">
                        <div>
                          <p className="font-bold text-slate-300 text-sm">{login.device}</p>
                          <p className="text-[10px] text-slate-500">{login.loc} • {login.ip}</p>
                        </div>
                        <span className="text-xs text-slate-400">{login.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modal Layer */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-8 rounded-[32px] relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={24} /></button>

            {activeModal === 'deposit' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Deposit Funds</h2>
                <form onSubmit={handleMainDeposit} className="space-y-4">
                  <select className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none" value={assetType} onChange={e => setAssetType(e.target.value)}>
                    {Object.keys(WALLET_ADDRESSES).map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                  <div className="bg-white p-4 rounded-xl flex justify-center">
                    <img src={getQRCodeUrl(WALLET_ADDRESSES[assetType])} className="w-32 h-32" />
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl text-center">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Wallet Address</div>
                    <div className="text-xs font-mono break-all text-slate-300 mt-1">{WALLET_ADDRESSES[assetType]}</div>
                  </div>
                  <input type="number" placeholder="Amount (€)" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none" value={amountInput} onChange={e => setAmountInput(e.target.value)} />
                  <button disabled={isProcessing} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all">{isProcessing ? 'Processing...' : 'I have sent'}</button>
                </form>
              </div>
            )}

            {activeModal === 'withdraw' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Withdraw Capital</h2>
                {withdrawStep === 'source' ? (
                  <div className="space-y-3">
                    <button onClick={() => { setWithdrawSource('main'); setWithdrawStep('details'); }} className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center hover:border-emerald-500">
                      <span className="font-bold text-slate-300">Main Wallet</span>
                      <span className="text-emerald-400 font-mono">€{mainBalance.toLocaleString()}</span>
                    </button>
                    <button onClick={() => { setWithdrawSource('profit'); setWithdrawStep('details'); }} className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center hover:border-emerald-500">
                      <span className="font-bold text-slate-300">Profit Wallet</span>
                      <span className="text-emerald-400 font-mono">€{profitBalance.toLocaleString()}</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleMainWithdraw} className="space-y-4">
                    <input type="number" placeholder="Amount (€)" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none" value={amountInput} onChange={e => setAmountInput(e.target.value)} />
                    <div>
                      <input
                        type="text"
                        placeholder="Your Wallet Address"
                        className={`w-full bg-slate-950 border p-4 rounded-xl outline-none transition-colors ${addressError ? 'border-rose-500 placeholder:text-rose-500/50' : 'border-slate-800'}`}
                        value={withdrawalAddress}
                        onChange={e => {
                          setWithdrawalAddress(e.target.value);
                          if (e.target.value) setAddressError(false);
                        }}
                      />
                      {addressError && <p className="text-rose-500 text-xs font-bold mt-2 ml-1">Input address</p>}
                    </div>
                    <button disabled={isProcessing} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all">{isProcessing ? 'Checking...' : 'Request Withdrawal'}</button>
                  </form>
                )}
              </div>
            )}

            {activeModal === 'swap' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Swap Profit to Main Capital</h2>
                <p className="text-sm text-slate-500">Add profits to capital for compound interest.</p>
                <input type="number" placeholder="Amount (€)" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl" value={amountInput} onChange={e => setAmountInput(e.target.value)} />
                <button onClick={handleSwap} disabled={isProcessing} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold">{isProcessing ? 'Swapping...' : 'Swap Now'}</button>
              </div>
            )}

            {activeModal === 'bot-fund' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Fund Bot Terminal</h2>
                <input type="number" placeholder="Amount (€)" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl" value={amountInput} onChange={e => setAmountInput(e.target.value)} />
                <button onClick={handleBotFund} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold">Transfer</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;