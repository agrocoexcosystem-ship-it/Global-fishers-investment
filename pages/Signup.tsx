import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '../constants';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard');
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isLoading) return;

    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("SIGNUP ATTEMPT:", { email: form.email }); // Debug log

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
          }
        }
      });

      console.log("SIGNUP RESULT:", { data, error: signUpError }); // Debug log

      if (signUpError) throw signUpError;

      // Check if session exists (email confirmation disabled)
      if (data.session) {
        toast.success('Account created and signed in!');
        navigate('/dashboard');
        return;
      }

      // No session = email confirmation required
      if (data.user) {
        toast.success('Account created! You can now sign in.');
        navigate('/login');
      }
    } catch (err: any) {
      let errorMessage = err.message || "An error occurred during registration.";
      console.error("SIGNUP ERROR:", errorMessage); // Debug log

      // Developer Hint for Rate Limits
      if (errorMessage.toLowerCase().includes('rate limit')) {
        errorMessage = "Rate limit exceeded. DEV NOTE: Go to Supabase Dashboard -> Auth -> Rate Limits to increase this limit.";
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8fafc] pt-20">
      <div className="hidden lg:flex lg:w-1/3 bg-slate-900 relative overflow-hidden p-16 flex-col justify-between">
        <div className="absolute top-0 right-0 w-full h-full opacity-20">
          <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[140px]"></div>
        </div>

        <div className="relative z-10">
          <Logo />
          <h1 className="text-4xl font-black text-white mt-20 leading-tight">
            Institutional <br /><span className="text-emerald-500">Asset Management</span>
          </h1>
          <p className="text-slate-400 mt-6 text-lg max-w-sm leading-relaxed">
            Begin your journey with Global Fishers and unlock proprietary financial strategies.
          </p>
        </div>

        <div className="relative z-10 space-y-8">
          {[
            { label: 'Platform Security', value: 'Bank-Grade AES' },
            { label: 'Assets Protected', value: '1:1 Fully Backed' },
          ].map((item, i) => (
            <div key={i}>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{item.label}</div>
              <div className="text-white font-bold">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="max-w-xl w-full bg-white rounded-[48px] p-8 md:p-16 border border-slate-200/60 shadow-2xl">
          <div className="mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Open Portfolio</h2>
            <p className="text-slate-500 mt-2 font-bold italic text-sm">Join the 1% of strategic investors globally.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold uppercase tracking-tight flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all font-bold text-slate-800"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all font-bold text-slate-800"
                placeholder="investor@mail.com"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Passkey</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all font-bold text-slate-800"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm</label>
                <input
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all font-bold text-slate-800"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all text-xl active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>Register Portfolio</span>
              )}
            </button>
          </form>

          <div className="mt-12 text-center text-sm text-slate-400 font-bold border-t border-slate-100 pt-8">
            Already have a key? <Link to="/login" className="text-slate-900 hover:text-emerald-600 transition-colors">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};