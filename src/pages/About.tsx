import { motion } from 'framer-motion';
import { Shield, Users, Globe, Award, Target, TrendingUp } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-6">
              About Us
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Redefining <span className="italic text-emerald-400">Asset Management</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Global Fishers Investment is a premier asset management firm combining cutting-edge technology with decades of financial expertise.
            </p>
          </div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto mb-24 relative"
          >
            <div className="absolute -inset-4 bg-emerald-500/5 rounded-[2.5rem] blur-2xl"></div>
            <div className="relative p-12 rounded-[2rem] glass-effect-dark border border-slate-700/50 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-black mb-6 tracking-tighter">OUR MISSION</h2>
                  <p className="text-slate-400 leading-relaxed text-lg font-medium">
                    At Global Fishers Investment, we believe that institutional-grade investing should be accessible to everyone. 
                    We are committed to democratizing wealth creation through advanced algorithmic strategies and transparent operations.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <div className="text-2xl font-black text-emerald-400 mb-1">100%</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Transparency</div>
                  </div>
                  <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <div className="text-2xl font-black text-emerald-400 mb-1">AI-DRIVEN</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Strategies</div>
                  </div>
                  <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <div className="text-2xl font-black text-emerald-400 mb-1">24/7</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Monitoring</div>
                  </div>
                  <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <div className="text-2xl font-black text-emerald-400 mb-1">GLOBAL</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Exposure</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {[
              { icon: Shield, title: 'Trust & Transparency', desc: 'Complete transparency in operations with real-time reporting and audited performance metrics.' },
              { icon: Target, title: 'Performance Driven', desc: 'Relentless focus on delivering consistent, risk-adjusted returns that outperform benchmarks.' },
              { icon: Users, title: 'Investor First', desc: 'Every decision we make is guided by what\'s best for our investors and their long-term success.' },
              { icon: Globe, title: 'Global Reach', desc: 'Access to diversified markets worldwide, from traditional equities to emerging digital assets.' },
              { icon: TrendingUp, title: 'Innovation', desc: 'Continuous development of proprietary algorithms and trading strategies using cutting-edge AI.' },
              { icon: Award, title: 'Excellence', desc: 'Committed to maintaining the highest standards of professional excellence in everything we do.' },
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[2rem] glass-effect-dark border border-slate-800 hover:border-emerald-500/30 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                  <value.icon size={32} className="text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-tight">{value.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Team Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-12 rounded-[2.5rem] glass-effect-dark border border-slate-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent"></div>
            {[
              { num: '10+', label: 'Years Experience' },
              { num: '50+', label: 'Team Members' },
              { num: '15+', label: 'Countries Served' },
              { num: '€2.4B+', label: 'Assets Under Management' },
            ].map((s, i) => (
              <div key={i} className="text-center relative z-10">
                <div className="text-4xl font-black text-white mb-2 tracking-tighter">{s.num}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
