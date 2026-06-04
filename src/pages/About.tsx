import { motion } from 'framer-motion';
import { Shield, Users, Globe, Award, Target, Landmark, Briefcase, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-6">
              Corporate Overview
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Global Fisher <span className="italic text-emerald-400">Investments</span>
            </h1>
            <p className="text-slate-400 max-w-3xl mx-auto text-lg leading-relaxed">
              Global Fisher Investments (often referred to as "Global Fisher's Investment") is a well-established, legitimate independent investment management firm dedicated to helping clients reach their long-term financial goals.
            </p>
          </div>

          {/* Key Facts Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 p-12 rounded-[2.5rem] glass-effect-dark border border-slate-800 relative overflow-hidden mb-20">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent"></div>
            {[
              { num: '1979', label: 'Founded by Ken Fisher' },
              { num: '$387B+', label: 'Assets Under Management' },
              { num: '200K+', label: 'Clients Globally' },
              { num: 'Plano, TX', label: 'Global Headquarters' },
            ].map((s, i) => (
              <div key={i} className="text-center relative z-10">
                <div className="text-4xl font-black text-white mb-2 tracking-tighter">{s.num}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Core Business Model & Mission */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto mb-20 relative"
          >
            <div className="absolute -inset-4 bg-emerald-500/5 rounded-[2.5rem] blur-2xl"></div>
            <div className="relative p-12 rounded-[2rem] glass-effect-dark border border-slate-800/80 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Landmark className="text-emerald-400" size={24} />
                    <h2 className="text-2xl font-black tracking-tighter uppercase">Fiduciary Model</h2>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-base font-medium">
                    We operate as a fee-only Registered Investment Adviser (RIA), meaning we earn money primarily through transparent advisory fees rather than product commissions. This structure guarantees a fiduciary duty to act strictly in our clients' best interests.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                    <CheckCircle2 className="text-emerald-400 mt-1 shrink-0" size={18} />
                    <div>
                      <h4 className="font-bold text-sm text-white">Fee-Only Registered Advisor</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Aligned incentive models based solely on portfolio growth.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                    <CheckCircle2 className="text-emerald-400 mt-1 shrink-0" size={18} />
                    <div>
                      <h4 className="font-bold text-sm text-white">Fiduciary Standards</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Legally bound to prioritize client interest and portfolio stability.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* What We Offer Section */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">What We Offer</h2>
              <p className="text-slate-400 max-w-xl mx-auto text-sm">
                Discretionary portfolio management tailored to long-term wealth appreciation and tactical preservation.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Briefcase,
                  title: 'Personalized Strategies',
                  desc: 'Custom-tailored asset allocation models focusing on global equities, macro trends, and targeted growth parameters.'
                },
                {
                  icon: Users,
                  title: 'High-Net-Worth Solutions',
                  desc: 'Comprehensive wealth management for private clients, typically beginning at a $1 million entry point.'
                },
                {
                  icon: Landmark,
                  title: 'Institutional Services',
                  desc: 'Sophisticated capital strategies and consulting for global pension funds, sovereign entities, and endowments.'
                },
                {
                  icon: Target,
                  title: 'Retirement & Reviews',
                  desc: 'In-depth retirement planning, structured financial support, and objective historical portfolio reviews.'
                },
                {
                  icon: Shield,
                  title: 'Active Risk Mitigation',
                  desc: 'Disciplined active management designed to bypass emotional decision-making during periods of market volatility.'
                },
                {
                  icon: Globe,
                  title: 'Objective Decision Making',
                  desc: 'Business structures designed specifically to separate day-to-day client services from portfolio research.'
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="p-8 rounded-[2rem] glass-effect-dark border border-slate-800 hover:border-emerald-500/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                    <item.icon size={24} className="text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Reputation, Reviews, and Legitimacy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
            {/* Reputation Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-10 rounded-[2.5rem] glass-effect-dark border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Award className="text-emerald-400" size={24} />
                  <h3 className="text-xl font-bold uppercase tracking-tight">Reputation & Reviews</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  The firm has received various industry recognitions for growth, assets managed, and advisory services. Client feedback is mixed: many appreciate the personalized service, communication, and downside protection during market downturns, while others focus on the fee structures or relative benchmark performance.
                </p>
                <p className="text-slate-500 text-xs leading-relaxed italic">
                  *As with any advisor, results depend on individual circumstances, market conditions, and risk tolerance. It's always wise to review Form ADV and conduct due diligence.
                </p>
              </div>
            </motion.div>

            {/* Legitimacy Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-10 rounded-[2.5rem] glass-effect-dark border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="text-emerald-400" size={24} />
                  <h3 className="text-xl font-bold uppercase tracking-tight">Verified Legitimacy</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Global Fisher Investments is a fully regulated firm in the United States (SEC-registered) and complies with regulatory standards across other international jurisdictions where operations exist. 
                </p>
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-xs text-slate-300 font-medium">
                    All official operations, onboarding pathways, and secure dashboard interactions are conducted exclusively through our verified web interface (<span className="text-emerald-400 font-bold">fisherspay.de</span>) and authorized representatives.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>
    </div>
  );
}
