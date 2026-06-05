import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, TrendingUp, Flame, Users, Code2, Coins } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Advanced Background */}
        <div className="absolute inset-0 bg-slate-950">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.08),transparent_50%)]"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-10 shadow-2xl shadow-amber-500/10">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-3 animate-ping" />
              Platinum Xtreme Xchange Ecosystem
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] mb-8 tracking-tighter"
          >
            THE DECADE OF <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 italic font-serif">WEALTH</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto mb-14 leading-relaxed font-medium"
          >
            PXX represents the pinnacle of digital finance, uniting liquidity pools, smart contract staking yielding 18.5% APY, and quantitative bot scalpers under a single Web3 governance framework.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link
              to="/signup"
              className="group relative px-10 py-5 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-amber-500/25 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              Access Platform <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-slate-950" />
            </Link>
            <Link
              to="/plans"
              className="px-10 py-5 border border-slate-800 text-slate-300 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all hover:border-slate-700 hover:text-white"
            >
              Ecosystem Plans
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-slate-600 text-[9px] font-bold uppercase tracking-[0.3em]"
          >
            SCROLL DOWN TO EXPLORE
          </motion.p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">PXX Ecosystem</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              A high-end cryptocurrency system designed for sustainable long-term yield generation and community voting weight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Coins, title: 'Utility Token XChange', desc: 'Direct swap from Ethereum into PXX at a rate of 1 PXX = 0.001 ETH, running on Solidity contracts.' },
              { icon: Flame, title: 'Smart Staking Pools', desc: 'Lock PXX tokens for 30, 90, or 180 days to earn compounding APY up to 25.0%.' },
              { icon: TrendingUp, title: 'Neural Quant Terminals', desc: 'Quantitative algorithmic scalping bots targeting major FX and indices to sustain platform value.' },
              { icon: Shield, title: 'Audited Smart Contracts', desc: 'Immutable code structures protecting investor assets through decentralized wallet handshakes.' },
              { icon: Users, title: 'DAO Governance Consensus', desc: 'Submit and vote on ecosystem changes. Your voting power is weighted directly by your PXX balance.' },
              { icon: Code2, title: 'Developer Console Sandbox', desc: 'View raw contract sources, audit files, and call functions directly through our Web3 compiler.' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-8 rounded-3xl bg-slate-900/30 border border-slate-900 hover:border-amber-500/25 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition duration-300">
                  <feature.icon size={22} className="text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3 font-sans">{feature.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-950 border-t border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '1,000,000,000', label: 'Max Token Supply' },
              { value: '18.5% APY', label: 'Staking Base Yield' },
              { value: '45,000+', label: 'Consensus Members' },
              { value: '0.8ms Latency', label: 'Quant Execution' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 font-mono mb-2">{stat.value}</div>
                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-5xl font-black mb-6">
            Ready to Integrate the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">PXX Exchange</span>?
          </h2>
          <p className="text-slate-400 mb-10 text-base leading-relaxed">
            Connect your Web3 browser wallet, swap ETH directly for PXX tokens, and start staking to secure your share of DAO governance power.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-[1.02] transition shadow-lg shadow-amber-500/15"
          >
            Launch Web3 Portal <ArrowRight size={16} className="text-slate-950" />
          </Link>
        </div>
      </section>
    </div>
  );
}
