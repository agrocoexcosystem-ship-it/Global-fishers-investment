import { AlertTriangle } from 'lucide-react';

const SECTIONS = [
  { title: '1. General Risk Warning', content: 'Trading and investing in financial markets involves substantial risk of loss. You should carefully consider whether trading is suitable for your financial situation. Only invest funds you can afford to lose.' },
  { title: '2. Market Volatility', content: 'Financial markets are inherently volatile. Prices can fluctuate rapidly due to economic events, geopolitical developments, and market sentiment. Past performance is not indicative of future results.' },
  { title: '3. Cryptocurrency Risks', content: 'Cryptocurrency markets are highly speculative and volatile. Digital assets may lose significant value in short periods. Regulatory changes may impact the legality and value of cryptocurrencies.' },
  { title: '4. No Guaranteed Returns', content: 'While our tiers display projected return rates, these are estimates based on historical performance. Actual returns may be higher or lower than projected. Capital loss is possible.' },
  { title: '5. Leverage & Margin Risk', content: 'Some trading strategies may involve leverage. Leveraged trading magnifies both potential profits and losses. You could lose more than your initial investment.' },
  { title: '6. Liquidity Risk', content: 'In certain market conditions, positions may not be liquidated at desired prices. Market liquidity can evaporate during extreme volatility, affecting withdrawal processing times.' },
  { title: '7. Technology Risk', content: 'Platform outages, network congestion, and system failures may temporarily affect access to your account. While we maintain robust infrastructure, no system is completely immune to disruption.' },
  { title: '8. Regulatory Risk', content: 'Changes in laws and regulations may affect the availability of our services. We comply with all applicable regulations but cannot guarantee uninterrupted service across all jurisdictions.' },
];

export default function Risk() {
  return (
    <div className="bg-slate-950 text-white min-h-screen">
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <AlertTriangle size={36} className="text-amber-400 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">Risk Disclosure</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Last updated: March 2026</p>
          </div>

          <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-8 text-center">
            <p className="text-amber-300 font-semibold text-sm">
              ⚠ IMPORTANT: Please read this entire document carefully before making any investment decisions.
              Trading financial instruments carries a high level of risk.
            </p>
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
            <p>For risk-related inquiries: <span className="text-amber-400">compliance@pxx-xtreme.com</span></p>
          </div>
        </div>
      </section>
    </div>
  );
}
