import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MessageCircle, Clock, MapPin, ChevronDown, ChevronUp, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const FAQS = [
  { q: 'How do I connect my wallet?', a: 'Click the "Connect Wallet" button in the upper right corner of the dashboard. Ensure you have MetaMask, Trust Wallet, or another Web3 compatible browser extension installed and set to the correct network.' },
  { q: 'What is the PXX exchange rate?', a: 'The swap rate is configured on-chain at 1 PXX = 0.001 ETH (or approximately $3.45 USD based on market conditions).' },
  { q: 'What are the staking lock options?', a: 'You can deploy PXX into our staking vaults for 30 Days (12% APY), 90 Days (18.5% APY), or 180 Days (25.0% APY) to maximize your yield.' },
  { q: 'How long do token purchases take to clear?', a: 'On-chain transactions are processed as soon as the block inclusion is confirmed by the network, usually taking 10 to 30 seconds.' },
  { q: 'How does DAO governance work?', a: 'Your voting power scales directly with your PXX token balance (1 PXX = 1 Vote weight). You can vote on active network proposals directly in the Governance console.' },
  { q: 'Can I mint mock tokens for testing?', a: 'Yes! When your wallet is connected, use the "PXX Dev Faucet" on the swap page to mint 5,000 mock PXX tokens instantly.' },
];

export default function Support() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll respond within 24 hours.');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-6">
              Help Center
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
              Get <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Support</span>
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
              Our dedicated support team is available around the clock to assist you with swap calls, staking deployments, and governance setup.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {[
              { icon: Mail, title: 'Direct Liaison', detail: 'support@pxx-xtreme.com', sub: 'Priority response within 2 hours', isLink: false },
              { icon: Phone, title: 'Corporate Line', detail: '+49 15 216 228 753', sub: 'Available Mon-Fri 9AM-6PM EST', isLink: false },
              { icon: MessageCircle, title: 'Telegram Support', detail: '@PXXXtremeXchange', sub: 'Direct link to chat concierge', isLink: true, link: 'https://t.me/PXXXtremeXchange' },
              { icon: Clock, title: 'Instant Concierge', detail: '24/7 Digital Assistant', sub: 'Real-time support via Smartsupp', isLink: false },
            ].map((method, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[2rem] bg-slate-900/30 border border-slate-900 hover:border-amber-500/20 transition-all duration-300 group text-center relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-12 -mt-12 group-hover:bg-amber-500/10 transition-colors"></div>
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <method.icon size={26} className="text-amber-400" />
                </div>
                <h3 className="text-xl font-bold mb-2 tracking-tight">{method.title}</h3>
                {method.isLink ? (
                  <a href={method.link} target="_blank" rel="noopener noreferrer" className="text-amber-400 font-bold text-base mb-2 block hover:underline truncate">
                    {method.detail}
                  </a>
                ) : (
                  <p className="text-amber-400 font-bold text-base mb-2 truncate">{method.detail}</p>
                )}
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em]">{method.sub}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* FAQ Section */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-black mb-2 tracking-tighter uppercase font-sans">Common Inquiries</h2>
                <div className="h-1.5 w-12 bg-amber-500 rounded-full mb-8"></div>
              </div>
              <div className="space-y-4">
                {FAQS.map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden
                      ${openFaq === i ? 'bg-slate-900 border-amber-500/20' : 'bg-slate-900/40 border-slate-900 hover:border-slate-800'}`}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full p-6 flex items-center justify-between text-left group"
                    >
                      <span className={`font-bold text-sm tracking-tight transition-colors ${openFaq === i ? 'text-amber-400' : 'text-slate-300'}`}>{faq.q}</span>
                      <div className={`p-2 rounded-lg transition-colors ${openFaq === i ? 'bg-amber-500/10' : 'bg-slate-900'}`}>
                        {openFaq === i ? <ChevronUp size={16} className="text-amber-400" /> : <ChevronDown size={16} className="text-slate-500" />}
                      </div>
                    </button>
                    {openFaq === i && (
                      <div className="px-6 pb-6 text-xs text-slate-400 leading-relaxed font-medium">{faq.a}</div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:sticky lg:top-24">
              <div className="p-10 rounded-[2.5rem] bg-slate-900/30 border border-slate-900 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                
                <h2 className="text-2xl font-black mb-8 tracking-tight relative z-10 flex items-center justify-between">
                  Secure Connection
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">SSL Protected</span>
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Legal Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        placeholder="John Doe"
                        className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Email Identifier</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder="you@email.com"
                        className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition text-xs font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Inquiry Details</label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      required
                      rows={4}
                      placeholder="Specify your requirements..."
                      className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition text-xs font-bold resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="group relative w-full py-4.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.01] transition-all flex items-center justify-center gap-2 overflow-hidden shadow-xl shadow-amber-500/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    Transmit Message <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-slate-950" />
                  </button>
                </form>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10 border-t border-slate-905">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-xl">
                      <MapPin size={18} className="text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[9px] text-slate-400 uppercase tracking-[0.2em] mb-1">Ecosystem Office</h4>
                      <p className="text-xs text-slate-300 font-medium leading-relaxed">Financial District, New York, NY 10005</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-xl">
                      <Clock size={18} className="text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[9px] text-slate-400 uppercase tracking-[0.2em] mb-1">Operational Hours</h4>
                      <p className="text-xs text-slate-300 font-medium leading-relaxed">Mon-Fri: 0900 – 1800 EST</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
