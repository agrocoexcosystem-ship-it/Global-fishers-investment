import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Eye, EyeOff, Coins } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPw) { toast.error('Passkeys do not match'); return; }
    if (password.length < 6) { toast.error('Passkey must be at least 6 characters'); return; }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success('Account created! Please complete verification.'); navigate('/verify'); }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/20 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/30 rounded-[2.5rem] p-10 border border-slate-900 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center space-x-3 mb-6 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-amber-500 rounded-full blur opacity-25 group-hover:opacity-50 transition"></div>
                <div className="relative h-12 w-12 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <Coins size={22} className="text-slate-950" />
                </div>
              </div>
              <span className="text-2xl font-black tracking-tighter">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">PXX</span>
                <span className="text-white ml-2 text-sm uppercase tracking-widest font-light opacity-80">Platform</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-white mb-2">Open Portfolio</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Start Your Ecosystem Journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Full Legal Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" required
                className="w-full px-5 py-4 bg-slate-950 border border-slate-900 rounded-2xl text-white placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition text-xs font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required
                className="w-full px-5 py-4 bg-slate-950 border border-slate-900 rounded-2xl text-white placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition text-xs font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Access Passkey</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                  className="w-full px-5 py-4 bg-slate-950 border border-slate-900 rounded-2xl text-white placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition text-xs font-bold" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-amber-400 transition">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Confirm Passkey</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" required
                className="w-full px-5 py-4 bg-slate-950 border border-slate-900 rounded-2xl text-white placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition text-xs font-bold" />
            </div>

            <button type="submit" disabled={loading}
              className="group relative w-full py-4.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50 overflow-hidden shadow-xl shadow-amber-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              {loading ? 'Creating...' : 'Establish Portfolio'} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-slate-950" />
            </button>
          </form>

          <p className="text-center mt-10 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Already Registered?{' '}
            <Link to="/login" className="text-amber-400 font-bold hover:text-amber-300 transition ml-1">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
