import { FileText } from 'lucide-react';

const SECTIONS = [
  { title: '1. Acceptance of Terms', content: 'By accessing or using the Global Fishers Investment platform, you agree to be bound by these Terms of Service. If you do not agree, you may not use our services.' },
  { title: '2. Eligibility', content: 'You must be at least 18 years of age and legally eligible to enter into contracts in your jurisdiction. You must complete our KYC verification process before accessing investment features.' },
  { title: '3. Account Responsibilities', content: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during registration.' },
  { title: '4. Investment Services', content: 'Global Fishers Investment provides asset management services through various investment tiers. Past performance does not guarantee future results. All investments carry inherent risk.' },
  { title: '5. Deposits & Withdrawals', content: 'Deposits are processed upon blockchain confirmation. Withdrawals are processed within 24 business hours. We may request additional verification for large transactions.' },
  { title: '6. Fees & Charges', content: 'Management fees are disclosed before investment. Network transaction fees are borne by the user. Fee schedules may be updated with 30 days advance notice.' },
  { title: '7. Prohibited Activities', content: 'Users shall not engage in money laundering, use fraudulent documents, manipulate platform systems, access other accounts, or use unauthorized automated systems.' },
  { title: '8. Limitation of Liability', content: 'Global Fishers Investment shall not be liable for losses from market volatility, force majeure, third-party disruptions, or user negligence. Total liability shall not exceed the amount invested.' },
  { title: '9. Termination', content: 'We may suspend or terminate accounts that violate these terms or engage in suspicious activity. Remaining balance will be returned minus applicable fees.' },
  { title: '10. Governing Law', content: 'These terms shall be governed by the laws of the State of New York. Disputes shall be resolved through arbitration in New York City.' },
];

export default function Terms() {
  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <FileText size={36} className="text-emerald-400 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-slate-400">Last updated: March 2026</p>
          </div>
          <div className="space-y-6">
            {SECTIONS.map((s, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700">
                <h2 className="text-xl font-bold mb-3 font-sans text-emerald-400">{s.title}</h2>
                <p className="text-slate-300 leading-relaxed text-sm">{s.content}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center text-sm text-slate-500">
            <p>Questions? Contact: <span className="text-emerald-400">legal@global-fishers.com</span></p>
          </div>
        </div>
      </section>
    </div>
  );
}
