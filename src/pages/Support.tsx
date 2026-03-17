import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MessageCircle, Clock, MapPin, ChevronDown, ChevronUp, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const FAQS = [
  { q: 'How do I create an account?', a: 'Click "Open Account" on the signup page, provide your details, verify your email, and your portfolio will be ready within minutes.' },
  { q: 'What is the minimum investment amount?', a: 'Our Starter Tier begins at $100. Higher tiers require larger minimum investments for enhanced returns.' },
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: Mail, title: 'Email Support', detail: 'support@global-fishers.com', sub: 'Response within 2 hours' },
              { icon: Phone, title: 'Phone Support', detail: '+1 (555) 123-4567', sub: 'Mon-Fri 9AM-6PM EST' },
              { icon: MessageCircle, title: 'Live Chat', detail: 'Available 24/7', sub: 'Instant response via Smartsupp' },
            ].map((method, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-emerald-500/30 transition text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <method.icon size={22} className="text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold mb-1 font-sans">{method.title}</h3>
                <p className="text-emerald-400 font-medium text-sm">{method.detail}</p>
                <p className="text-slate-500 text-xs mt-1">{method.sub}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* FAQ Section */}
            <div>
              <h2 className="text-2xl font-bold mb-6 font-sans">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {FAQS.map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="rounded-xl bg-slate-800/30 border border-slate-700 overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition"
                    >
                      <span className="font-semibold text-sm font-sans pr-4">{faq.q}</span>
                      {openFaq === i ? <ChevronUp size={18} className="text-emerald-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />}
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-4 text-sm text-slate-400 leading-relaxed">{faq.a}</div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6 font-sans">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700">
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@email.com"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Message</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                    rows={5}
                    placeholder="How can we help you?"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition flex items-center justify-center gap-2"
                >
                  <Send size={18} /> Send Message
                </button>
              </form>

              {/* Office Info */}
              <div className="mt-6 p-6 rounded-2xl bg-slate-800/30 border border-slate-700">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold font-sans text-sm">Head Office</h4>
                    <p className="text-slate-400 text-sm">Global Fishers Investment Ltd.<br/>Financial District, New York, NY 10005</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 mt-4">
                  <Clock size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold font-sans text-sm">Business Hours</h4>
                    <p className="text-slate-400 text-sm">Monday – Friday: 9:00 AM – 6:00 PM EST<br/>Weekend: Emergency support only</p>
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
