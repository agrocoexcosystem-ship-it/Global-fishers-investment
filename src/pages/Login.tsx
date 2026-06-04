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


  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/20 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="glass-effect-dark rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center space-x-3 mb-6 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-emerald-500 rounded-full blur opacity-25 group-hover:opacity-50 transition"></div>
                <img src="/logo.svg" alt="Logo" className="relative h-12 w-12" />
              </div>
              <span className="text-2xl font-black tracking-tighter">
                <span className="text-emerald-400">GLOBAL</span>
                <span className="text-white ml-2">FISHERS</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-white mb-2">Investor Terminal</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Authorized Access Only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Email Identifier</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="investor@global-fishers.com"
                required
                className="w-full px-5 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/30 transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Access Passkey</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-5 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/30 transition"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-400 transition">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-5 bg-emerald-500 text-white rounded-2xl font-bold text-lg hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              {loading ? 'Authenticating...' : 'Establish Connection'} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>


          <p className="text-center mt-10 text-xs font-medium text-slate-500 uppercase tracking-wider">
            New Investor?{' '}
            <Link to="/signup" className="text-emerald-400 font-bold hover:text-emerald-300 transition ml-1">Join Portfolio</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
