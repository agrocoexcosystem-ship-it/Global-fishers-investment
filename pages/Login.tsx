import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '../constants';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    // Prevent logged in users from seeing login page
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard');
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (authError) throw authError;

      if (data.session) {
        toast.success('Welcome back! Redirecting to dashboard...');
        navigate('/dashboard');
      }
    } catch (err: any) {
      const errorMessage = err.message || "Authentication failed. Please verify your credentials.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 pt-20 relative overflow-hidden">
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
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Investor Terminal</h2>
            <p className="text-slate-500 mt-2 font-semibold text-sm">Authorized access only</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold uppercase tracking-tight flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Identifier</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none transition-all font-bold text-slate-800"
                placeholder="investor@global-fishers.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Passkey</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none transition-all font-bold text-slate-800"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                localStorage.setItem('guestMode', 'true');
                toast.success("Entering Demo Mode");
                navigate('/dashboard');
              }}
              className="w-full py-3 bg-white border-2 border-slate-100 text-slate-500 rounded-2xl font-bold text-sm hover:border-emerald-500 hover:text-emerald-500 transition-all"
            >
              Try Demo (Guest Access)
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-bold">
              New to Global Fishers? <Link to="/signup" className="text-emerald-600 hover:text-emerald-700 transition-colors">Open Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};