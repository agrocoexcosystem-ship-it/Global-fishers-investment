import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator as CalcIcon, TrendingUp, Euro, Clock } from 'lucide-react';

const PLANS = [
  { name: 'Starter Tier', daily: 1.5, min: 100, max: 4999, duration: 30 },
  { name: 'Bronze Growth', daily: 2.0, min: 5000, max: 24999, duration: 45 },
  { name: 'Silver Elite', daily: 2.5, min: 25000, max: 1000000, duration: 60 },
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
    <div className="bg-slate-900 text-white min-h-screen">
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-6">
              Yield Estimator
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Investment <span className="italic text-emerald-400">Calculator</span>
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              Estimate your potential returns based on your investment amount and selected tier.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              {/* Input Section */}
              <div className="p-10 rounded-3xl glass-effect-dark border border-slate-700/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
                
                <h2 className="text-2xl font-bold mb-8 font-sans flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <CalcIcon size={24} className="text-emerald-400" />
                  </div>
                  Portfolio Configuration
                </h2>
                
                <div className="space-y-8">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">
                      Capital Commitment (EUR)
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Euro size={20} className="text-emerald-400 group-focus-within:text-emerald-300 transition-colors" />
                      </div>
                      <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        min="100"
                        className="w-full pl-12 pr-6 py-5 bg-slate-900/50 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-2xl font-bold tracking-tight"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">
                      Institutional Tiers
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {PLANS.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedPlan(i)}
                          className={`w-full p-5 rounded-2xl text-left transition-all relative group
                            ${selectedPlan === i
                              ? 'bg-emerald-500/20 border border-emerald-500/40'
                              : 'bg-slate-900/40 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'}`}
                        >
                          {selectedPlan === i && (
                            <motion.div
                              layoutId="activePlan"
                              className="absolute inset-0 border-2 border-emerald-500 rounded-2xl z-10"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          <div className="flex items-center justify-between relative z-20">
                            <div>
                              <div className={`font-bold text-lg font-sans transition-colors ${selectedPlan === i ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                {p.name}
                              </div>
                              <div className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">
                                €{p.min.toLocaleString()} – €{p.max.toLocaleString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-emerald-400 font-black text-2xl tracking-tighter">
                                {p.daily}% <span className="text-[10px] uppercase font-bold text-emerald-500/60 tracking-normal">daily</span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{p.duration} Day Cycle</div>
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
                  className="p-10 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-950 border border-emerald-400/30 shadow-2xl shadow-emerald-950/50 relative overflow-hidden"
                >
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>

                  <h2 className="text-2xl font-bold mb-8 font-sans relative z-10 flex items-center justify-between">
                    Yield Projection
                    <span className="text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/10">Active Strategy</span>
                  </h2>

                  <div className="space-y-4 relative z-10">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-emerald-200/70 mb-2">
                          <TrendingUp size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Daily Return</span>
                        </div>
                        <span className="text-2xl font-bold text-white">€{dailyReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>

                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-emerald-200/70 mb-2">
                          <Clock size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Cycle Duration</span>
                        </div>
                        <span className="text-2xl font-bold text-white">{plan.duration} Days</span>
                      </div>
                    </div>

                    <div className="p-6 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-emerald-100 mb-1">
                          <Euro size={16} />
                          <span className="text-xs font-bold uppercase tracking-widest">Net Profit</span>
                        </div>
                        <span className="text-3xl font-black text-yellow-300 tracking-tight">€{totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest mb-1">Total ROI</div>
                        <div className="text-2xl font-black text-white">{roi}%</div>
                      </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/10">
                      <div className="text-center">
                        <p className="text-xs font-bold text-emerald-100 uppercase tracking-[0.2em] mb-2 opacity-80">Final Portfolio Value</p>
                        <p className="text-6xl font-black text-white tracking-tighter drop-shadow-lg">
                          €{totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <div className="mt-8 p-6 glass-effect-dark rounded-2xl border border-slate-800">
                  <p className="text-[10px] text-slate-500 leading-relaxed text-center uppercase tracking-wider font-medium">
                    * Projections are algorithmic estimates based on current market volatility and liquidity. 
                    Institutional tier yields are subject to platform governance and risk management protocols.
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
