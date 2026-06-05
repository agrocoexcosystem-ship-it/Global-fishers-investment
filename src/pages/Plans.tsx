import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldAlert, Cpu, Network, Zap } from 'lucide-react';

const PLANS = [
  {
    name: 'Starter Plan',
    price: '$250',
    target: 'New Community Members',
    features: [
      'Basic platform access',
      'Access to community dashboard',
      'Entry-level staking simulation tools',
      'Limited reward participation (testnet)',
      'Newsletter & updates'
    ],
    image: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=600&h=400&fit=crop',
    popular: false,
    color: 'from-amber-600 to-amber-900',
    badge: 'Starter',
  },
  {
    name: 'Growth Plan',
    price: '$5,000 - $99,000',
    target: 'Advanced Participants',
    features: [
      'Full platform access',
      'Enhanced staking features (simulated)',
      'Priority ecosystem participation',
      'Access to XChange (DEX demo)',
      'Governance voting rights',
      'Beta testing of new features'
    ],
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=400&fit=crop',
    popular: true,
    color: 'from-amber-200 via-yellow-400 to-amber-600',
    badge: 'Most Popular',
  },
  {
    name: 'Platinum Plan',
    price: '$100,000+',
    target: 'Institutional & Partners',
    features: [
      'VIP platform access',
      'Maximum staking simulation rewards',
      'Early access to all new products',
      'Strategic governance (DAO weight)',
      'Priority support & partnership',
      'White-label integration'
    ],
    image: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?w=600&h=400&fit=crop',
    popular: false,
    color: 'from-yellow-600 to-amber-800',
    badge: 'Premium',
  },
];

export default function Plans() {
  return (
    <div className="bg-slate-950 text-white min-h-screen">
      {/* Disclaimer Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-200/80 text-xs md:text-sm py-3 px-4 flex items-center justify-center gap-2">
        <ShieldAlert size={16} className="text-amber-500 shrink-0" />
        <p className="text-center max-w-4xl">
          <strong>⚠️ Important Notice:</strong> PXX is a conceptual digital ecosystem. Tiers below represent platform access levels and utility benefits, not guaranteed financial returns or investment profits.
        </p>
      </div>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-6">
              Early Access Program
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 italic">
                PXX
              </span> – Platinum Xtreme Xchange
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-8">
              Select your membership tier to gain access to our simulated decentralized exchange, staking tools, and community governance.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {PLANS.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className={`group relative rounded-[2rem] overflow-hidden bg-slate-900 border transition-all duration-500 hover:-translate-y-2
                  ${plan.popular ? 'border-amber-500/50 shadow-2xl shadow-amber-500/10' : 'border-slate-800 hover:border-slate-700'}`}
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-10"></div>
                  <img 
                    src={plan.image} 
                    alt={plan.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 mix-blend-luminosity group-hover:mix-blend-normal" 
                  />
                  <div className="absolute top-6 left-6 z-20">
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-gradient-to-r ${plan.color} text-slate-950`}>
                      {plan.badge}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8 relative z-20 -mt-10">
                  <h3 className="text-3xl font-black text-white tracking-tighter mb-2">{plan.name}</h3>
                  <div className="text-sm font-medium text-amber-450 mb-6">{plan.target}</div>
                  
                  <div className="mb-8">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Access Level</div>
                    <div className="text-4xl font-black text-white tracking-tighter">
                      {plan.price}
                    </div>
                  </div>

                  <div className="space-y-6 mb-10">
                    <ul className="space-y-4">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-start text-sm text-slate-300 group/item">
                          <div className={`mt-1 w-4 h-4 rounded-full flex items-center justify-center mr-3 bg-gradient-to-r ${plan.color} shrink-0`}>
                            <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />
                          </div>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to="/signup"
                    className={`relative w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 overflow-hidden text-xs uppercase tracking-widest
                      ${plan.popular
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-[1.02] font-black'
                        : 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700'}`}
                  >
                    Join Program <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Utility Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-24 p-8 md:p-12 rounded-[2rem] bg-slate-900/30 border border-slate-900"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-black tracking-tighter mb-6">PXX Token Utility & Ecosystem</h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  Our architecture is designed for active participation. Members utilize their access to test ecosystem mechanics, explore decentralized concepts, and engage in governance models.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-slate-300">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Network size={18} className="text-amber-400" />
                    </div>
                    <span>Transaction fees & utility within the ecosystem</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-300">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Cpu size={18} className="text-amber-400" />
                    </div>
                    <span>Staking for network participation</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-300">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Zap size={18} className="text-amber-400" />
                    </div>
                    <span>Governance voting & premium feature access</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-full bg-gradient-to-tr from-amber-500/10 to-transparent animate-pulse absolute -inset-10 blur-3xl z-0"></div>
                <img 
                  src="https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&q=80" 
                  alt="Ecosystem" 
                  className="rounded-2xl relative z-10 border border-slate-900 shadow-2xl shadow-amber-500/5"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
