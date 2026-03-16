import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const PLANS = [
  {
    name: 'Starter Tier',
    daily: '1.5%',
    min: '$100',
    max: '$4,999',
    duration: '30 days',
    features: ['Daily returns', 'Basic analytics', 'Email support', '24/7 monitoring'],
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop',
    popular: false,
  },
  {
    name: 'Bronze Growth',
    daily: '2%',
    min: '$5,000',
    max: '$24,999',
    duration: '45 days',
    features: ['Enhanced daily returns', 'Advanced analytics', 'Priority support', 'Portfolio diversification'],
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
    popular: true,
  },
  {
    name: 'Silver Elite',
    daily: '2.5%',
    min: '$25,000',
    max: 'Unlimited',
    duration: '60 days',
    features: ['Maximum daily returns', 'Institutional analytics', 'Dedicated manager', 'VIP access'],
    image: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&h=300&fit=crop',
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PLANS.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`relative rounded-2xl overflow-hidden bg-slate-800/50 border transition-all hover:scale-[1.02]
                  ${plan.popular ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10' : 'border-slate-700'}`}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img src={plan.image} alt={plan.name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-500 rounded-full text-sm font-bold">
                    +{plan.daily}
                  </div>
                  {plan.popular && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-gold-500 text-slate-900 rounded-full text-xs font-bold uppercase">
                      Most Popular
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 font-sans">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-emerald-400">{plan.daily}</span>
                    <span className="text-slate-400 text-sm">daily return</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">
                    {plan.min} – {plan.max} • {plan.duration}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center text-sm text-slate-300">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/signup"
                    className={`block text-center py-3 rounded-xl font-semibold transition-all
                      ${plan.popular
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                  >
                    Invest Now <ArrowRight size={16} className="inline ml-1" />
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
