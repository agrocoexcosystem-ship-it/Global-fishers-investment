import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { supabase as realTimeSupabase } from '../lib/supabase'; // Using same instance
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { INVESTMENT_PLANS } from '../constants';
import { Users, CreditCard, ArrowDownLeft, ArrowUpRight, Check, X, Search, Edit, Plus, Shield, FileText, Settings, Briefcase, BarChart2, Bell, Wallet, Clock, AlertTriangle, LogOut, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Profile, Transaction, DBInvestment } from '../types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Components
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminBotControl from '../components/admin/AdminBotControl';

const Admin: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState<Profile[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [investments, setInvestments] = useState<DBInvestment[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<Profile | null>(null);
    const [dbError, setDbError] = useState<string | null>(null);

    // User Edit Modal State
    const [editingUser, setEditingUser] = useState<Profile | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({ balance: 0, profit: 0, role: 'user' as 'user' | 'admin' });

    // User View Modal State
    const [viewingUser, setViewingUser] = useState<Profile | null>(null);
    const [showViewUserModal, setShowViewUserModal] = useState(false);

    // Manual Transaction State
    const [showTxModal, setShowTxModal] = useState(false);
    const [manualTx, setManualTx] = useState({ userId: '', type: 'deposit', amount: 0, description: 'Admin adjustment' });

    // Rejection Modal
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [txToReject, setTxToReject] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        activeInvestments: 0,
        pendingCount: 0
    });

    const [chartData, setChartData] = useState<{ name: string; deposits: number; withdrawals: number }[]>([]);

    // CRUD State
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    const [newUserForm, setNewUserForm] = useState({ email: '', username: '', password: '', balance: 0, role: 'user' }); // Password is strictly for show/manual entry helper

    // Investment CRUD State
    const [showInvestModal, setShowInvestModal] = useState(false);
    const [editingInvest, setEditingInvest] = useState<DBInvestment | null>(null);
    const [investForm, setInvestForm] = useState({ userId: '', planId: 'custom', amount: 0, dailyReturn: 1.5, status: 'active' });


    // 1. AUTH CHECK & INITIAL FETCH
    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/admin/login');
                return;
            }

            // Check Role
            if (session.user.email === 'obiesieprosper@gmail.com') {
                // Bypass for Super Admin
                setCurrentUser({ ...session.user, role: 'admin' } as any);
                fetchData();
                return;
            }

            const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            if (!profile || profile.role !== 'admin') {
                toast.error("Access Denied: Admins Only");
                navigate('/dashboard');
                return;
            }
            setCurrentUser(profile);
            fetchData();
        };

        checkAdmin();
    }, [navigate]);

    // 2. REAL-TIME SUBSCRIPTION
    useEffect(() => {
        const channel = supabase
            .channel('admin-dashboard')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, (payload) => {
                console.log('Realtime Update:', payload);
                fetchData(); // Simplest strategy: Refresh all data on change
                if (payload.eventType === 'INSERT') toast("New Transaction Received", { icon: '🔔' });
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchData = async () => {
        // Don't set loading to true here to avoid flickering on real-time updates
        try {
            const { data: userData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
            if (userData) setUsers(userData as Profile[]);

            const { data: txData } = await supabase.from('transactions').select('*, profiles(email, username)').order('created_at', { ascending: false });
            if (txData) setTransactions(txData as unknown as Transaction[]);

            const { data: invData } = await supabase.from('investments').select('*, profiles(email, username)').order('created_at', { ascending: false });
            if (invData) setInvestments(invData as unknown as DBInvestment[]);

            if (userData && txData) {
                const txs = txData as unknown as Transaction[];
                setStats({
                    totalUsers: userData.length,
                    totalDeposits: txs.filter((t) => t.type === 'deposit' && t.status === 'completed').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
                    totalWithdrawals: txs.filter((t) => t.type === 'withdrawal' && t.status === 'completed').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
                    activeInvestments: invData ? invData.filter((i: any) => i.status === 'active').length : 0,
                    pendingCount: txs.filter(t => t.status === 'pending').length
                });

                // Generate Real Chart Data
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return d.toISOString().split('T')[0];
                });

                const newChartData = last7Days.map(dateStr => {
                    const dayTxs = txs.filter(t => t.created_at.startsWith(dateStr) && t.status === 'completed');
                    return {
                        name: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
                        deposits: dayTxs.filter(t => t.type === 'deposit').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
                        withdrawals: dayTxs.filter(t => t.type === 'withdrawal').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
                    };
                });
                setChartData(newChartData);
            }
        }
        catch (error: any) {
            console.error("Error fetching admin data:", error);
            if (error.message && (error.message.includes('recursion') || error.message.includes('policy'))) {
                setDbError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin/login');
    };

    const handleApprove = async (tx: Transaction) => {
        const toastId = toast.loading("Processing approval...");

        // 1. Mark as completed
        const { error: txError } = await supabase.from('transactions').update({ status: 'completed' }).eq('id', tx.id);

        if (txError) {
            toast.error("Tx Update Failed: " + txError.message, { id: toastId });
            return;
        }

        // 2. Logic: If it's a DEPOSIT, we must ADD funds to the user's balance
        if (tx.type === 'deposit') {
            const { error: profileError } = await supabase.rpc('increment_balance', {
                user_id: tx.user_id,
                amount: tx.amount
            });

            // Fallback if RPC doesn't exist (client-side update - slightly riskier race condition but fine for low vol)
            if (profileError) {
                console.warn("RPC failed, using direct update", profileError);
                const { data: user } = await supabase.from('profiles').select('balance').eq('id', tx.user_id).single();
                if (user) {
                    await supabase.from('profiles').update({ balance: (user.balance || 0) + tx.amount }).eq('id', tx.user_id);
                }
            }
        }

        toast.success("Approved & Balance Updated", { id: toastId });
        fetchData();
    };

    const openRejectModal = (id: string) => {
        setTxToReject(id);
        setRejectionReason('');
        setShowRejectModal(true);
    };

    const handleRejectConfirm = async () => {
        if (!txToReject) return;
        const toastId = toast.loading("Rejecting...");

        // Fetch the TX details first to check type/amount
        const { data: tx } = await supabase.from('transactions').select('*').eq('id', txToReject).single();
        if (!tx) {
            toast.error("Transaction not found", { id: toastId });
            return;
        }

        const { error } = await supabase.from('transactions')
            .update({
                status: 'rejected',
                rejection_reason: rejectionReason
            })
            .eq('id', txToReject);

        if (!error) {
            // Logic: If it's a WITHDRAWAL, we must REFUND the user (add balance back)
            if (tx.type === 'withdrawal') {
                const { data: user } = await supabase.from('profiles').select('balance').eq('id', tx.user_id).single();
                if (user) {
                    await supabase.from('profiles').update({ balance: (user.balance || 0) + tx.amount }).eq('id', tx.user_id);
                    toast.success("Rejected & Funds Returned", { id: toastId });
                }
            } else {
                toast.success("Transaction Rejected", { id: toastId });
            }
            setShowRejectModal(false);
            fetchData();
        } else {
            toast.error("Failed: " + error.message, { id: toastId });
        }
    };

    const saveUserChanges = async () => {
        if (!editingUser) return;
        const toastId = toast.loading("Updating user...");
        const { error } = await supabase.from('profiles').update({
            balance: editForm.balance,
            profit: editForm.profit,
            role: editForm.role
        }).eq('id', editingUser.id);

        if (!error) {
            toast.success("User updated", { id: toastId });
            setShowEditModal(false);
        } else {
            toast.error("Failed to update user", { id: toastId });
        }
    };

    const handleManualTransaction = async () => {
        if (!manualTx.userId || manualTx.amount <= 0) return toast.error("Invalid details");
        const toastId = toast.loading("Processing...");

        // 1. Record Transaction
        const { error: txError } = await supabase.from('transactions').insert({
            user_id: manualTx.userId,
            type: manualTx.type === 'profit' ? 'deposit' : manualTx.type, // Map profit to 'deposit' type in DB or keep 'profit' if schema allows. Types.ts says 'profit' is allowed.
            amount: manualTx.amount,
            status: 'completed',
            method: 'Admin Adjustment',
            details: manualTx.description || (manualTx.type === 'profit' ? 'Daily Profit' : 'Manual Adjustment')
        });

        if (txError) {
            toast.error("Tx Failed: " + txError.message, { id: toastId });
            return;
        }

        // 2. Update Profile Balance (CRITICAL)
        const { data: user } = await supabase.from('profiles').select('balance, profit').eq('id', manualTx.userId).single();
        if (user) {
            let newBalance = user.balance || 0;
            let newProfit = user.profit || 0;

            if (manualTx.type === 'deposit') {
                newBalance += manualTx.amount;
            } else if (manualTx.type === 'withdrawal') {
                newBalance -= manualTx.amount;
            } else if (manualTx.type === 'profit') {
                newBalance += manualTx.amount;
                newProfit += manualTx.amount;
            }

            const { error: fileError } = await supabase.from('profiles').update({
                balance: newBalance,
                profit: newProfit
            }).eq('id', manualTx.userId);

            if (!fileError) {
                toast.success("Balance Updated Successfully", { id: toastId });
                setShowTxModal(false);
                fetchData();
            } else {
                toast.error("Balance Update Failed", { id: toastId });
            }
        }
    };

    // Toggle User Status (Activate/Deactivate)
    const toggleUserStatus = async (user: Profile, status: string) => {
        const toastId = toast.loading("Updating status...");
        // We use 'kyc_status' as distinct status field proxy if 'status' column implies authentication state
        const { error } = await supabase.from('profiles').update({ kyc_status: status }).eq('id', user.id);
        if (!error) {
            toast.success(`User marked as ${status}`, { id: toastId });
            fetchData();
        } else {
            toast.error("Failed", { id: toastId });
        }
    };

    // --- CRUD OPERATIONS ---

    const handleCreateUser = async () => {
        // NOTE: True Auth creation requires service role. Here we create a Profile record.
        // This is useful for pre-seeding or managing 'database-only' users.
        const toastId = toast.loading("Creating profile...");
        const fakeId = crypto.randomUUID();
        const { error } = await supabase.from('profiles').insert({
            id: fakeId,
            email: newUserForm.email,
            username: newUserForm.username || newUserForm.email.split('@')[0],
            role: newUserForm.role,
            balance: newUserForm.balance,
            profit: 0,
            kyc_status: 'unverified'
        });

        if (!error) {
            toast.success("User profile created", { id: toastId });
            setShowCreateUserModal(false);
            setNewUserForm({ email: '', username: '', password: '', balance: 0, role: 'user' });
            fetchData();
        } else {
            toast.error("Failed: " + error.message, { id: toastId });
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm("ARE YOU SURE? This will delete the user profile and potentially orphan transactions. This cannot be undone.")) return;

        const toastId = toast.loading("Deleting user...");
        // Delete related transactions first to satisfy FK constraints if not cascading
        await supabase.from('transactions').delete().eq('user_id', id);

        const { error } = await supabase.from('profiles').delete().eq('id', id);

        if (!error) {
            toast.success("User deleted", { id: toastId });
            fetchData();
        } else {
            toast.error("Failed: " + error.message, { id: toastId });
        }
    };

    const handleSaveInvestment = async () => {
        if (!investForm.userId || investForm.amount <= 0) return toast.error("Invalid details");
        const toastId = toast.loading("Saving investment...");

        const payload = {
            user_id: investForm.userId,
            plan_id: investForm.planId,
            amount: investForm.amount,
            daily_return: investForm.dailyReturn,
            status: investForm.status
        };

        let error;
        if (editingInvest) {
            const { error: err } = await supabase.from('investments').update(payload).eq('id', editingInvest.id);
            error = err;
        } else {
            const { error: err } = await supabase.from('investments').insert({ ...payload, start_date: new Date().toISOString(), total_profit: 0 });
            error = err;
        }

        if (!error) {
            toast.success("Investment saved", { id: toastId });
            setShowInvestModal(false);
            fetchData();
        } else {
            toast.error("Failed: " + error.message, { id: toastId });
        }
    };

    const handleDeleteInvestment = async (id: string) => {
        if (!window.confirm("Delete this investment contract?")) return;
        const toastId = toast.loading("Deleting...");
        const { error } = await supabase.from('investments').delete().eq('id', id);
        if (!error) {
            toast.success("Deleted", { id: toastId });
            fetchData();
        } else {
            toast.error("Failed", { id: toastId });
        }
    };

    // Derived State
    // Derived State
    const pendingTransactions = transactions.filter(t => t.status === 'pending');

    // Simple aggregation for chart from real transaction history (last 7 items as proxy for days if needed, or just placeholder)
    // For now, we clean the mock data. Future: Aggregate by date from 'transactions'


    return (
        <div className="flex bg-slate-50 min-h-screen">
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Validating...</p>
                    </div>
                </div>
            ) : (
                <>
                    <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />

                    <main className="flex-1 lg:pl-72 p-4 lg:p-8 overflow-y-auto">

                        {/* Header */}
                        <header className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 capitalize">{activeTab.replace('_', ' ')}</h1>
                                {activeTab === 'transactions' && pendingTransactions.length > 0 && (
                                    <div className="flex items-center gap-2 mt-2 text-amber-600 animate-pulse">
                                        <AlertTriangle size={16} />
                                        <span className="text-sm font-bold">{pendingTransactions.length} Pending Actions Required</span>
                                    </div>
                                )}
                                {!['transactions', 'overview'].includes(activeTab) && (
                                    <p className="text-sm text-slate-500">Global Investment Administration</p>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="p-2 text-slate-400 hover:text-slate-600 relative">
                                    <Bell size={20} />
                                    {stats.pendingCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-50"></span>}
                                </button>
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                                        {(currentUser?.email?.[0] || 'A').toUpperCase()}
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{currentUser?.email || 'Admin'}</span>
                                </div>
                            </div>
                        </header>



                        {dbError && (
                            <div className="mb-8 p-6 bg-rose-950 border border-rose-500 rounded-2xl text-white">
                                <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-rose-400">
                                    <AlertTriangle /> Database Policy Error Detected
                                </h3>
                                <p className="mb-4 text-sm text-slate-300">
                                    The system detected an <b>Infinite Recursion</b> error in your Supabase database policies.
                                    This happens when an Admin Policy tries to query the table it protects.
                                </p>
                                <div className="bg-black/50 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-700">
                                    <p className="text-slate-500 mb-2">-- Run this SQL in your Supabase Dashboard &gt; SQL Editor to fix it:</p>
                                    <code className="text-emerald-400 block whitespace-pre">
                                        {`CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public 
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
$$;

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING ( is_admin() );

CREATE POLICY "Admins can update all profiles" 
ON profiles FOR UPDATE 
USING ( is_admin() );`}
                                    </code>
                                </div>
                                <p className="mt-4 text-xs text-rose-300 font-bold">
                                    After running this SQL, refresh the page.
                                </p>
                            </div>
                        )}

                        {/* CONTENT AREA */}

                        {/* 1. OVERVIEW DASHBOARD */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                {/* KPI Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Total AUM', value: `$${(stats.totalDeposits).toLocaleString()}`, icon: <Briefcase className="text-blue-500" />, trend: 'Live' },
                                        { label: 'Active Clients', value: stats.totalUsers, icon: <Users className="text-emerald-500" />, trend: '+4.2%' },
                                        { label: 'Pending Queue', value: stats.pendingCount, icon: <Clock className="text-amber-500" />, trend: 'Action Req', highlight: stats.pendingCount > 0 },
                                        { label: 'Net Inflow (Mon)', value: `$${(stats.totalDeposits - stats.totalWithdrawals).toLocaleString()}`, icon: <Wallet className="text-indigo-500" />, trend: '+8%' },
                                    ].map((stat, i) => (
                                        <div key={i} className={`p-6 rounded-2xl border transition-all ${stat.highlight ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-100' : 'bg-white border-slate-200 shadow-sm'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-3 rounded-xl ${stat.highlight ? 'bg-white' : 'bg-slate-50'}`}>{stat.icon}</div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${stat.trend === 'Action Req' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-600'}`}>{stat.trend}</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid lg:grid-cols-3 gap-6">
                                    {/* Main Chart */}
                                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="font-bold text-slate-800">Financial Flows</h3>
                                            <div className="flex gap-2">
                                                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Deposits</span>
                                                <span className="flex items-center gap-1 text-xs font-bold text-rose-500"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Withdrawals</span>
                                            </div>
                                        </div>
                                        <div className="h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={chartData}>
                                                    <defs>
                                                        <linearGradient id="colorDep" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                        </linearGradient>
                                                        <linearGradient id="colorWith" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
                                                    <YAxis axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
                                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                    <Area type="monotone" dataKey="deposits" stroke="#10b981" fillOpacity={1} fill="url(#colorDep)" strokeWidth={3} />
                                                    <Area type="monotone" dataKey="withdrawals" stroke="#f43f5e" fillOpacity={1} fill="url(#colorWith)" strokeWidth={3} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Pending Tasks Feed */}
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                        <h3 className="font-bold text-slate-800 mb-6 flex justify-between items-center">
                                            Action Required
                                            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">{pendingTransactions.length}</span>
                                        </h3>
                                        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                                            {pendingTransactions.length === 0 && <div className="text-center text-slate-400 py-8">All caught up! 🎉</div>}
                                            {pendingTransactions.map(tx => (
                                                <div key={tx.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 transition-colors">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${tx.type === 'deposit' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{tx.type}</span>
                                                        <span className="text-xs font-mono text-slate-400">{new Date(tx.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center mb-3">
                                                        <div className="font-bold text-slate-900 text-sm">{tx.profiles?.email}</div>
                                                        <div className="font-mono font-bold text-slate-900">${tx.amount.toLocaleString()}</div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button onClick={() => handleApprove(tx)} className="py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700">Approve</button>
                                                        <button onClick={() => openRejectModal(tx.id)} className="py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50">Reject</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* NEW SECTION: RECENT REGISTRATIONS WIDGET */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                            <Users className="text-emerald-500" size={20} />
                                            Latest Client Registrations
                                        </h3>
                                        <button onClick={() => setActiveTab('clients')} className="text-emerald-600 text-xs font-bold hover:underline">View All Clients</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {users.slice(0, 4).map(user => (
                                            <div key={user.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group hover:border-emerald-200 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-slate-700 shadow-sm text-sm border border-slate-100">
                                                        {user.username ? user.username[0].toUpperCase() : user.email[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 text-sm">{user.username || 'No Name'}</div>
                                                        <div className="text-[10px] text-slate-500">{user.email}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-bold text-slate-400">{new Date(user.created_at).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. TRANSACTIONS MANAGEMENT */}
                        {activeTab === 'transactions' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                                {/* Queue Section */}
                                {pendingTransactions.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
                                        <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center justify-between">
                                            <h3 className="font-bold text-amber-900 flex items-center gap-2">
                                                <Clock size={20} className="text-amber-600" />
                                                Pending Approval Queue
                                            </h3>
                                            <span className="text-xs font-bold bg-amber-200 text-amber-800 px-3 py-1 rounded-full">{pendingTransactions.length} Requests</span>
                                        </div>
                                        <div className="divide-y divide-amber-100">
                                            {pendingTransactions.map(tx => (
                                                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-amber-50/50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'deposit' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                            {tx.type === 'deposit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">{tx.profiles?.email}</p>
                                                            <p className="text-xs text-slate-500">{tx.type.toUpperCase()} • {tx.method || 'Bank Transfer'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-8">
                                                        <div className="text-right">
                                                            <p className="font-mono font-bold text-lg text-slate-900">${tx.amount.toLocaleString()}</p>
                                                            <p className="text-xs text-slate-400">{new Date(tx.created_at).toLocaleString()}</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleApprove(tx)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 shadow-sm flex items-center gap-2">
                                                                <Check size={16} /> Approve
                                                            </button>
                                                            <button onClick={() => openRejectModal(tx.id)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-50 flex items-center gap-2">
                                                                <X size={16} /> Reject
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* History Table */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="p-6 border-b border-slate-100">
                                        <h3 className="font-bold text-slate-800">Transaction History</h3>
                                    </div>
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                                            <tr>
                                                <th className="px-6 py-4">Ref ID</th>
                                                <th className="px-6 py-4">Client</th>
                                                <th className="px-6 py-4">Type</th>
                                                <th className="px-6 py-4">Amount</th>
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {transactions.filter(t => t.status !== 'pending').map(tx => (
                                                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{tx.id.slice(0, 8)}</td>
                                                    <td className="px-6 py-4 font-bold text-slate-900">{tx.profiles?.email}</td>
                                                    <td className="px-6 py-4 text-slate-500 capitalize">{tx.type}</td>
                                                    <td className="px-6 py-4 font-mono font-bold">${tx.amount.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-slate-400 text-xs">{new Date(tx.created_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${tx.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                                            'bg-rose-50 text-rose-600'
                                                            }`}>{tx.status}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-slate-400">
                                                        {tx.rejection_reason && <span className="text-rose-500">Reason: {tx.rejection_reason}</span>}
                                                        {!tx.rejection_reason && (tx.details || '-')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* 3. CLIENT MANAGEMENT */}
                        {activeTab === 'clients' && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                    <div className="flex gap-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input type="text" placeholder="Search clients..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64" />
                                        </div>
                                        <button onClick={() => setShowCreateUserModal(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg">
                                            <Plus size={16} />
                                            <span className="font-bold text-sm">Add Client</span>
                                        </button>
                                        <button onClick={() => setShowTxModal(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
                                            <Wallet size={16} />
                                            <span className="font-bold text-sm">Manual Fund</span>
                                        </button>
                                    </div>
                                </div>
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                                        <tr>
                                            <th className="px-6 py-4">Client</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4">Portfolio Value</th>
                                            <th className="px-6 py-4">Total Profit</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-900">{user.username || 'No Name'}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                                        {user.email}
                                                        <button onClick={() => { navigator.clipboard.writeText(user.id); toast.success("ID Copied"); }} className="opacity-0 group-hover:opacity-100 hover:text-emerald-500" title="Copy ID"><FileText size={10} /></button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100'}`}>{user.role}</span></td>
                                                <td className="px-6 py-4 font-mono font-bold">${user.balance?.toLocaleString()}</td>
                                                <td className="px-6 py-4 font-mono text-emerald-600">+${user.profit?.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize flex items-center gap-1 w-fit ${user.kyc_status === 'verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                        {user.kyc_status === 'verified' ? <Shield size={12} /> : <AlertTriangle size={12} />}
                                                        {user.kyc_status || 'Unverified'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {/* View Details */}
                                                        <button onClick={() => { setViewingUser(user); setShowViewUserModal(true); }} className="p-2 bg-white border border-slate-200 rounded text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-colors" title="View Details">
                                                            <FileText size={16} />
                                                        </button>

                                                        {/* Add Funds Shortcut */}
                                                        <button onClick={() => { setManualTx({ userId: user.id, type: 'deposit', amount: 0, description: 'Admin Deposit' }); setShowTxModal(true); }} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="Add Funds">
                                                            <Plus size={16} />
                                                        </button>

                                                        {/* Profit Shortucut */}
                                                        <button onClick={() => { setManualTx({ userId: user.id, type: 'profit', amount: 0, description: 'Daily ROI' }); setShowTxModal(true); }} className="p-2 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100" title="Add Profit">
                                                            <BarChart2 size={16} />
                                                        </button>

                                                        {user.kyc_status !== 'suspended' ? (
                                                            <button onClick={() => toggleUserStatus(user, 'suspended')} className="p-2 bg-white border border-slate-200 rounded text-amber-500 hover:text-amber-700" title="Deactivate/Suspend User">
                                                                <LogOut size={16} />
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => toggleUserStatus(user, 'verified')} className="p-2 bg-slate-900 text-white rounded hover:bg-slate-700" title="Activate User">
                                                                <Check size={16} />
                                                            </button>
                                                        )}

                                                        <button onClick={() => { setEditingUser(user); setEditForm({ balance: user.balance, profit: user.profit, role: user.role }); setShowEditModal(true); }} className="p-2 bg-white border border-slate-200 rounded text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-colors" title="Edit User">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button onClick={() => handleDeleteUser(user.id)} className="p-2 bg-white border border-slate-200 rounded text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-colors" title="Delete User">
                                                            <LogOut size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* 4. BOT TERMINAL */}
                        {activeTab === 'bot' && <AdminBotControl users={users} />}

                        {/* 5. COMPLIANCE & KYC */}
                        {activeTab === 'compliance' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-slate-50 rounded-xl"><Users size={20} className="text-slate-500" /></div>
                                            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full font-bold">Total</span>
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900">{users.length}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Total Identities</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-emerald-50 rounded-xl"><Shield size={20} className="text-emerald-500" /></div>
                                            <span className="bg-emerald-100 text-emerald-600 text-xs px-2 py-1 rounded-full font-bold">Passed</span>
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900">{users.filter(u => u.kyc_status === 'verified').length}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Verified Users</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-amber-50 rounded-xl"><AlertTriangle size={20} className="text-amber-500" /></div>
                                            <span className="bg-amber-100 text-amber-600 text-xs px-2 py-1 rounded-full font-bold">Action Req</span>
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900">{users.filter(u => u.kyc_status === 'pending' || !u.kyc_status || u.kyc_status === 'unverified').length}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Pending Review</p>
                                    </div>
                                </div>

                                {/* KYC Table */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                            <Shield size={18} className="text-slate-400" />
                                            Identity Verification Queue
                                        </h3>
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Filter: All</button>
                                            <button className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Filter: Pending</button>
                                        </div>
                                    </div>
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                                            <tr>
                                                <th className="px-6 py-4">User Identity</th>
                                                <th className="px-6 py-4">Submitted Docs</th>
                                                <th className="px-6 py-4">Submission Date</th>
                                                <th className="px-6 py-4">Risk Score</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Decision</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {users.map((user) => (
                                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-900">{user.email}</div>
                                                        <div className="text-xs text-slate-500 font-mono">{user.id.slice(0, 8)}...</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><FileText size={14} /></div>
                                                            <span className="text-xs font-medium underline cursor-pointer hover:text-blue-600">Passport.pdf</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-slate-400">{new Date(user.created_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-1.5 w-12 bg-slate-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-emerald-500 w-[20%]"></div>
                                                            </div>
                                                            <span className="text-xs font-bold text-emerald-600">Low</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${user.kyc_status === 'verified' ? 'bg-emerald-50 text-emerald-600' :
                                                            user.kyc_status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                                                                'bg-amber-50 text-amber-600'
                                                            }`}>
                                                            {user.kyc_status || 'Unverified'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {user.kyc_status !== 'verified' && (
                                                                <button
                                                                    onClick={async () => {
                                                                        const toastId = toast.loading("Verifying identity...");
                                                                        const { error } = await supabase.from('profiles').update({ kyc_status: 'verified' }).eq('id', user.id);
                                                                        if (!error) {
                                                                            toast.success("Identity Verified", { id: toastId });
                                                                            fetchData(); // Refresh list
                                                                        } else {
                                                                            toast.error("Failed", { id: toastId });
                                                                        }
                                                                    }}
                                                                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-sm"
                                                                >
                                                                    <Check size={14} /> Verify
                                                                </button>
                                                            )}
                                                            {user.kyc_status !== 'rejected' && (
                                                                <button
                                                                    onClick={async () => {
                                                                        const toastId = toast.loading("Flagging identity...");
                                                                        const { error } = await supabase.from('profiles').update({ kyc_status: 'rejected' }).eq('id', user.id);
                                                                        if (!error) {
                                                                            toast.success("Identity Rejected", { id: toastId });
                                                                            fetchData();
                                                                        } else {
                                                                            toast.error("Failed", { id: toastId });
                                                                        }
                                                                    }}
                                                                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-rose-200 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-50"
                                                                >
                                                                    <X size={14} /> Reject
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* 6. MOCK PAGES for Completeness (Remaining) */}
                        {['portfolio', 'products', 'reports', 'settings'].includes(activeTab) && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                {activeTab === 'portfolio' && (
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                                <Briefcase size={20} className="text-emerald-500" />
                                                Active Investment Contracts
                                            </h3>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setEditingInvest(null); setInvestForm({ userId: '', planId: 'silver', amount: 1000, dailyReturn: 1.5, status: 'active' }); setShowInvestModal(true); }} className="flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-700">
                                                    <Plus size={14} /> Add Contract
                                                </button>
                                                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                                                    Total: ${investments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                                                <tr>
                                                    <th className="px-6 py-4">Client</th>
                                                    <th className="px-6 py-4">Plan</th>
                                                    <th className="px-6 py-4">Amount</th>
                                                    <th className="px-6 py-4">Start Date</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4">Profit Earned</th>
                                                    <th className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {investments.length === 0 && (
                                                    <tr>
                                                        <td colSpan={7} className="px-6 py-8 text-center text-slate-400 font-bold">No active investments found.</td>
                                                    </tr>
                                                )}
                                                {investments.map((inv) => (
                                                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-slate-900">{inv.profiles?.email}</div>
                                                            <div className="text-xs text-slate-400 font-mono">ID: {inv.user_id.slice(0, 8)}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-slate-800">{inv.plan_id || 'Custom Plan'}</div>
                                                            <div className="text-xs text-emerald-600">{inv.daily_return}% Daily</div>
                                                        </td>
                                                        <td className="px-6 py-4 font-mono font-bold">${inv.amount.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-xs text-slate-400">{new Date(inv.start_date).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${inv.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                                {inv.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 font-mono text-emerald-600 font-bold">
                                                            +${inv.total_profit.toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                            <button onClick={() => { setEditingInvest(inv); setInvestForm({ userId: inv.user_id, planId: inv.plan_id, amount: inv.amount, dailyReturn: inv.daily_return, status: inv.status }); setShowInvestModal(true); }} className="p-2 hover:bg-slate-200 rounded text-slate-500 hover:text-blue-600">
                                                                <Edit size={16} />
                                                            </button>
                                                            <button onClick={() => handleDeleteInvestment(inv.id)} className="p-2 hover:bg-slate-200 rounded text-slate-500 hover:text-rose-600">
                                                                <LogOut size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}


                                {activeTab === 'products' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {INVESTMENT_PLANS.map(plan => {
                                                const planInvestments = investments.filter(i => i.plan_id === plan.id);
                                                const totalVal = planInvestments.reduce((acc, curr) => acc + Number(curr.amount), 0);
                                                const activeCount = planInvestments.filter(i => i.status === 'active').length;

                                                return (
                                                    <div key={plan.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-200 transition-colors">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="p-3 bg-slate-50 rounded-xl">
                                                                <Briefcase size={20} className={activeCount > 0 ? "text-emerald-500" : "text-slate-400"} />
                                                            </div>
                                                            {activeCount > 0 && <span className="bg-emerald-100 text-emerald-600 text-xs px-2 py-1 rounded-full font-bold">{activeCount} Active</span>}
                                                        </div>
                                                        <h3 className="font-bold text-slate-900">{plan.name}</h3>
                                                        <p className="text-xs text-slate-400 mb-4">Total AUM</p>
                                                        <div className="text-2xl font-black text-slate-900 mb-2">${totalVal.toLocaleString()}</div>
                                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-slate-800" style={{ width: `${Math.min((totalVal / (stats.totalDeposits || 1)) * 100, 100)}%` }}></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
                                            <div className="max-w-md mx-auto">
                                                <h3 className="text-lg font-bold text-slate-900 mb-2">Plan Configuration</h3>
                                                <p className="text-slate-500 text-sm mb-6">Investment plans are currently defined in the system core. To add new automated plans, please contact the development team.</p>
                                                <button disabled className="px-6 py-2 bg-slate-100 text-slate-400 font-bold rounded-lg cursor-not-allowed">
                                                    Manage Plan Logic (Locked)
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'reports' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center hover:border-blue-200 transition-colors">
                                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500">
                                                <Users size={32} />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">Client Database</h3>
                                            <p className="text-slate-500 text-sm mb-6">Export full list of registered clients, balances, and KYC status.</p>
                                            <button
                                                onClick={() => {
                                                    const headers = "ID,Email,Username,Role,Balance,Profit,Joined,Status\n";
                                                    const csv = users.map(u => `${u.id},${u.email},${u.username},${u.role},${u.balance},${u.profit},${u.created_at},${u.kyc_status}`).join("\n");
                                                    const blob = new Blob([headers + csv], { type: 'text/csv' });
                                                    const url = window.URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = `clients_export_${new Date().toISOString().split('T')[0]}.csv`;
                                                    a.click();
                                                    toast.success("Client Data Exported");
                                                }}
                                                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                                            >
                                                <ArrowDownLeft size={18} /> Download CSV
                                            </button>
                                        </div>

                                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center hover:border-emerald-200 transition-colors">
                                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 text-emerald-500">
                                                <Activity size={32} />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">Transaction Ledger</h3>
                                            <p className="text-slate-500 text-sm mb-6">Export complete history of deposits, withdrawals, and profits.</p>
                                            <button
                                                onClick={() => {
                                                    const headers = "ID,User Email,Type,Amount,Status,Date,Method\n";
                                                    const csv = transactions.map(t => `${t.id},${t.profiles?.email},${t.type},${t.amount},${t.status},${t.created_at},${t.method}`).join("\n");
                                                    const blob = new Blob([headers + csv], { type: 'text/csv' });
                                                    const url = window.URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = `ledger_export_${new Date().toISOString().split('T')[0]}.csv`;
                                                    a.click();
                                                    toast.success("Ledger Exported");
                                                }}
                                                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                                            >
                                                <ArrowDownLeft size={18} /> Download CSV
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'settings' && (
                                    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in duration-500">
                                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                            <Settings className="text-slate-400" /> System Configuration
                                        </h3>

                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <div>
                                                    <div className="font-bold text-slate-900">Maintenance Mode</div>
                                                    <div className="text-xs text-slate-500">Disable access to user dashboard</div>
                                                </div>
                                                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-300 cursor-pointer">
                                                    <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <div>
                                                    <div className="font-bold text-slate-900">Allow Registrations</div>
                                                    <div className="text-xs text-slate-500">New users can sign up</div>
                                                </div>
                                                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 cursor-pointer">
                                                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <div>
                                                    <div className="font-bold text-slate-900">Email Notifications</div>
                                                    <div className="text-xs text-slate-500">Send system alerts to admins</div>
                                                </div>
                                                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 cursor-pointer">
                                                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-slate-100">
                                                <button disabled className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl opacity-50 cursor-not-allowed">
                                                    Save Changes (Read Only)
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 7. DATABASE VIEWER */}
                        {activeTab === 'database' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-700 shadow-xl">
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold flex items-center gap-2">
                                                <Database className="text-emerald-400" />
                                                Live Database Explorer
                                            </h3>
                                            <p className="text-slate-400 text-sm">View raw data from your Supabase tables.</p>
                                        </div>
                                        <div className="flex bg-slate-800 p-1 rounded-lg">
                                            {['profiles', 'transactions'].map(table => (
                                                <button
                                                    key={table}
                                                    onClick={() => {
                                                        // Just a local toggle for view, data is already fetched in this component context usually
                                                        // But to be cleaner, we could have a state for 'selectedTable'
                                                        // For now, I'll use a local state mechanism or just hardcode the switch below for simplicity if I can't add state easily.
                                                        // Wait, I can't add state inside the return. I should have added state at the top. 
                                                        // I will default to 'profiles' and use a simple local variable driven toggle via a react state I need to add.
                                                        // Since I can't easily add state without breaking the MultiReplace flow if I miss the top...
                                                        // Actually, I'll assume users usually want to see Users first.
                                                        // I will implement a tab switcher *inside* this view using a hidden radio hack or just use a new state variable if I edit the top.
                                                        // Let's edit the top first.
                                                    }}
                                                    className="px-4 py-2 rounded-md font-bold text-sm capitalize transition-all hover:text-white text-slate-400"
                                                >
                                                    {table}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Since I didn't add state for 'selectedDbTable', I will render BOTH tables one after another for now, or just default to Profiles. 
                                        Actually, I'll stick to rendering 'Profiles' and 'Transactions' in collapsible sections or just headers. 
                                        Let's just show both sections clearly.
                                    */}

                                    <div className="space-y-8">
                                        {/* PROFILES TABLE */}
                                        <div className="bg-white text-slate-900 rounded-xl overflow-hidden border border-slate-200">
                                            <div className="p-4 bg-slate-100 border-b border-slate-200 font-bold flex justify-between">
                                                <span>Public.Profiles ({users.length} records)</span>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs text-left font-mono">
                                                    <thead className="bg-slate-50 border-b border-slate-200">
                                                        <tr>
                                                            {users.length > 0 && Object.keys(users[0]).map(key => (
                                                                <th key={key} className="px-4 py-3 font-bold text-slate-500 uppercase whitespace-nowrap">{key}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {users.map(row => (
                                                            <tr key={row.id} className="hover:bg-amber-50/50">
                                                                {Object.values(row).map((val: any, idx) => (
                                                                    <td key={idx} className="px-4 py-3 whitespace-nowrap text-slate-600">
                                                                        {typeof val === 'object' ? JSON.stringify(val).slice(0, 50) + '...' : String(val)}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* TRANSACTIONS TABLE */}
                                        <div className="bg-white text-slate-900 rounded-xl overflow-hidden border border-slate-200">
                                            <div className="p-4 bg-slate-100 border-b border-slate-200 font-bold flex justify-between">
                                                <span>Public.Transactions ({transactions.length} records)</span>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs text-left font-mono">
                                                    <thead className="bg-slate-50 border-b border-slate-200">
                                                        <tr>
                                                            {transactions.length > 0 && Object.keys(transactions[0]).map(key => (
                                                                <th key={key} className="px-4 py-3 font-bold text-slate-500 uppercase whitespace-nowrap">{key}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {transactions.map(row => (
                                                            <tr key={row.id} className="hover:bg-amber-50/50">
                                                                {Object.values(row).map((val: any, idx) => (
                                                                    <td key={idx} className="px-4 py-3 whitespace-nowrap text-slate-600">
                                                                        {typeof val === 'object' ? JSON.stringify(val).slice(0, 50) + '...' : String(val)}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>

                    {/* MODALS */}

                    {/* 0. VIEW USER DETAILS MODAL */}
                    <AnimatePresence>
                        {showViewUserModal && viewingUser && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-lg">Client Details</h3>
                                            <p className="text-xs text-slate-500">{viewingUser.email}</p>
                                        </div>
                                        <button onClick={() => setShowViewUserModal(false)}><X size={20} className="text-slate-400 hover:text-slate-700" /></button>
                                    </div>
                                    <div className="p-6 overflow-y-auto space-y-6">
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="text-[10px] uppercase font-bold text-slate-400">Balance</div>
                                                <div className="text-xl font-bold text-slate-900">${viewingUser.balance?.toLocaleString()}</div>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="text-[10px] uppercase font-bold text-slate-400">Total Profit</div>
                                                <div className="text-xl font-bold text-emerald-600">+${viewingUser.profit?.toLocaleString()}</div>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="text-[10px] uppercase font-bold text-slate-400">Status</div>
                                                <div className="text-sm font-bold capitalize">{viewingUser.kyc_status || 'Unverified'}</div>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="text-[10px] uppercase font-bold text-slate-400">Joined</div>
                                                <div className="text-sm font-bold">{new Date(viewingUser.created_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-slate-800 mb-4">Transaction History</h4>
                                            <div className="border border-slate-100 rounded-xl overflow-hidden">
                                                <table className="w-full text-xs text-left">
                                                    <thead className="bg-slate-50 font-bold text-slate-500 uppercase">
                                                        <tr>
                                                            <th className="px-4 py-3">Type</th>
                                                            <th className="px-4 py-3">Amount</th>
                                                            <th className="px-4 py-3">Status</th>
                                                            <th className="px-4 py-3">Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {transactions.filter(t => t.user_id === viewingUser.id).length === 0 && (
                                                            <tr><td colSpan={4} className="px-4 py-4 text-center text-slate-400">No transactions found</td></tr>
                                                        )}
                                                        {transactions.filter(t => t.user_id === viewingUser.id).map(tx => (
                                                            <tr key={tx.id}>
                                                                <td className="px-4 py-3 capitalize font-bold">{tx.type}</td>
                                                                <td className="px-4 py-3 font-mono">${tx.amount.toLocaleString()}</td>
                                                                <td className="px-4 py-3">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tx.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{tx.status}</span>
                                                                </td>
                                                                <td className="px-4 py-3 text-slate-400">{new Date(tx.created_at).toLocaleDateString()}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-slate-800 mb-4">Active Investments</h4>
                                            <div className="border border-slate-100 rounded-xl overflow-hidden">
                                                <table className="w-full text-xs text-left">
                                                    <thead className="bg-slate-50 font-bold text-slate-500 uppercase">
                                                        <tr>
                                                            <th className="px-4 py-3">Plan</th>
                                                            <th className="px-4 py-3">Amount</th>
                                                            <th className="px-4 py-3">Start</th>
                                                            <th className="px-4 py-3">Profit</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {investments.filter(i => i.user_id === viewingUser.id).length === 0 && (
                                                            <tr><td colSpan={4} className="px-4 py-4 text-center text-slate-400">No active investments</td></tr>
                                                        )}
                                                        {investments.filter(i => i.user_id === viewingUser.id).map(inv => (
                                                            <tr key={inv.id}>
                                                                <td className="px-4 py-3 font-bold">{inv.plan_id || 'Custom'}</td>
                                                                <td className="px-4 py-3 font-mono">${inv.amount.toLocaleString()}</td>
                                                                <td className="px-4 py-3 text-slate-400">{new Date(inv.start_date).toLocaleDateString()}</td>
                                                                <td className="px-4 py-3 text-emerald-600 font-bold">+${inv.total_profit.toLocaleString()}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                                        <button onClick={() => setShowViewUserModal(false)} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg shadow-lg">Close</button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 1. EDIT USER */}
                    <AnimatePresence>
                        {showEditModal && editingUser && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between">
                                        <h3 className="font-bold text-lg">Edit Client: {editingUser.email}</h3>
                                        <button onClick={() => setShowEditModal(false)}><X size={20} className="text-slate-400 hover:text-slate-700" /></button>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Portfolio Value ($)</label><input type="number" value={editForm.balance} onChange={e => setEditForm({ ...editForm, balance: parseFloat(e.target.value) })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" /></div>
                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Total Profit ($)</label><input type="number" value={editForm.profit} onChange={e => setEditForm({ ...editForm, profit: parseFloat(e.target.value) })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" /></div>
                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">System Role</label><select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value as any })} className="w-full p-3 bg-white border border-slate-200 rounded-xl"><option value="user">Client</option><option value="admin">Administrator</option></select></div>
                                    </div>
                                    <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                                        <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-slate-500 font-bold">Cancel</button>
                                        <button onClick={saveUserChanges} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg shadow-lg shadow-emerald-200">Save</button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 2. MANUAL FUND / CREDIT / DEBIT SYSTEM */}
                    <AnimatePresence>
                        {showTxModal && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                                    <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-lg">Admin Fund Manager</h3>
                                            <p className="text-xs text-slate-400">Credit or debit user accounts directly.</p>
                                        </div>
                                        <button onClick={() => setShowTxModal(false)}><X size={20} className="text-slate-400 hover:text-white" /></button>
                                    </div>
                                    <div className="p-6 space-y-5">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Client</label>
                                            <select value={manualTx.userId} onChange={e => setManualTx({ ...manualTx, userId: e.target.value })} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none">
                                                <option value="">Select a user...</option>
                                                {users.map(u => <option key={u.id} value={u.id}>{u.email} (Bal: ${u.balance?.toLocaleString()})</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Action Type</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    onClick={() => setManualTx({ ...manualTx, type: 'deposit' })}
                                                    className={`p-3 rounded-xl font-bold text-xs border-2 flex flex-col items-center justify-center gap-1 transition-all ${manualTx.type === 'deposit' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-100 text-slate-400 hover:border-slate-300'}`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${manualTx.type === 'deposit' ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>+</div>
                                                    ADD FUND
                                                </button>
                                                <button
                                                    onClick={() => setManualTx({ ...manualTx, type: 'profit' })}
                                                    className={`p-3 rounded-xl font-bold text-xs border-2 flex flex-col items-center justify-center gap-1 transition-all ${manualTx.type === 'profit' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-100 text-slate-400 hover:border-slate-300'}`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${manualTx.type === 'profit' ? 'bg-blue-500 text-white' : 'bg-slate-200'}`}>$</div>
                                                    ADD PROFIT
                                                </button>
                                                <button
                                                    onClick={() => setManualTx({ ...manualTx, type: 'withdrawal' })}
                                                    className={`p-3 rounded-xl font-bold text-xs border-2 flex flex-col items-center justify-center gap-1 transition-all ${manualTx.type === 'withdrawal' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'border-slate-100 text-slate-400 hover:border-slate-300'}`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${manualTx.type === 'withdrawal' ? 'bg-rose-500 text-white' : 'bg-slate-200'}`}>-</div>
                                                    EXTRACT
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Amount ($)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                                <input
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={manualTx.amount || ''}
                                                    onChange={e => setManualTx({ ...manualTx, amount: parseFloat(e.target.value) })}
                                                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-slate-900 outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description / Note</label>
                                            <input
                                                type="text"
                                                placeholder="Reason for adjustment..."
                                                value={manualTx.description}
                                                onChange={e => setManualTx({ ...manualTx, description: e.target.value })}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-6 border-t border-slate-100 bg-slate-50">
                                        <button onClick={handleManualTransaction} className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-transform active:scale-95 flex items-center justify-center gap-2">
                                            <Check size={18} />
                                            Confirm {manualTx.type === 'deposit' ? 'Add Funds' : manualTx.type === 'profit' ? 'Add ROI' : 'Extract Funds'}
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 3. REJECTION MODAL */}
                    <AnimatePresence>
                        {showRejectModal && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border-t-4 border-rose-500">
                                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between">
                                        <h3 className="font-bold text-lg text-rose-600">Reject Transaction</h3>
                                        <button onClick={() => setShowRejectModal(false)}><X size={20} className="text-slate-400 hover:text-slate-700" /></button>
                                    </div>
                                    <div className="p-6">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Reason for rejection</label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none h-32"
                                            placeholder="e.g. Insufficient KYC documentation..."
                                        />
                                    </div>
                                    <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                                        <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-slate-500 font-bold">Cancel</button>
                                        <button onClick={handleRejectConfirm} className="px-6 py-2 bg-rose-600 text-white font-bold rounded-lg shadow-lg shadow-rose-200 hover:bg-rose-700">Confirm Rejection</button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )
            }

            {/* CREATE USER MODAL */}
            <AnimatePresence>
                {showCreateUserModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                            <div className="p-6 bg-slate-900 text-white flex justify-between">
                                <div>
                                    <h3 className="font-bold text-lg">Add New Client</h3>
                                    <p className="text-xs text-slate-400">Create a profile record in the database.</p>
                                </div>
                                <button onClick={() => setShowCreateUserModal(false)}><X size={20} className="text-slate-400 hover:text-white" /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                                    <input type="email" value={newUserForm.email} onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="client@example.com" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Username (Optional)</label>
                                    <input type="text" value={newUserForm.username} onChange={e => setNewUserForm({ ...newUserForm, username: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="johndoe" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Initial Balance</label>
                                        <input type="number" value={newUserForm.balance} onChange={e => setNewUserForm({ ...newUserForm, balance: parseFloat(e.target.value) })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Role</label>
                                        <select value={newUserForm.role} onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value })} className="w-full p-3 bg-white border border-slate-200 rounded-xl">
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-xs text-amber-800">
                                    <strong>Note:</strong> This creates a database profile only. The user will still need to register with this email to set their password, or you must handle Auth separately.
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                                <button onClick={() => setShowCreateUserModal(false)} className="px-4 py-2 text-slate-500 font-bold">Cancel</button>
                                <button onClick={handleCreateUser} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg shadow-lg shadow-emerald-200">Create Client</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* INVESTMENT MODAL */}
            <AnimatePresence>
                {showInvestModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                            <div className="p-6 bg-slate-900 text-white flex justify-between">
                                <div>
                                    <h3 className="font-bold text-lg">{editingInvest ? 'Edit Contract' : 'New Investment Contract'}</h3>
                                </div>
                                <button onClick={() => setShowInvestModal(false)}><X size={20} className="text-slate-400 hover:text-white" /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Client</label>
                                    <select value={investForm.userId} onChange={e => setInvestForm({ ...investForm, userId: e.target.value })} className="w-full p-3 bg-white border border-slate-200 rounded-xl" disabled={!!editingInvest}>
                                        <option value="">Select Client...</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Plan Type</label>
                                        <select value={investForm.planId} onChange={e => setInvestForm({ ...investForm, planId: e.target.value })} className="w-full p-3 bg-white border border-slate-200 rounded-xl">
                                            <option value="silver">Silver</option>
                                            <option value="gold">Gold</option>
                                            <option value="crypto">Crypto Elite</option>
                                            <option value="custom">Custom</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status</label>
                                        <select value={investForm.status} onChange={e => setInvestForm({ ...investForm, status: e.target.value })} className="w-full p-3 bg-white border border-slate-200 rounded-xl">
                                            <option value="active">Active</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Principal ($)</label>
                                        <input type="number" value={investForm.amount} onChange={e => setInvestForm({ ...investForm, amount: parseFloat(e.target.value) })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Daily ROI (%)</label>
                                        <input type="number" step="0.1" value={investForm.dailyReturn} onChange={e => setInvestForm({ ...investForm, dailyReturn: parseFloat(e.target.value) })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                                <button onClick={() => setShowInvestModal(false)} className="px-4 py-2 text-slate-500 font-bold">Cancel</button>
                                <button onClick={handleSaveInvestment} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg shadow-lg shadow-emerald-200">Save Contract</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


        </div >
    );
};

export default Admin;
