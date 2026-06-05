import { motion } from 'framer-motion';
import { Shield, Users, Globe, Award, Target, Landmark, Briefcase, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-slate-950 text-white min-h-screen">
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-6">
              Protocol Overview
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">
              PXX – Platinum <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Xtreme Xchange</span>
            </h1>
            <p className="text-slate-400 max-w-3xl mx-auto text-base leading-relaxed font-medium">
              PXX is a next-generation decentralized digital asset and utility ecosystem. Operating as a decentralized autonomous organization (DAO), PXX leverages audited smart contracts and quantitative algorithmic terminals to provide institutional-grade infrastructure for modern participants.
            </p>
          </div>

          {/* Key Facts Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 p-12 rounded-[2.5rem] bg-slate-900/30 border border-slate-900 relative overflow-hidden mb-20">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent"></div>
            {[
              { num: '2026', label: 'Ecosystem Launched' },
              { num: '1.2B PXX', label: 'Total Token Supply' },
              { num: '45,000+', label: 'Consensus Members' },
              { num: 'Multi-Chain', label: 'Bridge Infrastructure' },
            ].map((s, i) => (
              <div key={i} className="text-center relative z-10">
                <div className="text-4xl font-black text-white mb-2 tracking-tighter font-mono">{s.num}</div>
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
            <div className="absolute -inset-4 bg-amber-500/5 rounded-[2.5rem] blur-2xl"></div>
            <div className="relative p-12 rounded-[2rem] bg-slate-900/30 border border-slate-800/80 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Landmark className="text-amber-400" size={24} />
                    <h2 className="text-2xl font-black tracking-tighter uppercase">Code-as-Law Fiduciary</h2>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-sm font-medium">
                    Our architecture utilizes automated blockchain logic, eliminating middleman bias and commissions. By deploying assets directly into audited smart contracts, participants gain complete transparency and certainty over staking APYs and consensus mechanics.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-950 border border-slate-900">
                    <CheckCircle2 className="text-amber-400 mt-1 shrink-0" size={18} />
                    <div>
                      <h4 className="font-bold text-sm text-white font-sans">Transparent Smart Contracts</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Yield programs are secured natively on the Ethereum blockchain.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-950 border border-slate-900">
                    <CheckCircle2 className="text-amber-400 mt-1 shrink-0" size={18} />
                    <div>
                      <h4 className="font-bold text-sm text-white font-sans">Fiduciary Decentralization</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Ecosystem treasury and voting rules are fully managed by the DAO.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* What We Offer Section */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Ecosystem Utility</h2>
              <p className="text-slate-400 max-w-xl mx-auto text-sm">
                Decentralized portfolio utilities tailored to long-term wealth appreciation and active token participation.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Briefcase,
                  title: 'Decentralized Swap',
                  desc: 'Direct smart contract-based token acquisition from ETH to PXX on our audited token exchange portal.'
                },
                {
                  icon: Users,
                  title: 'High-Yield Staking',
                  desc: 'Lock tokens directly in contract vaults with yield incentives reaching up to 25.0% APY.'
                },
                {
                  icon: Landmark,
                  title: 'Quant Bots Simulator',
                  desc: 'Test neural network HFT strategies that trade micro-movements on major currency index pairs.'
                },
                {
                  icon: Target,
                  title: 'DAO Voting Power',
                  desc: 'Direct participation in network upgrades. Your vote weight scales with your PXX wallet balance.'
                },
                {
                  icon: Shield,
                  title: 'Audited Smart Code',
                  desc: 'Immutable contract systems with built-in security handshakes to avoid third-party risk.'
                },
                {
                  icon: Globe,
                  title: 'Cross-Chain Bridging',
                  desc: 'Secure cross-chain token movement, maintaining low latency and efficient gas consumption.'
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="p-8 rounded-[2rem] bg-slate-900/30 border border-slate-900 hover:border-amber-500/20 transition-all duration-350 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
                    <item.icon size={22} className="text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-medium">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Reputation and Legitimacy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
            {/* Auditing Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-10 rounded-[2.5rem] bg-slate-900/30 border border-slate-900 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Award className="text-amber-400" size={24} />
                  <h3 className="text-xl font-bold uppercase tracking-tight font-sans">Open Source Code</h3>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed mb-6 font-medium">
                  The PXX smart contract is public and open-source. Anyone can review the token logic, check mint/burn privileges, and inspect the buyTokens execution code on block explorers. We believe in total visibility as the foundation of modern Web3 trust.
                </p>
                <p className="text-slate-500 text-[10px] leading-relaxed italic">
                  *Ecosystem participants are encouraged to perform contract dry-runs and verify block explorer addresses before executing live swaps.
                </p>
              </div>
            </motion.div>

            {/* Legitimacy Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-10 rounded-[2.5rem] bg-slate-900/30 border border-slate-900 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="text-amber-400" size={24} />
                  <h3 className="text-xl font-bold uppercase tracking-tight font-sans">Verified Web Access</h3>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed mb-6 font-medium">
                  The PXX ecosystem token interactions and staking vaults are hosted strictly on our verified decentralized frontend application. Connect with standard wallet providers like MetaMask or Trust Wallet.
                </p>
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <p className="text-[10.5px] text-slate-300 font-medium leading-relaxed">
                    Verify you are interacting with the correct network contract address (<span className="text-amber-400 font-bold font-mono">0x5FbDB2315678afecb367f032d93F642f64180aa3</span>) before performing transactions.
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
