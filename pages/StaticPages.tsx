import React, { useState } from 'react';

export const About: React.FC = () => (
  <div className="pt-32 pb-20 max-w-7xl mx-auto px-4">
    <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
      <div>
        <h1 className="text-5xl font-extrabold text-slate-900 mb-8 leading-tight">Global Leaders in <br /><span className="text-emerald-600">Asset Management</span></h1>
        <p className="text-lg text-slate-600 mb-6 leading-relaxed">
          Founded in 1998, Global Fishers Investment has evolved from a boutique quantitative firm into a global leader in professional asset management. We specialize in high-yield algorithmic trading and fundamental market psychology.
        </p>
        <p className="text-lg text-slate-600 leading-relaxed">
          Our mission is to provide retail investors with the same institutional tools used by the world's largest hedge funds. By bridging the gap between sophisticated technology and private wealth, we ensure our clients' capital works as hard as they do.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800" className="rounded-3xl shadow-xl mt-12" alt="Office" />
        <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800" className="rounded-3xl shadow-xl" alt="Trading" />
      </div>
    </div>
  </div>
);

export const Philosophy: React.FC = () => (
  <div className="pt-32 pb-20 max-w-5xl mx-auto px-4">
    <h1 className="text-4xl font-bold mb-12 text-center text-slate-900">The Kenneth Fisher Philosophy</h1>
    <div className="space-y-12">
      <section className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-emerald-600 mb-4 italic">"Invest where the world hasn't looked yet."</h2>
        <p className="text-slate-600 leading-relaxed">
          Kenneth Fisher, our Chief Strategist, pioneered the concept of Price-to-Sales (PSR) ratios as a predictive tool for stock market direction. His philosophy centers on the belief that markets are efficient in the long run but prone to extreme psychological cycles in the short term.
        </p>
      </section>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100">
          <h3 className="font-bold text-xl mb-4">Contrarian Intel</h3>
          <p className="text-slate-500">We don't follow trends; we identify the structural shifts that create them. Our proprietary data allows us to see market imbalances before they go mainstream.</p>
        </div>
        <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100">
          <h3 className="font-bold text-xl mb-4">Risk Mitigation</h3>
          <p className="text-slate-500">The first rule of wealth building is not losing it. We deploy multi-layered stop-loss protocols and AI-driven hedging to protect against volatility.</p>
        </div>
      </div>
    </div>
  </div>
);

