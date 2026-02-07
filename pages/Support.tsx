
import React, { useState } from 'react';

const FAQS = [
  {
    category: 'Getting Started',
    q: 'How do I start my first investment?',
    a: 'Simply create an account, verify your email, and head to the Dashboard. From there, click "Deposit" to fund your account via Crypto, then select a Portfolio Tier that matches your capital.'
  },
  {
    category: 'Security',
    q: 'Are my assets insured?',
    a: 'Global Fishers Investment utilizes a multi-signature cold storage architecture. While all investments carry risk, our Diamond and Infinite tiers include institutional-grade capital protection protocols.'
  },
  {
    category: 'Withdrawals',
    q: 'How long do withdrawals take?',
    a: 'Withdrawal requests are typically processed within 4-24 hours depending on your tier status. Platinum, Diamond, and Infinite members enjoy priority instant processing.'
  },
  {
    category: 'Technical',
    q: 'I lost access to my 2FA, what should I do?',
    a: 'For security reasons, 2FA resets require a manual identity verification. Please submit a priority ticket below with "2FA Reset" in the subject line.'
  }
];

const Support: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="pt-20 min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-slate-900 py-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl -mr-64 -mt-64"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">How can we help you?</h1>
          <div className="relative max-w-2xl mx-auto">
            <input 
              type="text" 
              placeholder="Search help articles, guides, and tutorials..." 
              className="w-full bg-white/10 border border-white/20 rounded-2xl py-5 px-8 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-md"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {[
            { 
              title: 'Priority Support', 
              desc: 'Our specialists are available 24/7 for urgent account matters.', 
              action: 'Send Email', 
              link: 'mailto:support@globalfishers.com',
              icon: '📧' 
            },
            { 
              title: 'Live Concierge', 
              desc: 'Real-time assistance for trading and technical support.', 
              action: 'Start Chat', 
              link: '#',
              icon: '💬',
              highlight: true 
            },
            { 
              title: 'Phone Banking', 
              desc: 'Direct line for Diamond and Infinite tier members.', 
              action: 'Call Now', 
              link: 'tel:+1800FISHERS',
              icon: '📞' 
            },
          ].map((card, i) => (
            <div key={i} className={`p-8 rounded-3xl border transition-all hover:-translate-y-1 ${card.highlight ? 'bg-emerald-600 text-white border-emerald-500 shadow-xl shadow-emerald-200' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className="text-xl font-bold mb-3">{card.title}</h3>
              <p className={`mb-6 text-sm leading-relaxed ${card.highlight ? 'text-emerald-50' : 'text-slate-500'}`}>{card.desc}</p>
              <a href={card.link} className={`inline-block px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${card.highlight ? 'bg-white text-emerald-600 hover:bg-emerald-50' : 'bg-slate-900 text-white hover:bg-emerald-600'}`}>
                {card.action}
              </a>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-16">
          {/* FAQ Accordion */}
          <div className="lg:col-span-3">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none group"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">{faq.category}</span>
                      <span className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{faq.q}</span>
                    </div>
                    <svg className={`w-5 h-5 text-slate-400 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {activeFaq === i && (
                    <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed animate-in slide-in-from-top duration-300">
                      <div className="pt-4 border-t border-slate-100">
                        {faq.a}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-xl sticky top-24">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Submit a Ticket</h3>
              <p className="text-slate-500 text-sm mb-8">Still have questions? Our experts will get back to you within 2 business hours.</p>
              
              {submitted ? (
                <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl text-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
                  <h4 className="font-bold text-emerald-800 mb-2">Ticket Received</h4>
                  <p className="text-emerald-600 text-sm">Reference ID: #GF-{Math.floor(1000 + Math.random() * 9000)}</p>
                </div>
              ) : (
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Subject</label>
                    <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none focus:border-emerald-500" placeholder="e.g. Account Verification Status" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Inquiry Type</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none focus:border-emerald-500">
                      <option>General Support</option>
                      <option>Investment Inquiry</option>
                      <option>Deposit/Withdrawal</option>
                      <option>Technical Issue</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Message</label>
                    <textarea required rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none focus:border-emerald-500" placeholder="Please provide as much detail as possible..."></textarea>
                  </div>
                  <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all active:scale-[0.98]">
                    Submit Priority Ticket
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
