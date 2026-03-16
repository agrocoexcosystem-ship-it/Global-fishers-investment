import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message || 'Invalid credentials');
    } else {
      toast.success('Welcome back!');
      navigate('/dashboard');
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    const { error } = await signIn('demo@global-fishers.com', 'demo123456');
    setLoading(false);
    if (error) toast.error('Demo account unavailable');
    else { toast.success('Welcome to demo!'); navigate('/dashboard'); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-emerald-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="triangle-3d" style={{ borderBottomWidth: '28px', borderLeftWidth: '16px', borderRightWidth: '16px' }} />
              <span className="text-lg font-bold text-slate-900">
                <span className="text-emerald-500">GLOBAL</span> FISHERS
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Investor Terminal</h1>
            <p className="text-slate-500 text-sm">Authorized access only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Identifier</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="investor@global-fishers.com"
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Access Passkey</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-semibold text-lg hover:bg-slate-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={20} />
            </button>
          </form>

          <button
            onClick={handleDemo}
            disabled={loading}
            className="w-full mt-3 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition text-sm"
          >
            Try Demo (Guest Access)
          </button>

          <p className="text-center mt-6 text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-emerald-600 font-semibold hover:underline">Open Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
