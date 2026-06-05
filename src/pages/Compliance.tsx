import { motion } from 'framer-motion';
import { Shield, FileCheck, Scale, Globe, Lock, Eye } from 'lucide-react';

export default function Compliance() {
  return (
    <div className="bg-slate-950 text-white min-h-screen">
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-6">
              Regulatory Framework
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
              Compliance & <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Regulations</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              PXX - Platinum Xtreme Xchange is committed to maintaining the highest standards of regulatory compliance across all jurisdictions we operate in.
            </p>
          </div>

          {/* Compliance Overview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-16"
          >
            <div className="p-10 rounded-2xl bg-slate-900/30 border border-slate-900">
              <h2 className="text-2xl font-bold mb-4 font-sans">Our Commitment</h2>
              <p className="text-slate-300 leading-relaxed text-lg mb-4">
                PXX operates under a comprehensive regulatory framework designed to protect 
                our ecosystem participants and ensure the integrity of all digital asset operations. We adhere to international 
                anti-money laundering (AML) standards, Know Your Customer (KYC) requirements, and data protection regulations.
              </p>
              <p className="text-slate-300 leading-relaxed">
                Our compliance team continuously monitors regulatory developments across all markets we operate in, 
                ensuring our practices remain current and exceed minimum regulatory requirements.
              </p>
            </div>
          </motion.div>

          {/* Compliance Areas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: Shield, title: 'Anti-Money Laundering', desc: 'Robust AML policies and procedures including transaction monitoring, suspicious activity reporting, and regular compliance audits.' },
              { icon: FileCheck, title: 'KYC Verification', desc: 'Comprehensive customer identity verification processes to ensure the legitimacy of all account holders and transactions.' },
              { icon: Scale, title: 'Legal Framework', desc: 'Full compliance with international financial regulations including MiFID II, GDPR, and relevant securities laws.' },
              { icon: Globe, title: 'Cross-Border Compliance', desc: 'Adherence to multi-jurisdictional regulatory requirements across all markets and regions we serve.' },
              { icon: Lock, title: 'Data Protection', desc: 'GDPR-compliant data handling with encryption at rest and in transit, strict access controls, and regular security audits.' },
              { icon: Eye, title: 'Transparent Reporting', desc: 'Regular audited financial reports, transparent fee disclosures, and open communication about our compliance status.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-slate-900/30 border border-slate-900 hover:border-amber-500/30 transition"
              >
                <item.icon size={28} className="text-amber-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2 font-sans">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Certifications */}
          <div className="p-10 rounded-2xl bg-slate-900/30 border border-slate-900">
            <h2 className="text-2xl font-bold mb-6 font-sans text-center">Certifications & Standards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'ISO 27001', desc: 'Information Security Management System certified' },
                { title: 'SOC 2 Type II', desc: 'Service Organization Control audit completed' },
                { title: 'PCI DSS', desc: 'Payment Card Industry Data Security Standard compliant' },
              ].map((cert, i) => (
                <div key={i} className="text-center p-6 rounded-xl bg-slate-800/30">
                  <div className="text-2xl font-bold text-amber-400 mb-2">{cert.title}</div>
                  <p className="text-slate-400 text-sm">{cert.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
