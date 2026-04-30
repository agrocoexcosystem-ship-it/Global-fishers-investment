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
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-20"
          >
            <div className="p-10 rounded-2xl bg-slate-800/50 border border-slate-700">
              <h2 className="text-2xl font-bold mb-4 font-sans">Our Mission</h2>
              <p className="text-slate-300 leading-relaxed text-lg">
                At Global Fishers Investment, we believe that institutional-grade investing should be accessible to everyone. 
                Our mission is to democratize wealth creation through advanced algorithmic trading strategies, 
                transparent operations, and unwavering commitment to our investors' financial success.
              </p>
            </div>
          </motion.div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
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
                className="p-8 rounded-2xl bg-slate-800/30 border border-slate-700 hover:border-emerald-500/30 transition"
              >
                <value.icon size={28} className="text-emerald-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2 font-sans">{value.title}</h3>
                <p className="text-slate-400 text-sm">{value.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Team Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-10 rounded-2xl bg-slate-800/50 border border-slate-700">
            {[
              { num: '10+', label: 'Years Experience' },
              { num: '50+', label: 'Team Members' },
              { num: '15+', label: 'Countries Served' },
              { num: '€2.4B+', label: 'Assets Under Management' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-1">{s.num}</div>
                <div className="text-slate-400 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
