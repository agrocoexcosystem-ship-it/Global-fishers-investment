import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MessageCircle, Clock, MapPin, ChevronDown, ChevronUp, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const FAQS = [
  { q: 'How do I create an account?', a: 'Click "Open Account" on the signup page, provide your details, verify your email, and your portfolio will be ready within minutes.' },
  { q: 'What is the minimum investment amount?', a: 'Our Starter Tier begins at €100. Higher tiers require larger minimum investments for enhanced returns.' },
  { q: 'How are returns calculated?', a: 'Returns are calculated daily based on your selected tier\'s percentage rate, applied to your invested capital. Use our Calculator page for estimates.' },
  { q: 'How long does withdrawal processing take?', a: 'Withdrawal requests are processed within 24 hours during business days. Funds are sent to your designated wallet address.' },
  { q: 'Is my investment insured?', a: 'Yes, all investor funds are covered by our comprehensive insurance policy, providing protection against unforeseen events.' },
  { q: 'Can I switch between investment tiers?', a: 'Yes, you can upgrade or adjust your tier at any time. The new rate will apply from the next business day.' },
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
    <div className="bg-slate-900 text-white min-h-screen">
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-6">
              Help Center
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Get <span className="italic text-emerald-400">Support</span>
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              Our dedicated support team is available around the clock to assist you.
            </p>
          </div>
          {/* Contact Methods */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {[
              { icon: Mail, title: 'Direct Liaison', detail: 'support@global-fishers.com', sub: 'Priority response within 2 hours', isLink: false },
              { icon: Phone, title: 'Corporate Line', detail: '+49 15 216 228 753', sub: 'Available Mon-Fri 9AM-6PM EST', isLink: false },
              { icon: MessageCircle, title: 'Telegram Support', detail: '@GlobalFishersinvestment', sub: 'Direct link to chat concierge', isLink: true, link: 'https://t.me/GlobalFishersinvestment' },
              { icon: Clock, title: 'Instant Concierge', detail: '24/7 Digital Assistant', sub: 'Real-time support via Smartsupp', isLink: false },
            ].map((method, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[2rem] glass-effect-dark border border-slate-800 hover:border-emerald-500/30 transition-all group text-center relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 group-hover:bg-emerald-500/10 transition-colors"></div>
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <method.icon size={28} className="text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-2 tracking-tight">{method.title}</h3>
                {method.isLink ? (
                  <a href={method.link} target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold text-lg mb-2 block hover:underline">
                    {method.detail}
                  </a>
                ) : (
                  <p className="text-emerald-400 font-bold text-lg mb-2">{method.detail}</p>
                )}
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">{method.sub}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* FAQ Section */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-black mb-2 tracking-tighter uppercase">Common Inquiries</h2>
                <div className="h-1.5 w-12 bg-emerald-500 rounded-full mb-8"></div>
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
                      ${openFaq === i ? 'bg-slate-900 border-emerald-500/30' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full p-6 flex items-center justify-between text-left group"
                    >
                      <span className={`font-bold text-base tracking-tight transition-colors ${openFaq === i ? 'text-emerald-400' : 'text-slate-300'}`}>{faq.q}</span>
                      <div className={`p-2 rounded-lg transition-colors ${openFaq === i ? 'bg-emerald-500/10' : 'bg-slate-800'}`}>
                        {openFaq === i ? <ChevronUp size={18} className="text-emerald-400" /> : <ChevronDown size={18} className="text-slate-500" />}
                      </div>
                    </button>
                    {openFaq === i && (
                      <div className="px-6 pb-6 text-sm text-slate-400 leading-relaxed font-medium">{faq.a}</div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:sticky lg:top-24">
              <div className="p-10 rounded-[2.5rem] glass-effect-dark border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                
                <h2 className="text-2xl font-black mb-8 tracking-tight relative z-10 flex items-center justify-between">
                  Secure Communication
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">SSL Protected</span>
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Legal Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        placeholder="John Doe"
                        className="w-full px-5 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/30 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Email Identifier</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder="you@email.com"
                        className="w-full px-5 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/30 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Inquiry Details</label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      required
                      rows={4}
                      placeholder="Specify your requirements..."
                      className="w-full px-5 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/30 transition resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="group relative w-full py-5 bg-emerald-500 text-white rounded-2xl font-bold text-lg hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 overflow-hidden shadow-xl shadow-emerald-500/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    Transmit Message <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </form>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10 border-t border-slate-800/50">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl">
                      <MapPin size={18} className="text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1">Head Office</h4>
                      <p className="text-xs text-slate-300 font-medium leading-relaxed">Financial District, New York, NY 10005</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl">
                      <Clock size={18} className="text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1">Operational Hours</h4>
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
