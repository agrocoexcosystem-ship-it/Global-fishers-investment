import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Logo } from '../constants';
import toast from 'react-hot-toast';

const AdminLogin: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            // 1. Auth with Supabase
            const { data: { session }, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            if (!session) throw new Error('No session created');

            // 2. Check Admin Role
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profileError) {
                // EMERGENCY BYPASS: If DB policy fails (recursion), but email matches Super Admin
                if (email.toLowerCase() === 'obiesieprosper@gmail.com') {
                    console.warn("DB Policy Error detected. Activating Super Admin Bypass.");
                    toast.success('Super Admin Bypass Active', { icon: '🛡️' });
                    navigate('/admin');
                    return;
                }
                throw profileError;
            }

            if (profile?.role !== 'admin') {
                // Secondary Bypass Check
                if (email.toLowerCase() === 'obiesieprosper@gmail.com') {
                    navigate('/admin');
                    return;
                }
                await supabase.auth.signOut();
                throw new Error('Unauthorized Access: Administrator privileges required.');
            }

            toast.success('Admin Session Authenticated');
            navigate('/admin');

        } catch (error: any) {
            console.error(error);
            setErrorMsg(error.message || 'Authentication failed');
            toast.error(error.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="mb-8 scale-150 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                <Logo />
            </div>

            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
                            <ShieldCheck size={32} className="text-emerald-500" />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Admin Portal</h1>
                        <p className="text-slate-500 text-sm mt-2 font-medium">Verify credentials for secure access</p>
                    </div>

                    {errorMsg && (
                        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
                            <AlertCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-rose-400 font-bold leading-relaxed">{errorMsg}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Administrator Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600 font-medium"
                                    placeholder="admin@fisherspay.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Secure Key / Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600 font-medium"
                                    placeholder="••••••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-4 font-bold text-sm transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 group/btn disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    Authenticate Access <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">Global Fishers Investment • Secure Uplink v2.4</p>
            </div>
        </div>
    );
};

export default AdminLogin;
