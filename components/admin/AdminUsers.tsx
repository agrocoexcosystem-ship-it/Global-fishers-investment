import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Filter, User, CreditCard, Shield, AlertTriangle, FileText, MoreVertical, Edit, Lock, Unlock, Trash, Trash2, CheckCircle, Wallet, Ban, X } from 'lucide-react';
import { Profile, Transaction, AdminNote } from '../../types';
import toast from 'react-hot-toast';

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // User Detail State
    const [userTxs, setUserTxs] = useState<Transaction[]>([]);
    const [adminNotes, setAdminNotes] = useState<AdminNote[]>([]);
    const [newNote, setNewNote] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [searchTerm]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (searchTerm) query = query.ilike('email', `%${searchTerm}%`);

            const { data, error } = await query;
            if (error) throw error;
            setUsers(data as Profile[]);
        } catch (err: any) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const openUserDetail = async (user: Profile) => {
        setSelectedUser(user);
        setShowDetailModal(true);
        // Fetch specific user data
        const { data: txs } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
        if (txs) setUserTxs(txs as Transaction[]);

        const { data: notes } = await supabase.from('admin_notes').select('*, profiles(email)').eq('target_user_id', user.id).order('created_at', { ascending: false });
        if (notes) setAdminNotes(notes as unknown as AdminNote[]);
    };

    const handleAddNote = async () => {
        if (!newNote.trim() || !selectedUser) return;

        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase.from('admin_notes').insert({
            target_user_id: selectedUser.id,
            admin_id: user?.id,
            note: newNote,
            is_private: true
        });

        if (!error) {
            toast.success("Note added");
            setNewNote('');
            // Refresh notes
            const { data: notes } = await supabase.from('admin_notes').select('*, profiles(email)').eq('target_user_id', selectedUser.id).order('created_at', { ascending: false });
            if (notes) setAdminNotes(notes as unknown as AdminNote[]);
        } else {
            toast.error("Failed to add note");
        }
    };

    const toggleFreeze = async () => {
        if (!selectedUser) return;
        const newStatus = !selectedUser.is_frozen;

        const { error } = await supabase.from('profiles').update({ is_frozen: newStatus }).eq('id', selectedUser.id);

        if (!error) {
            toast.success(newStatus ? "User Frozen" : "User Unfrozen");
            setSelectedUser({ ...selectedUser, is_frozen: newStatus });
            fetchUsers(); // Refresh list
        } else {
            toast.error("Action failed");
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser || !window.confirm("Permanent Action: Delete this user and all data?")) return;

        const { error } = await supabase.from('profiles').delete().eq('id', selectedUser.id);
        if (!error) {
            toast.success("User deleted");
            setShowDetailModal(false);
            fetchUsers();
        } else {
            toast.error("Delete failed: " + error.message);
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
                        placeholder="Search users..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* User Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {users.map(user => (
                    <div key={user.id} onClick={() => openUserDetail(user)} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group relative overflow-hidden">
                        {user.is_frozen && <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl z-10">Frozen</div>}

                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 text-xl border border-slate-200 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 truncate max-w-[150px] group-hover:text-emerald-700 transition-colors">{user.username || 'No Name'}</h3>
                                <p className="text-xs text-slate-400 truncate max-w-[150px]">{user.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Balance</p>
                                <p className="font-mono font-bold text-slate-900">${user.balance.toLocaleString()}</p>
                            </div>
                            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">Profit</p>
                                <p className="font-mono font-bold text-emerald-700">+${user.profit.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                            <span className={`px-2 py-1 rounded-full font-bold flex items-center gap-1 ${user.kyc_status === 'verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                {user.kyc_status === 'verified' ? <Shield size={12} /> : <AlertTriangle size={12} />}
                                {user.kyc_status || 'Unverified'}
                            </span>
                            <span className="text-slate-400">{new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-50 w-full max-w-5xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-white p-6 border-b border-slate-200 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-slate-200">
                                    {selectedUser.username?.[0]?.toUpperCase() || selectedUser.email[0].toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                        {selectedUser.username || 'No Name'}
                                        {selectedUser.is_frozen && <span className="text-xs bg-rose-500 text-white px-2 py-1 rounded-md">FROZEN</span>}
                                    </h2>
                                    <p className="text-slate-500 text-sm font-mono flex items-center gap-2">
                                        {selectedUser.email}
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        ID: {selectedUser.id}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                                <X size={24} className="text-slate-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                            {/* Left Column: Stats & Financials */}
                            <div className="flex-1 p-8 overflow-y-auto space-y-8">
                                {/* Financial Overview */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Wallet size={20} /></div>
                                            <span className="text-xs font-bold text-slate-400 uppercase">Total Balance</span>
                                        </div>
                                        <p className="text-3xl font-black text-slate-900">${selectedUser.balance.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><CreditCard size={20} /></div>
                                            <span className="text-xs font-bold text-slate-400 uppercase">Total Profit</span>
                                        </div>
                                        <p className="text-3xl font-black text-slate-900">+${selectedUser.profit.toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Transaction History */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="p-4 border-b border-slate-100 font-bold text-slate-800">Recent Transactions</div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase">
                                                <tr>
                                                    <th className="px-4 py-2">Type</th>
                                                    <th className="px-4 py-2">Amount</th>
                                                    <th className="px-4 py-2">Status</th>
                                                    <th className="px-4 py-2">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {userTxs.map(tx => (
                                                    <tr key={tx.id}>
                                                        <td className="px-4 py-3 capitalize font-medium text-slate-700">{tx.type}</td>
                                                        <td className="px-4 py-3 font-mono font-bold">${tx.amount.toLocaleString()}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${tx.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{tx.status}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-slate-400">{new Date(tx.created_at).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Intelligence & Controls */}
                            <div className="w-full lg:w-96 bg-white border-l border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto">
                                {/* Action Center */}
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Shield size={18} /> Administrative Actions</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={toggleFreeze} className={`p-3 rounded-xl border font-bold text-sm transition-all flex flex-col items-center gap-2 ${selectedUser.is_frozen ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
                                            {selectedUser.is_frozen ? <Unlock size={20} /> : <Lock size={20} />}
                                            {selectedUser.is_frozen ? 'Unfreeze Account' : 'Freeze Account'}
                                        </button>
                                        <button onClick={handleDeleteUser} className="p-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-rose-600 hover:text-white transition-all flex flex-col items-center gap-2 group">
                                            <Trash2 size={20} className="group-hover:animate-bounce" />
                                            Delete User
                                        </button>
                                    </div>
                                </div>

                                {/* Risk Assessment */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <h4 className="font-bold text-slate-800 text-sm mb-3">Risk Assessment</h4>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-slate-500">Risk Score</span>
                                        <span className="font-bold text-emerald-600">Low (12/100)</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
                                        <div className="bg-emerald-500 h-2 rounded-full w-[12%]"></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-slate-600"><CheckCircle size={14} className="text-emerald-500" /> Email Verified</div>
                                        <div className="flex items-center gap-2 text-xs text-slate-600"><AlertTriangle size={14} className="text-amber-500" /> KYC Pending</div>
                                    </div>
                                </div>

                                {/* Admin Notes */}
                                <div className="flex-1 flex flex-col">
                                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><FileText size={18} /> Internal Notes</h3>
                                    <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-4 mb-4 overflow-y-auto max-h-[300px] space-y-3">
                                        {adminNotes.length === 0 && <p className="text-center text-xs text-slate-400 italic">No notes yet.</p>}
                                        {adminNotes.map(note => (
                                            <div key={note.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                                <p className="text-xs text-slate-700 mb-2">{note.note}</p>
                                                <div className="flex justify-between items-center text-[10px] text-slate-400">
                                                    <span>{note.admin_profile?.email || 'Admin'}</span>
                                                    <span>{new Date(note.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <textarea
                                            className="w-full p-3 pr-10 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-24"
                                            placeholder="Add a private note..."
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                        ></textarea>
                                        <button onClick={handleAddNote} className="absolute bottom-3 right-3 p-2 bg-slate-900 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                                            <Edit size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
