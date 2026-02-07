
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '../constants';
import toast from 'react-hot-toast';

type AuthMode = 'login' | 'signup' | 'forgot';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate high-security authentication handshake
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1800);
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Recovery link sent to your registered email.");
      setMode('login');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 pt-20 relative overflow-hidden">
      {/* Structural Background Patterns */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] bg-emerald-100 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-[480px] w-full relative z-10">
        <div className="bg-white rounded-[40px] p-8 md:p-14 border border-slate-200/60 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.08)]">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-8 scale-110">
              <Logo />
            </div>
            
            {mode === 'login' ? (
              <>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Investor Terminal</h2>
                <p className="text-slate-500 mt-2 font-semibold text-sm">Secure authorization required</p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Recover Access</h2>
                <p className="text-slate-500 mt-2 font-semibold text-sm">Verify your institutional identity</p>
              </>
            )}
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Identifier</label>
                <input 
                  type="email" 
                  required
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none transition-all font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-300" 
                  placeholder="investor@global-fishers.com" 
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secret Protocol Key</label>
                  <button 
                    type="button" 
                    onClick={() => setMode('forgot')}
                    className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors"
                  >
                    Lost Access?
                  </button>
                </div>
                <input 
                  type="password" 
                  required
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none transition-all font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-300" 
                  placeholder="••••••••" 
                />
              </div>

              <div className="flex items-center gap-3 px-1">
                <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                <label htmlFor="remember" className="text-xs text-slate-500 font-bold cursor-pointer">Verify device for 30-day session</label>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-emerald-600 hover:shadow-emerald-200/40 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Authenticate</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRecovery} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registered Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none transition-all font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-300" 
                  placeholder="Enter your registered email" 
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center"
              >
                {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Send Recovery Link'}
              </button>
              
              <button 
                type="button" 
                onClick={() => setMode('login')}
                className="w-full text-center text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
              >
                Back to Authentication
              </button>
            </form>
          )}

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-bold">
              New to Global Fishers? <Link to="/signup" className="text-emerald-600 hover:text-emerald-700 transition-colors">Apply for Account</Link>
            </p>
          </div>
        </div>
        
        <div className="mt-10 flex flex-col items-center gap-4 px-6">
          <div className="flex gap-6 items-center opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
             <div className="text-[8px] font-black border border-slate-900 px-2 py-1 rounded">ISO 27001</div>
             <div className="text-[8px] font-black border border-slate-900 px-2 py-1 rounded">SOC2 TYPE II</div>
             <div className="text-[8px] font-black border border-slate-900 px-2 py-1 rounded">GDPR READY</div>
          </div>
          <p className="text-center text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">
            Institutional Grade Security &bull; End-to-End Encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate multi-step backend verification
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8fafc] pt-20">
      {/* Left Sidebar - Brand & Trust (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/3 bg-slate-900 relative overflow-hidden p-16 flex-col justify-between">
        <div className="absolute top-0 right-0 w-full h-full opacity-20">
          <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[140px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-500 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10">
          <Logo />
          <h1 className="text-4xl font-black text-white mt-20 leading-tight">
            Secure Your <br /><span className="text-emerald-500">Financial Legacy</span>
          </h1>
          <p className="text-slate-400 mt-6 text-lg max-w-sm leading-relaxed">
            Access institutional-grade portfolios and proprietary quantitative strategies used by the top 1% of global investors.
          </p>
        </div>

        <div className="relative z-10 space-y-8">
          {[
            { label: 'Asset Insurance', value: '1:1 Fully Backed' },
            { label: 'Global Compliance', value: '85+ Jurisdictions' },
            { label: 'Encryption', value: 'Quantum-Safe AES-256' },
          ].map((item, i) => (
            <div key={i}>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{item.label}</div>
              <div className="text-white font-bold">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content - Onboarding Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-20 overflow-y-auto">
        <div className="max-w-xl w-full bg-white rounded-[48px] p-8 md:p-16 border border-slate-200/60 shadow-[0_48px_80px_-24px_rgba(15,23,42,0.12)]">
          <div className="mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Apply for Portfolio</h2>
            <p className="text-slate-500 mt-2 font-bold">Standard KYC verification is required for all tiers.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all font-bold text-slate-800" 
                  placeholder="As per ID" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Digital Mail</label>
                <input 
                  type="email" 
                  required 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all font-bold text-slate-800" 
                  placeholder="secure@mail.com" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Identification</label>
              <input 
                type="tel" 
                required 
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all font-bold text-slate-800" 
                placeholder="+1 (555) 000-0000" 
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Portfolio Passkey</label>
                <input 
                  type="password" 
                  required 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all font-bold text-slate-800" 
                  placeholder="Strong password" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Protocol</label>
                <input 
                  type="password" 
                  required 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all font-bold text-slate-800" 
                  placeholder="Repeat passkey" 
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex gap-4">
              <div className="pt-1">
                <input type="checkbox" required className="w-5 h-5 accent-emerald-600 rounded cursor-pointer" id="terms" />
              </div>
              <label htmlFor="terms" className="text-[11px] text-slate-500 font-bold leading-relaxed cursor-pointer">
                I hereby declare that I am of legal age and have reviewed the <span className="text-emerald-600 underline">Client Asset Charter</span>, 
                <span className="text-emerald-600 underline">Risk Management Protocol</span>, and <span className="text-emerald-600 underline">Privacy Enforcement Policy</span>.
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black shadow-2xl shadow-emerald-200/50 hover:bg-emerald-700 transition-all text-xl active:scale-[0.98] flex items-center justify-center gap-3 group"
            >
              {isLoading ? (
                <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Begin Onboarding</span>
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center text-sm text-slate-400 font-bold border-t border-slate-100 pt-8">
            Existing global partner? <Link to="/login" className="text-slate-900 hover:text-emerald-600 transition-colors">Resume Terminal Session</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
