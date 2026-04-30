import { ArrowUpCircle } from 'lucide-react';

const SECTIONS = [
  { title: '1. Withdrawal Eligibility', content: 'Withdrawals are available to verified users with a minimum account balance of €50. All KYC verification must be completed before withdrawal requests can be processed.' },
  { title: '2. Processing Time', content: 'Standard withdrawal requests are processed within 24 business hours. Large withdrawals (above €50,000) may require additional verification and up to 72 hours for processing.' },
  { title: '3. Minimum & Maximum Amounts', content: 'Minimum withdrawal: €50. Maximum daily withdrawal: €100,000. Higher limits may be available for VIP tier investors upon request.' },
  { title: '4. Withdrawal Methods', content: 'Withdrawals are processed via cryptocurrency (BTC, ETH, USDT) to your designated wallet address. Ensure the receiving address is correct as blockchain transactions are irreversible.' },
  { title: '5. Fees', content: 'Standard withdrawals are free of platform fees. Network transaction fees (gas fees) apply and are deducted from the withdrawal amount. Fee estimates are displayed before confirmation.' },
  { title: '6. Locked Investments', content: 'Investments within an active tier duration cannot be withdrawn until the tier period ends. Early withdrawal may result in forfeiture of accrued returns for that period.' },
  { title: '7. Verification Requirements', content: 'For security, we may request additional identity verification for withdrawals. This includes but is not limited to photo ID confirmation, selfie verification, and address proof.' },
  { title: '8. Cancellation', content: 'Withdrawal requests can be cancelled within 1 hour of submission if not yet processed. Once a transaction is broadcast to the blockchain, it cannot be reversed or cancelled.' },
];

export default function WithdrawalPolicy() {
  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <ArrowUpCircle size={36} className="text-emerald-400 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Withdrawal Policy</h1>
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
            <p>Need help? Contact: <span className="text-emerald-400">support@global-fishers.com</span></p>
          </div>
        </div>
      </section>
    </div>
  );
}
