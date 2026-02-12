import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, Check, X, Eye, FileText, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Transaction } from '../../types';
import toast from 'react-hot-toast';

const AdminTransactions: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    // Pagination
    const [page, setPage] = useState(1);
    const limit = 10;
    const [total, setTotal] = useState(0);

    // Modal State
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [reason, setReason] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, [page, statusFilter, typeFilter, searchTerm]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('transactions')
                .select('*, profiles!inner(email, username)', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range((page - 1) * limit, page * limit - 1);

            if (statusFilter !== 'all') query = query.eq('status', statusFilter);
            if (typeFilter !== 'all') query = query.eq('type', typeFilter);
            if (searchTerm) query = query.ilike('profiles.email', `%${searchTerm}%`);

            const { data, count, error } = await query;

            if (error) throw error;

            // Cast data to Transaction type (Supabase join result needs mapping)
            const mappedData = data?.map((t: any) => ({
                ...t,
                profiles: t.profiles // Ensure nested profile data is preserved
            })) || [];

            setTransactions(mappedData);
            setTotal(count || 0);
        } catch (err: any) {
            toast.error("Failed to load transactions");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (tx: Transaction) => {
        const toastId = toast.loading("Processing approval...");

        try {
            // 1. Update Transaction Status
            const { error: txError } = await supabase
                .from('transactions')
                .update({ status: 'completed' })
                .eq('id', tx.id);

            if (txError) throw txError;

            // 2. Update User Balance (if Deposit)
            if (tx.type === 'deposit') {
                const { error: rpcError } = await supabase.rpc('increment_balance', {
                    user_id: tx.user_id,
                    amount: tx.amount
                });

                if (rpcError) {
                    // Fallback
                    const { data: user } = await supabase.from('profiles').select('balance').eq('id', tx.user_id).single();
                    if (user) {
                        await supabase.from('profiles').update({ balance: (user.balance || 0) + tx.amount }).eq('id', tx.user_id);
                    }
                }
            }

            toast.success("Transaction Approved", { id: toastId });
            fetchTransactions();
        } catch (err: any) {
            toast.error(err.message, { id: toastId });
        }
    };

    const handleReject = async () => {
        if (!rejectId) return;
        const toastId = toast.loading("Rejecting...");

        try {
            // Get TX details for refund logic
            const tx = transactions.find(t => t.id === rejectId);

            const { error } = await supabase
                .from('transactions')
                .update({
                    status: 'rejected',
                    rejection_reason: reason
                })
                .eq('id', rejectId);

            if (error) throw error;

            // Refund if Withdrawal
            if (tx?.type === 'withdrawal') {
                const { error: rpcError } = await supabase.rpc('increment_balance', {
                    user_id: tx.user_id,
                    amount: tx.amount
                });
                if (rpcError) {
                    // Fallback
                    const { data: user } = await supabase.from('profiles').select('balance').eq('id', tx.user_id).single();
                    if (user) {
                        await supabase.from('profiles').update({ balance: (user.balance || 0) + tx.amount }).eq('id', tx.user_id);
                    }
                }
            }

            toast.success("Transaction Rejected", { id: toastId });
            setRejectId(null);
            setReason('');
            fetchTransactions();
        } catch (err: any) {
            toast.error(err.message, { id: toastId });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4 items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by user email..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="deposit">Deposits</option>
                        <option value="withdrawal">Withdrawals</option>
                        <option value="profit">Profit</option>
                        <option value="investment">Investments</option>
                    </select>

                    <select
                        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Transaction</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading transactions...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-400">No transactions found</td></tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'deposit' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                    {tx.type === 'deposit' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 capitalize">{tx.type}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">#{tx.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-700">{tx.profiles?.email}</div>
                                            <div className="text-[10px] text-slate-400">{tx.profiles?.username}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-slate-900">
                                            ${tx.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${tx.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                                    tx.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                                        'bg-rose-50 text-rose-600'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                                            {new Date(tx.created_at).toLocaleDateString()}
                                            <span className="block text-[10px] text-slate-400">{new Date(tx.created_at).toLocaleTimeString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {tx.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(tx)}
                                                            className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                            title="Approve"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setRejectId(tx.id)}
                                                            className="p-1.5 bg-rose-50 text-rose-600 rounded hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                            title="Reject"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                <button className="p-1.5 bg-slate-50 text-slate-400 rounded hover:bg-slate-200 transition-all">
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                    <span className="text-xs font-bold text-slate-400">
                        Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} of {total}
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            disabled={page * limit >= total}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {rejectId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="text-rose-500" />
                            Reject Transaction
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">Please provide a reason for this rejection. This will be visible to the user.</p>
                        <textarea
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[100px] text-sm font-medium mb-6 resize-none"
                            placeholder="e.g. Insufficient identification details..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        ></textarea>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setRejectId(null); setReason(''); }}
                                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTransactions;
