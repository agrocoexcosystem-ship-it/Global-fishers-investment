import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Briefcase, Plus, Trash2, Edit, Save, X, Check, TrendingUp } from 'lucide-react';
import { DBInvestment, InvestmentPlan } from '../../types';
import toast from 'react-hot-toast';
import { INVESTMENT_PLANS } from '../../constants';

const AdminInvestments: React.FC = () => {
    const [investments, setInvestments] = useState<DBInvestment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        user_id: '',
        plan_id: 'custom',
        amount: 0,
        daily_return: 1.5,
        status: 'active'
    });

    useEffect(() => {
        fetchInvestments();
    }, []);

    const fetchInvestments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('investments')
            .select('*, profiles(email, username)')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setInvestments(data as unknown as DBInvestment[]);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!formData.user_id || formData.amount <= 0) return toast.error("Invalid details");

        const toastId = toast.loading("Creating investment...");

        // Calculate end date based on plan (default 30 days for custom)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 30);

        const { error } = await supabase.from('investments').insert({
            user_id: formData.user_id,
            plan_id: formData.plan_id,
            amount: formData.amount,
            daily_return: formData.daily_return,
            status: formData.status,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            total_profit: 0
        });

        if (!error) {
            toast.success("Investment Created", { id: toastId });
            setShowModal(false);
            fetchInvestments();
            setFormData({ user_id: '', plan_id: 'custom', amount: 0, daily_return: 1.5, status: 'active' });
        } else {
            toast.error(error.message, { id: toastId });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will delete the investment record.")) return;
        const { error } = await supabase.from('investments').delete().eq('id', id);
        if (!error) {
            toast.success("Deleted");
            fetchInvestments();
        } else {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm animate-in fade-in duration-500">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Briefcase size={20} className="text-emerald-600" />
                    Active Investment Portfolios
                </h3>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                    <Plus size={16} /> <span className="text-sm font-bold">New Contract</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Client</th>
                            <th className="px-6 py-4">Plan / ROI</th>
                            <th className="px-6 py-4">Capital</th>
                            <th className="px-6 py-4">Progress</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading && <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading...</td></tr>}
                        {!loading && investments.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-400">No active investments found.</td></tr>}

                        {investments.map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900">{inv.profiles?.email}</div>
                                    <div className="text-xs text-slate-400">{inv.profiles?.username}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
                                            <TrendingUp size={14} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-700 capitalize">{inv.plan_id}</div>
                                            <div className="text-xs text-emerald-600 font-bold">{inv.daily_return}% Daily</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono font-bold text-slate-900">
                                    ${inv.amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1">
                                        <div
                                            className="bg-emerald-500 h-1.5 rounded-full"
                                            style={{
                                                width: `${Math.min(100, Math.max(0, ((new Date().getTime() - new Date(inv.start_date).getTime()) / (new Date(inv.end_date).getTime() - new Date(inv.start_date).getTime())) * 100))}%`
                                            }}
                                        ></div>
                                    </div>
                                    <span className="text-[10px] text-slate-400">
                                        Day {Math.max(1, Math.floor((new Date().getTime() - new Date(inv.start_date).getTime()) / (1000 * 60 * 60 * 24)))} of {Math.ceil((new Date(inv.end_date).getTime() - new Date(inv.start_date).getTime()) / (1000 * 60 * 60 * 24))}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${inv.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(inv.id)} className="p-2 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
                        <h3 className="font-bold text-lg mb-4">Create Manual Investment</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">User ID</label>
                                <input
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    placeholder="UUID..."
                                    value={formData.user_id}
                                    onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Daily ROI %</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                                        value={formData.daily_return}
                                        onChange={e => setFormData({ ...formData, daily_return: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl">Cancel</button>
                                <button onClick={handleSave} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200">Create</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminInvestments;
