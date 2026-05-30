import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const PLANS = [
  {
    name: 'Starter Tier',
    daily: '1.5%',
    min: '€100',
    max: '€4,999',
    duration: '30 days',
    features: ['Daily returns', 'Basic analytics', 'Email support', '24/7 monitoring'],
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=400&fit=crop',
    popular: false,
  },
  {
    name: 'Bronze Growth',
    daily: '2%',
    min: '€5,000',
    max: '€24,999',
    duration: '45 days',
    features: ['Enhanced daily returns', 'Advanced analytics', 'Priority support', 'Portfolio diversification'],
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop',
    popular: false,
  },
  {
    name: 'Silver Elite',
    daily: '2.5%',
    min: '€25,000',
    max: '€99,999',
    duration: '60 days',
    features: ['Maximum daily returns', 'Institutional analytics', 'Dedicated manager', 'VIP access'],
    image: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=600&h=400&fit=crop',
    popular: true,
  },
  {
    name: 'Gold Institutional',
    daily: '3.2%',
    min: '€100,000',
    max: '€499,999',
    duration: '90 days',
    features: ['Custom risk management', 'Real-time audit access', 'Direct trader liaison', 'Tax optimization'],
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop',
    popular: false,
  },
  {
    name: 'Platinum Sovereign',
    daily: '4%',
    min: '€500,000',
    max: '€999,999',
    duration: '120 days',
    features: ['Sovereign wealth strategy', 'On-shore escrow options', 'Estate planning integration', 'Private equity access'],
    image: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=600&h=400&fit=crop',
    popular: false,
  },
  {
    name: 'Fisher Reserve',
    daily: '5.5%',
    min: '€1,000,000',
    max: '€1,500,000',
    duration: '180 days',
    features: ['Board of Directors access', 'Bespoke asset allocation', 'Institutional underwriting', 'Dedicated advisory team'],
    image: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=600&h=400&fit=crop',
    popular: false,
  },
];

export default function Plans() {
  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-6">
              Institutional Portfolios
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Select Your <span className="italic text-emerald-400">Tier</span>
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              Deploy capital into our high-performance quantitative tiers designed for consistent growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {PLANS.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className={`group relative rounded-[2rem] overflow-hidden glass-effect-dark border transition-all duration-500 hover:-translate-y-2
                  ${plan.popular ? 'border-emerald-500/40 shadow-2xl shadow-emerald-500/10' : 'border-slate-800 hover:border-slate-700'}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-10 z-20">
                    <div className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-b-xl shadow-lg">
                      Recommended
                    </div>
                  </div>
                )}

                {/* Image Section */}
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 opacity-60"></div>
                  <img 
                    src={plan.image} 
                    alt={plan.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute bottom-6 left-6 z-20">
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Strategy Tier</div>
                    <h3 className="text-3xl font-black text-white tracking-tighter">{plan.name}</h3>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8 relative">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Target Yield</div>
                      <div className="text-4xl font-black text-white tracking-tighter">
                        {plan.daily} <span className="text-sm font-bold text-emerald-500 tracking-normal uppercase">/ Day</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Cycle</div>
                      <div className="text-lg font-bold text-slate-300">{plan.duration}</div>
                    </div>
                  </div>

                  <div className="space-y-6 mb-10">
                    <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Entry Limit</span>
                        <span className="text-sm font-bold text-white">{plan.min}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Cap</span>
                        <span className="text-sm font-bold text-white">{plan.max}</span>
                      </div>
                    </div>

                    <ul className="space-y-3">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-center text-sm text-slate-400 group/item">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center mr-3 group-hover/item:bg-emerald-500/20 transition-colors">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          </div>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to="/signup"
                    className={`relative w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 overflow-hidden
                      ${plan.popular
                        ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 hover:scale-[1.02]'
                        : 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700'}`}
                  >
                    {plan.popular && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    )}
                    Deploy Capital <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
