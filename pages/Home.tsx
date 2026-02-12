import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { INVESTMENT_PLANS } from '../constants';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Shield, TrendingUp, Globe, Award, ChevronRight } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-900"></div>
          <motion.div style={{ y: y1 }} className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]" />
          <motion.div style={{ y: y2 }} className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            <motion.div variants={fadeInUp} className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Institutional Grade Assets</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tight mb-8">
              Wealth Beyond <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Boundaries</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg md:text-2xl text-slate-300 max-w-3xl mb-12 leading-relaxed font-light">
              Global Fishers Investment combines algorithmic precision with human expertise to deliver consistent, superior returns in a volatile global market.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
              <button
                onClick={() => navigate('/signup')}
                className="group relative px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg overflow-hidden shadow-2xl shadow-emerald-900/50 hover:shadow-emerald-500/40 transition-all hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <span className="flex items-center gap-2">Start Investing <ArrowRight size={20} /></span>
              </button>
              <button
                onClick={() => navigate('/plans')}
                className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold text-lg hover:bg-white/10 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
              >
                Explore Portfolios
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500"
        >
          <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-emerald-500 to-transparent"></div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white relative z-20 -mt-8 rounded-t-[3rem] shadow-[0_-20px_40px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Assets Under Management', value: '$4.2B+', icon: <TrendingUp className="text-emerald-500" /> },
              { label: 'Verified Investors', value: '150k+', icon: <Globe className="text-blue-500" /> },
              { label: 'Countries Served', value: '85+', icon: <Shield className="text-indigo-500" /> },
              { label: 'Years Experience', value: '25+', icon: <Award className="text-amber-500" /> },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl bg-slate-50 hover:bg-white border border-slate-100 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex justify-center mb-4 p-3 bg-white rounded-full w-fit mx-auto shadow-sm group-hover:scale-110 transition-transform">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-black text-slate-900 mb-2">{stat.value}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Plans Preview */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-6"
            >
              Curated Investment <span className="text-emerald-600">Portfolios</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-600 max-w-2xl mx-auto"
            >
              Choose from our range of professionally managed strategies designed to match your financial goals and risk tolerance.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Decorative blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-gradient-to-r from-emerald-200/20 to-blue-200/20 blur-3xl rounded-full -z-10"></div>

            {INVESTMENT_PLANS.slice(0, 3).map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-emerald-100/50 hover:-translate-y-2 transition-all duration-300 flex flex-col relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${i === 0 ? 'from-emerald-400 to-emerald-600' : i === 1 ? 'from-blue-400 to-blue-600' : 'from-indigo-400 to-purple-600'}`}></div>

                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-slate-900">+{plan.dailyReturn}%</span>
                  <span className="text-slate-500 font-medium">/daily</span>
                </div>

                <div className="space-y-4 mb-8 flex-grow">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-sm font-medium text-slate-500">Min Deposit</span>
                    <span className="font-bold text-slate-900">${plan.minDeposit.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-sm font-medium text-slate-500">Duration</span>
                    <span className="font-bold text-slate-900">{plan.durationDays} Days</span>
                  </div>
                  <ul className="space-y-3 pt-4">
                    {plan.features.slice(0, 3).map((tech, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="p-1 rounded-full bg-emerald-100 text-emerald-600">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => navigate('/plans')}
                  className="w-full py-4 rounded-xl font-bold bg-slate-900 text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-slate-200"
                >
                  View Details
                </button>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button onClick={() => navigate('/plans')} className="inline-flex items-center gap-2 text-slate-600 font-bold hover:text-emerald-600 transition-colors">
              View All Investment Tiers <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Feature/Vision Section */}
      <section className="py-32 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-l from-emerald-900/30 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
                Built for the <br /><span className="text-emerald-500">Modern Investor</span>
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                We don't just follow the market; we anticipate it. Our proprietary AI-driven algorithms analyze massive datasets to identify high-potential opportunities before they become mainstream trends.
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <h4 className="text-xl font-bold mb-2 text-emerald-400">Security First</h4>
                  <p className="text-sm text-slate-400">Military-grade encryption and cold storage protocols.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <h4 className="text-xl font-bold mb-2 text-blue-400">Liquidity</h4>
                  <p className="text-sm text-slate-400">Fast withdrawals and transparent fee structures.</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80" alt="Analytics Dashboard" className="w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>

                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                      <TrendingUp />
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg">Real-Time Analytics</div>
                      <div className="text-emerald-400 text-sm">Live Performance Tracking</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating card */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 bg-white p-6 rounded-2xl shadow-xl hidden md:block"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-slate-500 text-xs font-bold uppercase">System Status</span>
                </div>
                <div className="text-slate-900 font-black text-2xl">Operational</div>
                <div className="text-emerald-600 text-sm font-bold">100% Uptime</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Global Headquarters Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl group"
            >
              <div className="absolute inset-0 bg-emerald-900/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80"
                alt="Fisher Investments Global Headquarters"
                className="w-full h-[500px] object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest">Global HQ</span>
                </div>
                <h3 className="text-3xl font-bold text-white">Fisher Investments Campus</h3>
                <p className="text-slate-300 text-sm mt-2">Camas, Washington, USA</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                A Foundation of <span className="text-emerald-600">Excellence</span>
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                From our state-of-the-art global headquarters, we oversee billions in assets with the precision and discipline that has defined our firm for over two decades. Our campus reflects our commitment to transparency, innovation, and long-term growth.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-100/50 rounded-xl text-emerald-700">
                    <Globe size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-1">Global Reach</h4>
                    <p className="text-slate-500">Serving clients across 14 countries from strategic operational hubs.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100/50 rounded-xl text-blue-700">
                    <Award size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-1">Industry Recognition</h4>
                    <p className="text-slate-500">Consistently ranked among top wealth managers for client satisfaction.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/about')}
                className="mt-10 px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold shadow-sm hover:bg-slate-50 hover:border-emerald-200 transition-all flex items-center gap-2 group"
              >
                Learn More About Us <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </button>
            </motion.div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Ready to Elevate Your Portfolio?</h2>
          <p className="text-xl text-slate-600 mb-10">Join over 150,000 investors globally who trust Global Fishers.</p>
          <button
            onClick={() => navigate('/signup')}
            className="px-12 py-5 bg-emerald-600 text-white rounded-full font-bold text-xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:scale-105 transition-all"
          >
            Create Free Account
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