export const Insight: React.FC = () => (
  <div className="pt-32 pb-20 max-w-7xl mx-auto px-4">
    <h1 className="text-4xl font-bold mb-12 text-slate-900">Market Insights</h1>
    <div className="grid md:grid-cols-3 gap-8">
      {[
        { date: 'Oct 25, 2024', title: 'Why US Treasury yields are peaking now', category: 'Macro', img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80' },
        { date: 'Oct 23, 2024', title: 'The impact of AI on emerging markets', category: 'Technology', img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80' },
        { date: 'Oct 21, 2024', title: 'Crypto adoption in Latin America', category: 'Crypto', img: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80' },
        { date: 'Oct 19, 2024', title: 'Global trade dynamics shifting East', category: 'Geopolitics', img: 'https://images.unsplash.com/photo-1526304640152-d4619684e484?auto=format&fit=crop&q=80' },
        { date: 'Oct 17, 2024', title: 'Gold vs Bitcoin: The safe haven debate', category: 'Markets', img: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&q=80' },
        { date: 'Oct 15, 2024', title: 'Sustainable energy investment trends', category: 'Green', img: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80' },
      ].map((item, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all group cursor-pointer">
          <img src={item.img} alt="Insight" className="w-full h-48 object-cover" />
          <div className="p-6">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{item.category}</span>
            <h3 className="text-xl font-bold mt-2 text-slate-800 group-hover:text-emerald-600 transition-colors">{item.title}</h3>
            <div className="mt-4 text-slate-400 text-sm">{item.date}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const Security: React.FC = () => (
  <div className="pt-32 pb-20">
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-16">
        <div className="inline-block p-4 bg-emerald-50 rounded-3xl mb-6">
          <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Fortress Grade Security</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">Our infrastructure is designed from the ground up to protect institutional and private capital with military-grade redundancy.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-20">
        {[
          { title: 'Cold Storage Vaults', desc: '98% of all digital assets are kept in geographically distributed hardware security modules (HSM) with no internet connection.', icon: '❄️' },
          { title: 'Multi-Sig Architecture', desc: 'Every transaction requires verification from a quorum of independent security keys before execution.', icon: '🔑' },
          { title: 'DDoS Protection', desc: 'Enterprise-level traffic filtering and real-time threat detection powered by Cloudflare Spectrum.', icon: '🛡️' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
            <div className="text-4xl mb-6">{item.icon}</div>
            <h3 className="text-xl font-black text-slate-900 mb-4">{item.title}</h3>
            <p className="text-slate-500 leading-relaxed text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[48px] p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <h2 className="text-3xl font-black mb-6">Client Side Safety</h2>
            <div className="space-y-6">
              {[
                { label: 'Biometric 2FA', detail: 'Mandatory FIDO2/WebAuthn hardware key support and biometric authentication for all withdrawals.' },
                { label: 'Session Management', desc: 'Real-time monitoring of account logins with automatic geolocation blocking of suspicious attempts.' },
                { label: 'Whitelisted Withdrawals', desc: 'Address book locking ensures funds can only be sent to pre-verified and aged wallet addresses.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex-shrink-0 flex items-center justify-center text-[10px] font-black">✓</div>
                  <div>
                    <h4 className="font-bold text-emerald-400">{'label' in item ? item.label : ''}</h4>
                    <p className="text-slate-400 text-sm">{'detail' in item ? item.detail : 'desc' in item ? item.desc : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
            <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4">Live Threat Map</div>
            <div className="aspect-video bg-slate-950 rounded-2xl flex items-center justify-center border border-white/5">
              <div className="text-center">
                <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-[10px] font-mono text-slate-500">POLLING GLOBAL NODES...</div>
              </div>
            </div>
            <div className="mt-4 flex justify-between text-[10px] font-mono text-slate-500">
              <span>STATUS: SECURE</span>
              <span>LATENCY: 12ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const Compliance: React.FC = () => (
  <div className="pt-32 pb-20 bg-slate-50">
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Regulatory & Compliance</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">Operating at the intersection of traditional finance and digital innovation requires a commitment to absolute transparency.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 mb-20">
        <div className="bg-white p-12 rounded-[48px] border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-8">KYC & AML Framework</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">Global Fishers Investment adheres to the strictest international standards for Anti-Money Laundering (AML) and Counter-Terrorism Financing (CTF).</p>
          <div className="space-y-6">
            {[
              { title: 'Global Identity Verification', desc: 'Real-time biometric and document verification for all investors.' },
              { title: 'Automated Transaction Monitoring', desc: 'AI-driven screening for suspicious patterns across 40+ global watchlists.' },
              { title: 'Enhanced Due Diligence', desc: 'Rigorous vetting for high-volume accounts and institutional partners.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex-shrink-0 flex items-center justify-center text-xl">📄</div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-emerald-600 p-10 rounded-[40px] text-white shadow-xl">
            <h3 className="text-xl font-black mb-4">Transparency & Audits</h3>
            <p className="text-emerald-100 mb-6 text-sm leading-relaxed">We conduct quarterly independent financial audits and semi-annual penetration testing to ensure our solvency and security integrity.</p>
            <div className="flex gap-4">
              <button className="bg-white text-emerald-600 px-6 py-3 rounded-2xl font-black text-xs hover:bg-emerald-50 transition-colors">Download Q3 2024 Audit</button>
              <button className="bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black text-xs hover:bg-emerald-800 transition-colors">Solvency Proof</button>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-4">Global Registrations</h3>
            <div className="grid grid-cols-2 gap-4">
              {['VASP Registered', 'ISO 27001 Certified', 'SOC2 Type II', 'MSB Licensed'].map((reg, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{reg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-[40px] p-12 border border-slate-200 text-center shadow-sm">
        <h3 className="text-2xl font-black text-slate-900 mb-6">Legal Disclosures</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-8">
          Global Fishers Investment Ltd is a registered entity operating under the supervision of the International Financial Services Commission.
          Investing in financial markets involves high risk. Past performance does not guarantee future results.
          Our services are not available to residents of certain jurisdictions where local laws prohibit participation.
        </p>
        <button className="text-emerald-600 font-bold hover:underline">View Full Legal Charter & Cookie Policy</button>
      </div>
    </div>
  </div>
);

export const FAQ: React.FC = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const categories = ['General', 'Investments', 'Withdrawals', 'Security'];
  const questions: Record<string, { q: string, a: string }[]> = {
    General: [
      { q: 'What is Global Fishers Investment?', a: 'Global Fishers Investment is a premier asset management firm utilizing advanced quantitative algorithms and fundamental research to deliver consistent returns for global investors.' },
      { q: 'Is there a minimum age to join?', a: 'Yes, all members must be at least 18 years of age and pass our mandatory KYC (Know Your Customer) verification process.' },
      { q: 'Which countries are supported?', a: 'We serve investors in over 85 countries. However, due to local regulations, we do not currently accept residents from certain restricted jurisdictions.' }
    ],
    Investments: [
      { q: 'What is the minimum investment?', a: 'Our entry-level "Starter Tier" begins at $250. Higher tiers offer increased daily returns and additional features.' },
      { q: 'How is daily profit calculated?', a: 'Profits are calculated based on your active tier yield and principal. They are credited to your dashboard balance every 24 hours.' },
      { q: 'Can I have multiple active plans?', a: 'Absolutely. You can diversify your portfolio by activating multiple market tiers simultaneously.' }
    ],
    Withdrawals: [
      { q: 'Are there any withdrawal fees?', a: 'Global Fishers does not charge withdrawal fees. However, standard blockchain network fees (gas) apply depending on the asset being withdrawn.' },
      { q: 'How long do withdrawals take?', a: 'Standard processing time is 4-24 hours. Elite members (Diamond and Infinite) enjoy near-instant priority processing.' },
      { q: 'What assets can I withdraw?', a: 'You can withdraw your earnings in BTC, ETH, or USDT (TRC20) to any external wallet.' }
    ],
    Security: [
      { q: 'How are my funds protected?', a: 'We utilize a multi-layered security stack including cold storage HSMs, multi-signature transaction signing, and 1:1 asset backing.' },
      { q: 'Is 2FA mandatory?', a: 'While not mandatory for login, 2FA is highly recommended and required for all withdrawal actions to ensure account safety.' },
      { q: 'What happens if I lose my secret key?', a: 'If you lose access, you must contact our priority support with proof of identity to begin the manual recovery protocol.' }
    ]
  };

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">Common Inquiries</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">Everything you need to know about navigating the Global Fishers Investment ecosystem.</p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveTab(cat); setOpenIndex(null); }}
              className={`px-8 py-3 rounded-full text-sm font-black transition-all ${activeTab === cat
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Questions Grid */}
        <div className="space-y-4">
          {questions[activeTab].map((faq, i) => (
            <div key={i} className="border border-slate-100 rounded-[32px] overflow-hidden bg-slate-50/30 transition-all hover:border-emerald-200">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-8 text-left focus:outline-none"
              >
                <span className="text-lg font-bold text-slate-800">{faq.q}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${openIndex === i ? 'bg-emerald-600 text-white rotate-180' : 'bg-slate-200 text-slate-600'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </button>
              {openIndex === i && (
                <div className="px-8 pb-8 animate-in slide-in-from-top-4 duration-300">
                  <div className="pt-4 border-t border-slate-100 text-slate-600 leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Support CTA */}
        <div className="mt-20 p-12 bg-slate-900 rounded-[48px] text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <h2 className="text-3xl font-black mb-4">Still have questions?</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">Our specialist team is available 24/7 to provide detailed assistance for your portfolio management needs.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => window.location.href = '#/support'} className="px-10 py-4 bg-emerald-600 rounded-2xl font-black text-sm hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/40">Contact Support</button>
            <button onClick={() => window.location.href = '#/about'} className="px-10 py-4 bg-white/10 rounded-2xl font-black text-sm hover:bg-white/20 transition-all">Learn More</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WithdrawalPolicy: React.FC = () => (
  <div className="pt-32 pb-24 bg-slate-50 min-h-screen">
    <div className="max-w-5xl mx-auto px-4">
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">Liquidity Standards</div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Withdrawal Policy</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">Ensuring seamless access to your capital while maintaining institutional-grade security protocols.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm">1</span>
            Processing Windows
          </h2>
          <div className="space-y-4">
            {[
              { tier: 'Starter / Bronze', time: '24 - 48 Hours' },
              { tier: 'Silver / Gold', time: '12 - 24 Hours' },
              { tier: 'Platinum / Diamond', time: '4 - 12 Hours' },
              { tier: 'Global Fisher Infinite', time: 'Instant (Priority)' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-700">{item.tier}</span>
                <span className="text-xs font-black text-emerald-600 uppercase">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm">2</span>
            Security Protocols
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0">🔐</div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Mandatory 2FA</h4>
                <p className="text-slate-500 text-xs mt-1">All withdrawal requests must be authorized via Google Authenticator or SMS verification.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0">👤</div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">KYC Completion</h4>
                <p className="text-slate-500 text-xs mt-1">Verified identity (Level 2) is required for any withdrawal exceeding $2,500 daily.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0">⛓️</div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Network Fees</h4>
                <p className="text-slate-500 text-xs mt-1">Standard blockchain transaction fees are deducted from the final payout amount.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-12 rounded-[48px] shadow-2xl relative overflow-hidden mb-16">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <h2 className="text-2xl font-black mb-8">Asset Payout Support</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center">
            <div className="text-3xl mb-3">₿</div>
            <span className="font-bold">Bitcoin (BTC)</span>
            <span className="text-[10px] text-slate-400 mt-1 uppercase">SegWit / Taproot</span>
          </div>
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center">
            <div className="text-3xl mb-3">Ξ</div>
            <span className="font-bold">Ethereum (ETH)</span>
            <span className="text-[10px] text-slate-400 mt-1 uppercase">ERC-20 Mainnet</span>
          </div>
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center">
            <div className="text-3xl mb-3">₮</div>
            <span className="font-bold">Tether (USDT)</span>
            <span className="text-[10px] text-slate-400 mt-1 uppercase">TRC-20 / ERC-20</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[48px] border border-slate-200 shadow-sm leading-relaxed text-slate-600">
        <h3 className="text-xl font-black text-slate-900 mb-6">Terms of Payout</h3>
        <ul className="space-y-4 text-sm list-disc pl-5">
          <li>Minimum withdrawal amount is $50 USD across all tiers.</li>
          <li>Withdrawals are processed during standard business hours (GMT+1), though Infinite tier requests are monitored 24/7.</li>
          <li>For security purposes, initial withdrawals on accounts younger than 7 days may be subject to a 24-hour verification hold.</li>
          <li>If a withdrawal request is flagged by our AML algorithm, the user may be asked to provide additional source-of-funds documentation.</li>
          <li>Global Fishers Investment does not support withdrawals to non-custodial mixers or high-risk gambling platforms.</li>
        </ul>
      </div>
    </div>
  </div>
);
