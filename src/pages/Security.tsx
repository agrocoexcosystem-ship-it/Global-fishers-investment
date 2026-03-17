import { motion } from 'framer-motion';
import { Shield, Lock, Server, Fingerprint, KeyRound, Eye, AlertTriangle, RefreshCw } from 'lucide-react';

export default function Security() {
  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-6">
              Enterprise Security
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Bank-Grade <span className="italic text-emerald-400">Security</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Your assets are protected by multiple layers of institutional-grade security infrastructure, 
              ensuring complete safety of your investments and personal data.
            </p>
          </div>

          {/* Security Layers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {[
              { icon: Lock, title: 'AES-256 Encryption', desc: 'All data is encrypted using military-grade AES-256 encryption both at rest and in transit, ensuring your information is never exposed.' },
              { icon: Fingerprint, title: 'Biometric Authentication', desc: 'Multi-factor authentication including biometric verification, hardware security keys, and time-based one-time passwords.' },
              { icon: Server, title: 'Cold Storage Vaults', desc: '95% of digital assets are stored in air-gapped cold storage vaults across multiple geographic locations for maximum security.' },
              { icon: Shield, title: 'DDoS Protection', desc: 'Advanced distributed denial-of-service protection with real-time threat detection and automatic mitigation systems.' },
              { icon: KeyRound, title: 'Multi-Sig Wallets', desc: 'All fund transfers require multiple authorization signatures from separate security officers, preventing unauthorized access.' },
              { icon: Eye, title: '24/7 Monitoring', desc: 'Round-the-clock security operations center staffed by expert analysts monitoring all systems for suspicious activity.' },
              { icon: AlertTriangle, title: 'Intrusion Detection', desc: 'AI-powered intrusion detection systems continuously analyze network traffic for anomalies and potential security threats.' },
              { icon: RefreshCw, title: 'Disaster Recovery', desc: 'Comprehensive backup and disaster recovery procedures with data replication across multiple secure data centers.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-8 rounded-2xl bg-slate-800/30 border border-slate-700 hover:border-emerald-500/30 transition group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 transition">
                  <item.icon size={24} className="text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 font-sans">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Security Stats */}
          <div className="p-10 rounded-2xl bg-slate-800/50 border border-slate-700">
            <h2 className="text-2xl font-bold mb-8 font-sans text-center">Security Infrastructure</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: '99.99%', label: 'Uptime SLA' },
                { value: '0', label: 'Security Breaches' },
                { value: '256-bit', label: 'Encryption Standard' },
                { value: '24/7', label: 'SOC Monitoring' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-1">{stat.value}</div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Insurance Notice */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center"
          >
            <Shield size={36} className="text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 font-sans">Insured Assets</h3>
            <p className="text-slate-300 max-w-2xl mx-auto">
              All investor funds are covered by our comprehensive insurance policy, 
              providing an additional layer of protection against unforeseen events.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
