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

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700">
                <h2 className="text-xl font-bold mb-6 font-sans flex items-center gap-2">
                  <CalcIcon size={22} className="text-emerald-400" /> Configure Investment
                </h2>

                <div className="mb-6">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Investment Amount (EUR)
                  </label>
                  <div className="relative">
                    <Euro size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      min="100"
                      className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition text-lg font-semibold"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Select Tier
                  </label>
                  <div className="space-y-2">
                    {PLANS.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedPlan(i)}
                        className={`w-full p-4 rounded-xl text-left transition-all flex items-center justify-between
                          ${selectedPlan === i
                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-white'
                            : 'bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700'}`}
                      >
                        <div>
                          <div className="font-semibold font-sans">{p.name}</div>
                          <div className="text-xs text-slate-400 mt-1">
                            €{p.min.toLocaleString()} – €{p.max.toLocaleString()} • {p.duration} days
                          </div>
                        </div>
                        <span className="text-emerald-400 font-bold text-lg">{p.daily}%</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Results Section */}
              <div>
                <motion.div
                  key={`${amount}-${selectedPlan}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="p-8 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-900 border border-emerald-500/30"
                >
                  <h2 className="text-xl font-bold mb-6 font-sans">Projected Returns</h2>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={18} />
                        <span className="text-sm">Daily Return</span>
                      </div>
                      <span className="text-2xl font-bold">€{dailyReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Clock size={18} />
                        <span className="text-sm">Duration</span>
                      </div>
                      <span className="text-2xl font-bold">{plan.duration} Days</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Euro size={18} />
                        <span className="text-sm">Total Profit</span>
                      </div>
                      <span className="text-2xl font-bold text-yellow-300">€{totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className="border-t border-white/20 pt-6">
                      <div className="text-center">
                        <p className="text-sm text-emerald-200 mb-1">Total Value After {plan.duration} Days</p>
                        <p className="text-4xl font-bold">€{totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p className="text-sm text-emerald-200 mt-2">ROI: {roi}%</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <p className="text-xs text-slate-500 mt-4 text-center">
                  * Projections are estimates and past performance does not guarantee future results.
                  Actual returns may vary based on market conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
