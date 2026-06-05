import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator as CalcIcon, TrendingUp, Euro, Clock } from 'lucide-react';

const PLANS = [
  { name: 'Starter Tier', daily: 1.5, min: 100, max: 4999, duration: 30 },
  { name: 'Bronze Growth', daily: 2.0, min: 5000, max: 24999, duration: 45 },
  { name: 'Silver Elite', daily: 2.5, min: 25000, max: 99999, duration: 60 },
  { name: 'Gold Institutional', daily: 3.2, min: 100000, max: 499999, duration: 90 },
  { name: 'Platinum Sovereign', daily: 4.0, min: 500000, max: 999999, duration: 120 },
  { name: 'Fisher Reserve', daily: 5.5, min: 1000000, max: 1500000, duration: 180 },
];

export default function Calculator() {
  const [amount, setAmount] = useState('1000');
  const [selectedPlan, setSelectedPlan] = useState(0);

  const plan = PLANS[selectedPlan];
  const investment = parseFloat(amount) || 0;
  const dailyReturn = investment * (plan.daily / 100);
  const totalReturn = dailyReturn * plan.duration;
  const totalValue = investment + totalReturn;
  const roi = investment > 0 ? ((totalReturn / investment) * 100).toFixed(1) : '0';

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-6">
              Yield Estimator
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
              Ecosystem <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Calculator</span>
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
              Estimate your potential returns based on your allocation amount and selected membership tier.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              {/* Input Section */}
              <div className="p-10 rounded-[2rem] bg-slate-900/30 border border-slate-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl"></div>
                
                <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/15 border border-amber-500/20 rounded-xl">
                    <CalcIcon size={20} className="text-amber-400" />
                  </div>
                  Portfolio Configuration
                </h2>
                
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">
                      Capital Commitment (EUR)
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Euro size={18} className="text-amber-400 group-focus-within:text-amber-300 transition-colors" />
                      </div>
                      <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        min="100"
                        className="w-full pl-12 pr-6 py-4.5 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all text-xl font-black font-mono tracking-tight"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1">
                      Ecosystem Tiers
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {PLANS.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedPlan(i)}
                          className={`w-full p-4.5 rounded-2xl text-left transition-all relative group
                            ${selectedPlan === i
                              ? 'bg-amber-500/10 border border-amber-500/30'
                              : 'bg-slate-950 border border-slate-900 hover:border-slate-800 hover:bg-slate-900/40'}`}
                        >
                          {selectedPlan === i && (
                            <motion.div
                              layoutId="activePlan"
                              className="absolute inset-0 border-2 border-amber-500 rounded-2xl z-10"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          <div className="flex items-center justify-between relative z-20">
                            <div>
                              <div className={`font-bold text-sm transition-colors ${selectedPlan === i ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                {p.name}
                              </div>
                              <div className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-wider font-mono">
                                €{p.min.toLocaleString()} – {p.max === 10000000 ? 'Unlimited' : `€${p.max.toLocaleString()}`}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-amber-400 font-black text-xl tracking-tighter font-mono">
                                {p.daily}% <span className="text-[9px] uppercase font-bold text-amber-500/60 tracking-normal">daily</span>
                              </div>
                              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{p.duration} Day Cycle</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Section */}
              <div className="lg:sticky lg:top-24">
                <motion.div
                  key={`${amount}-${selectedPlan}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="p-10 rounded-[2rem] bg-gradient-to-br from-amber-700 via-yellow-600 to-amber-900 border border-amber-400/20 shadow-2xl shadow-amber-900/10 relative overflow-hidden"
                >
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>

                  <h2 className="text-xl font-bold mb-8 font-sans relative z-10 flex items-center justify-between">
                    Yield Projection
                    <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/10">Active Strategy</span>
                  </h2>

                  <div className="space-y-4 relative z-10">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-amber-100/70 mb-2">
                          <TrendingUp size={12} />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Daily Return</span>
                        </div>
                        <span className="text-xl font-bold text-white font-mono">€{dailyReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>

                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-amber-100/70 mb-2">
                          <Clock size={12} />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Cycle Duration</span>
                        </div>
                        <span className="text-xl font-bold text-white font-mono">{plan.duration} Days</span>
                      </div>
                    </div>

                    <div className="p-6 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-amber-100 mb-1">
                          <Euro size={14} />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Net Profit</span>
                        </div>
                        <span className="text-2xl font-black text-yellow-300 tracking-tight font-mono">€{totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-bold text-amber-100 uppercase tracking-widest mb-1">Total ROI</div>
                        <div className="text-xl font-black text-white font-mono">{roi}%</div>
                      </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/10">
                      <div className="text-center">
                        <p className="text-[9px] font-bold text-amber-150 uppercase tracking-[0.2em] mb-2 opacity-80">Final Portfolio Value</p>
                        <p className="text-5xl font-black text-white tracking-tighter drop-shadow-lg font-mono">
                          €{totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <div className="mt-8 p-6 bg-slate-900/30 rounded-2xl border border-slate-900">
                  <p className="text-[9px] text-slate-500 leading-relaxed text-center uppercase tracking-wider font-bold">
                    * Projections are algorithmic estimates based on current market volatility and liquidity. 
                    Ecosystem tier yields are subject to platform governance and risk management protocols.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
