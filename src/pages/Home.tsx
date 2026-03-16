import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, TrendingUp, BarChart3, Lock, Globe, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-slate-900 text-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_70%)]" />
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-8">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2" />
              Institutional Grade Assets
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6"
          >
            Wealth Beyond{' '}
            <span className="italic text-emerald-400">Boundaries</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Global Fishers Investment combines algorithmic precision with human expertise 
            to deliver consistent, superior returns in a volatile global market.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/signup"
              className="px-8 py-4 bg-emerald-500 text-white rounded-xl font-semibold text-lg hover:bg-emerald-600 transition-all hover:shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2"
            >
              Start Investing <ArrowRight size={20} />
            </Link>
            <Link
              to="/plans"
              className="px-8 py-4 border border-slate-600 text-white rounded-xl font-semibold text-lg hover:bg-slate-800 transition-all"
            >
              Explore Portfolios
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-slate-500 text-xs uppercase tracking-[0.3em]"
          >
            SCROLL
          </motion.p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Why <span className="text-emerald-400">Global Fishers</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Institutional-grade infrastructure designed for consistent, sustainable growth across all market conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: TrendingUp, title: 'Algorithmic Trading', desc: 'Advanced quantitative strategies powered by machine learning for optimal returns.' },
              { icon: Shield, title: 'Institutional Security', desc: 'Bank-grade encryption and multi-layer authentication to protect your assets.' },
              { icon: BarChart3, title: 'Real-time Analytics', desc: 'Comprehensive dashboards with live portfolio tracking and performance metrics.' },
              { icon: Lock, title: 'Regulated Platform', desc: 'Fully compliant with international financial regulations and standards.' },
              { icon: Globe, title: 'Global Markets', desc: 'Diversified exposure across equities, forex, commodities, and digital assets.' },
              { icon: Zap, title: 'Instant Execution', desc: 'Sub-millisecond trade execution with direct market access infrastructure.' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 transition">
                  <feature.icon size={24} className="text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 font-sans">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-900 border-t border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '$2.4B+', label: 'Assets Managed' },
              { value: '45,000+', label: 'Active Investors' },
              { value: '99.9%', label: 'Platform Uptime' },
              { value: '15+', label: 'Global Markets' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-gradient-gold mb-2">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Grow Your <span className="text-emerald-400">Wealth</span>?
          </h2>
          <p className="text-slate-400 mb-10 text-lg">
            Join thousands of investors who trust Global Fishers to manage and grow their portfolios with institutional-grade strategies.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-10 py-4 bg-emerald-500 text-white rounded-xl font-semibold text-lg hover:bg-emerald-600 transition-all hover:shadow-lg hover:shadow-emerald-500/25"
          >
            Open Your Portfolio <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
