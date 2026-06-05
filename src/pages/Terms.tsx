import { FileText } from 'lucide-react';

const SECTIONS = [
  { title: '1. Acceptance of Terms', content: 'By accessing or using the PXX - Platinum Xtreme Xchange platform, you agree to be bound by these Terms of Service. If you do not agree, you may not use our services.' },
  { title: '2. Eligibility', content: 'You must be at least 18 years of age and legally eligible to enter into contracts in your jurisdiction. You must complete our KYC verification process before accessing investment features.' },
  { title: '3. Account Responsibilities', content: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during registration.' },
  { title: '4. Ecosystem Services', content: 'PXX provides digital utility and asset swap capabilities. Past performance does not guarantee future results. Smart contracts carry inherent transaction risks.' },
  { title: '5. Deposits & Withdrawals', content: 'Deposits are processed upon blockchain confirmation. Withdrawals are processed within 24 business hours. We may request additional verification for large transactions.' },
  { title: '6. Fees & Charges', content: 'Exchange rates are determined by smart contracts. Network transaction fees are borne by the user. Fee schedules may be updated with 30 days advance notice.' },
  { title: '7. Prohibited Activities', content: 'Users shall not engage in money laundering, use fraudulent documents, manipulate platform systems, access other accounts, or use unauthorized automated systems.' },
  { title: '8. Limitation of Liability', content: 'PXX shall not be liable for losses from blockchain volatility, smart contract vulnerabilities, force majeure, third-party disruptions, or user negligence.' },
  { title: '9. Termination', content: 'We may suspend or terminate accounts that violate these terms or engage in suspicious activity. Remaining balance will be returned minus applicable fees.' },
  { title: '10. Governing Law', content: 'These terms shall be governed by the laws of the State of New York. Disputes shall be resolved through arbitration in New York City.' },
];

export default function Terms() {
  return (
    <div className="bg-slate-950 text-white min-h-screen">
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <FileText size={36} className="text-amber-400 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">Terms of Service</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Last updated: March 2026</p>
          </div>
          <div className="space-y-6">
            {SECTIONS.map((s, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-900/30 border border-slate-900">
                <h2 className="text-base font-bold mb-3 font-sans text-amber-400 uppercase tracking-wide">{s.title}</h2>
                <p className="text-slate-400 leading-relaxed text-xs font-medium">{s.content}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center text-xs text-slate-500 font-bold uppercase tracking-wider">
            <p>Questions? Contact: <span className="text-amber-400">legal@pxx-xtreme.com</span></p>
          </div>
        </div>
      </section>
    </div>
  );
}
