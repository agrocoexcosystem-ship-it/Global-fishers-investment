
import React, { useState, useMemo } from 'react';
import { INVESTMENT_PLANS } from '../constants';
import { useNavigate } from 'react-router-dom';

const Calculator: React.FC = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number>(10000);
  const [isCompounding, setIsCompounding] = useState(true);

  // Find the current plan based on the slider amount
  const activePlan = useMemo(() => {
    return INVESTMENT_PLANS.find(p => amount >= p.minDeposit && amount <= p.maxDeposit) 
           || (amount > 600000 ? INVESTMENT_PLANS[INVESTMENT_PLANS.length - 1] : INVESTMENT_PLANS[0]);
  }, [amount]);

  const results = useMemo(() => {
    const dailyRate = activePlan.dailyReturn / 100;
    const days = activePlan.durationDays;
    
    let total;
    if (isCompounding) {
      // Compounding: P * (1 + r)^t
      total = amount * Math.pow(1 + dailyRate, days);
    } else {
      // Standard: P + (P * r * t)
      total = amount + (amount * dailyRate * days);
    }
    
    const profit = total - amount;
    const dailyProfit = amount * dailyRate;
    const date = new Date();
    date.setDate(date.getDate() + days);

    return {
      profit,
      dailyProfit,
      total,
      roi: (profit / amount) * 100,
      returnDate: date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    };
  }, [amount, activePlan, isCompounding]);

  return (
    <div className="pt-32 pb-24 bg-[#020617] min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-500/20">
            Yield Forecasting
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
            Investment <span className="text-emerald-500">Calculator</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
            Analyze your potential returns across our institutional tiers with real-time ROI modeling.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Left Column: Input Panel */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-[#0f172a] p-8 md:p-12 rounded-[48px] border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Investment Principal</label>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black text-slate-600">$</span>
                      <input 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="bg-transparent text-5xl md:text-6xl font-black text-white tracking-tighter outline-none border-none w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-300">{activePlan.name} Active</span>
                  </div>
                </div>

                {/* Slider */}
                <div className="relative py-10">
                  <div className="absolute inset-x-0 h-2 bg-slate-900 rounded-full top-1/2 -translate-y-1/2"></div>
                  <div 
                    className="absolute left-0 h-2 bg-emerald-500 rounded-full top-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
                    style={{ width: `${Math.min(((amount - 250) / 600000) * 100, 100)}%` }}
                  ></div>
                  <input 
                    type="range" 
                    min="250" 
                    max="600000" 
                    step="250"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 w-full opacity-0 cursor-pointer z-10"
                  />
                  <div 
                    className="absolute w-8 h-8 bg-white border-4 border-emerald-500 rounded-full top-1/2 -translate-y-1/2 -ml-4 shadow-2xl z-20 pointer-events-none transition-all"
                    style={{ left: `${Math.min(((amount - 250) / 600000) * 100, 100)}%` }}
                  ></div>
                </div>

                {/* Strategy Selector */}
                <div className="mt-10 space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block">Profit Strategy</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={() => setIsCompounding(true)}
                      className={`p-6 rounded-3xl border text-left transition-all ${isCompounding ? 'bg-emerald-600 border-emerald-500 shadow-xl shadow-emerald-900/20' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}
                    >
                      <div className="font-black text-sm mb-1">Compound Growth</div>
                      <div className={`text-[10px] font-bold uppercase ${isCompounding ? 'text-emerald-100' : 'text-slate-500'}`}>Reinvest Daily Profits</div>
                    </button>
                    <button 
                      onClick={() => setIsCompounding(false)}
                      className={`p-6 rounded-3xl border text-left transition-all ${!isCompounding ? 'bg-emerald-600 border-emerald-500 shadow-xl shadow-emerald-900/20' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}
                    >
                      <div className="font-black text-sm mb-1">Standard Payout</div>
                      <div className={`text-[10px] font-bold uppercase ${!isCompounding ? 'text-emerald-100' : 'text-slate-500'}`}>Fixed Daily Yield</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="bg-slate-900/30 rounded-[40px] border border-slate-800 overflow-hidden">
               <div className="p-8 border-b border-slate-800 bg-slate-950/50">
                 <h3 className="font-black text-lg">Maturity Breakdown</h3>
               </div>
               <div className="p-8 grid md:grid-cols-3 gap-8">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Est. Daily Profit</div>
                    <div className="text-2xl font-black text-emerald-400">${results.dailyProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Trading Duration</div>
                    <div className="text-2xl font-black text-white">{activePlan.durationDays} Days</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Yield Multiplier</div>
                    <div className="text-2xl font-black text-indigo-400">{activePlan.dailyReturn}% Per Day</div>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column: Result Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[48px] p-10 h-full flex flex-col justify-between shadow-2xl relative overflow-hidden text-slate-900">
               <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
               
               <div>
                  <div className="mb-12">
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Net Profit Projection</div>
                    <div className="text-7xl font-black tracking-tighter text-slate-900">
                      ${results.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase">
                      <span>ROI: +{results.roi.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center py-4 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Payout</span>
                      <span className="text-xl font-black">${results.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Capital Unlock Date</span>
                      <span className="text-sm font-black text-emerald-600 uppercase tracking-widest">{results.returnDate}</span>
                    </div>
                  </div>
               </div>

               <div className="mt-16 space-y-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider">
                      This projection assumes {isCompounding ? 'all daily profits are reinvested back into the trading pool' : 'profits are held in your wallet and not reinvested'}. All yields are secured by 1:1 capital insurance.
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate('/signup')}
                    className="w-full py-6 bg-slate-900 text-white rounded-[28px] font-black text-xl hover:bg-emerald-600 transition-all shadow-xl active:scale-95"
                  >
                    Activate {activePlan.name}
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* Informational Footer */}
        <div className="mt-24 text-center">
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] leading-relaxed max-w-3xl mx-auto">
            Algorithmic projections are based on historical performance and quantitative modeling. While our tiers are designed for stability, market conditions can influence real-time execution. Your principal capital is secured by Global Fishers institutional treasury.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
