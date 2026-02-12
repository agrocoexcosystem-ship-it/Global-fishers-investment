import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BadgeDollarSign, Wallet, ArrowRightLeft, UserCheck, Search, CheckCircle, AlertOctagon } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminFinancials: React.FC = () => {
    const [userId, setUserId] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('deposit');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [userPreview, setUserPreview] = useState<any>(null);

    const checkUser = async () => {
        if (!userId) return;
        const { data } = await supabase.from('profiles').select('email, balance, username').eq('id', userId).single();
        if (data) {
            setUserPreview(data);
            toast.success("User Found: " + data.email);
        } else {
            toast.error("User ID Not Found");
            setUserPreview(null);
        }
    };

    const handleTransaction = async () => {
        if (!userId || !amount) return toast.error("Missing fields");
        if (Number(amount) <= 0) return toast.error("Invalid amount");

        setLoading(true);
        const toastId = toast.loading("Processing...");

        try {
            // 1. Log Transaction
            const { error: txError } = await supabase.from('transactions').insert({
                user_id: userId,
                type: type === 'bonus' ? 'bonus' : type === 'penalty' ? 'withdrawal' : type,
                amount: Number(amount),
                status: 'completed',
                method: 'Admin Manual Adjustment',
                details: description || `Manual ${type.toUpperCase()}`
            });

            if (txError) throw txError;

            // 2. Update Balance
            const { data: user } = await supabase.from('profiles').select('balance').eq('id', userId).single();
            if (!user) throw new Error("User profile missing");

            let newBalance = user.balance || 0;
            if (['deposit', 'bonus', 'profit'].includes(type)) {
                newBalance += Number(amount);
            } else {
                newBalance -= Number(amount);
            }

            const { error: balError } = await supabase.from('profiles').update({ balance: newBalance }).eq('id', userId);
            if (balError) throw balError;

            // 3. Audit Log
            await supabase.from('admin_audit_logs').insert({
                action_type: 'MANUAL_FINANCE',
                target_resource: `user:${userId}`,
                details: { amount, type, description },
                admin_id: (await supabase.auth.getUser()).data.user?.id
            });

            toast.success("Adjustment Successful", { id: toastId });
            setAmount('');
            setDescription('');
        } catch (err: any) {
            toast.error("Failed: " + err.message, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <BadgeDollarSign className="text-emerald-600" />
                    Manual Financial Adjustment
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        {/* User Selector */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target User ID (UUID)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="e.g. 5d53a9..."
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    onBlur={checkUser}
                                />
                                <button onClick={checkUser} className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 text-slate-600 transition-colors"><Search size={20} /></button>
                            </div>
                            {userPreview && (
                                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-3 animate-in fade-in">
                                    <UserCheck size={16} className="text-emerald-600" />
                                    <div>
                                        <p className="font-bold text-emerald-800 text-sm">{userPreview.email}</p>
                                        <p className="text-xs text-emerald-600">Current Balance: ${userPreview.balance.toLocaleString()}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Amount & Type */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Adjustment Type</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    <option value="deposit">Credit Deposit (+)</option>
                                    <option value="profit">Credit Profit (+)</option>
                                    <option value="bonus">Credit Bonus (+)</option>
                                    <option value="withdrawal">Debit Balance (-)</option>
                                    <option value="penalty">Penalty Fine (-)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Amount ($)</label>
                                <input
                                    type="number"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Internal Note / Reason</label>
                            <textarea
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-24"
                                placeholder="Reason for adjustment..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                        </div>

                        <button
                            disabled={loading || !userId}
                            onClick={handleTransaction}
                            className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : 'Execute Adjustment'}
                        </button>
                    </div>

                    {/* Guidelines Panel */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><CheckCircle size={18} className="text-emerald-500" /> Operational Validation</h3>
                        <ul className="space-y-4 text-sm text-slate-600">
                            <li className="flex gap-2 items-start">
                                <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-slate-300"></div>
                                Ensure the User ID matches exactly. Copy it from the Users tab.
                            </li>
                            <li className="flex gap-2 items-start">
                                <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-slate-300"></div>
                                <b>Credit Deposit</b> will appear as an external deposit in the user's history.
                            </li>
                            <li className="flex gap-2 items-start">
                                <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-slate-300"></div>
                                <b>Debit Balance</b> is irreversible without a new transaction. Only use for corrections.
                            </li>
                            <li className="flex gap-2 items-start">
                                <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-slate-300"></div>
                                All manual adjustments are logged in the <b>Audit Trail</b> with your Admin ID.
                            </li>
                        </ul>

                        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-800 text-xs">
                            <AlertOctagon size={24} className="shrink-0" />
                            <p>Funds will be immediately available in the user's account. This action bypasses standard blockchain confirmation checks.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminFinancials;
