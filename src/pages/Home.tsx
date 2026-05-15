import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, TrendingUp, BarChart3, Lock, Globe, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-slate-900 text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Advanced Background */}
        <div className="absolute inset-0 bg-slate-950">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/20 rounded-full blur-[120px]"></div>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-10 shadow-2xl shadow-emerald-500/10">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3 animate-ping" />
              Institutional Asset Management
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] mb-8 tracking-tighter"
          >
            THE FUTURE OF <br />
            <span className="text-emerald-400 italic font-serif">WEALTH</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto mb-14 leading-relaxed font-medium"
          >
            Global Fishers Investment leverages proprietary algorithmic strategies and deep market liquidity 
            to generate consistent institutional-grade yields for the modern investor.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link
              to="/signup"
              className="group relative px-10 py-5 bg-emerald-500 text-white rounded-2xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-emerald-500/25 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              Establish Portfolio <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/plans"
              className="px-10 py-5 border border-slate-700 text-white rounded-2xl font-bold text-xl hover:bg-slate-800 transition-all hover:border-slate-500"
            >
              Institutional Plans
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
              { value: '€2.4B+', label: 'Assets Managed' },
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
