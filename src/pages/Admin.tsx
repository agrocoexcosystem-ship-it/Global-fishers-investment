import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { 
  Users, Wallet, ArrowUpCircle, ArrowDownCircle, 
  Settings, CheckCircle, XCircle, Search, Edit2, 
  Save, X, LayoutDashboard, RefreshCcw, TrendingUp,
  Euro
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  balance: number;
  profit: number;
  role: string;
  created_at: string;
}

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  currency?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'users' | 'transactions' | 'settings'>('users');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [editForm, setEditForm] = useState({ balance: 0, profit: 0, role: 'user' });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/dashboard');
      return;
    }
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, authLoading]);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false });

      if (profilesData) setProfiles(profilesData);
      if (transactionsData) setTransactions(transactionsData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateProfile = async () => {
    if (!editingProfile) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          balance: editForm.balance,
          profit: editForm.profit,
          role: editForm.role
        })
        .eq('id', editingProfile.id);

      if (error) throw error;
      
      toast.success('Profile updated successfully');
      setEditingProfile(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleTransactionStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Transaction ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update transaction');
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
              <LayoutDashboard className="text-emerald-400" size={36} />
              ADMIN <span className="text-emerald-400 italic font-serif">PANEL</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">
              Global Fishers Institutional Control Center
            </p>
          </div>
          
          <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800">
            {(['users', 'transactions', 'settings'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                  ${activeTab === tab ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-emerald-400" size={20} />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Users</span>
            </div>
            <div className="text-3xl font-black">{profiles.length}</div>
          </div>
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="text-blue-400" size={20} />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Assets</span>
            </div>
            <div className="text-3xl font-black">€{profiles.reduce((acc, p) => acc + (p.balance || 0), 0).toLocaleString()}</div>
          </div>
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-green-400" size={20} />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Profit</span>
            </div>
            <div className="text-3xl font-black">€{profiles.reduce((acc, p) => acc + (p.profit || 0), 0).toLocaleString()}</div>
          </div>
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCcw className="text-amber-400" size={20} />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pending Tx</span>
            </div>
            <div className="text-3xl font-black">{transactions.filter(t => t.status === 'pending').length}</div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="glass-effect-dark border border-slate-800 rounded-[2.5rem] overflow-hidden">
          {activeTab === 'users' && (
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <h2 className="text-2xl font-black tracking-tight">User Management</h2>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-6 py-3 bg-slate-800/50 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-full md:w-80"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-800">
                      <th className="pb-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">User</th>
                      <th className="pb-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Role</th>
                      <th className="pb-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Balance</th>
                      <th className="pb-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Profit</th>
                      <th className="pb-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Joined</th>
                      <th className="pb-4 font-bold text-slate-500 uppercase tracking-widest text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredProfiles.map(profile => (
                      <tr key={profile.id} className="group hover:bg-slate-800/20 transition-colors">
                        <td className="py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400">
                              {profile.full_name?.[0] || profile.email?.[0]}
                            </div>
                            <div>
                              <div className="font-bold text-white">{profile.full_name || 'Unnamed'}</div>
                              <div className="text-xs text-slate-500">{profile.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                            ${profile.role === 'admin' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-400'}`}>
                            {profile.role}
                          </span>
                        </td>
                        <td className="py-6 font-mono font-bold">€{profile.balance?.toLocaleString() || '0'}</td>
                        <td className="py-6 font-mono font-bold text-emerald-400">€{profile.profit?.toLocaleString() || '0'}</td>
                        <td className="py-6 text-xs text-slate-500">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-6 text-right">
                          <button 
                            onClick={() => {
                              setEditingProfile(profile);
                              setEditForm({ balance: profile.balance || 0, profit: profile.profit || 0, role: profile.role || 'user' });
                            }}
                            className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="p-8">
              <h2 className="text-2xl font-black tracking-tight mb-8">Recent Transactions</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-800">
                      <th className="pb-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">User</th>
                      <th className="pb-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Type</th>
                      <th className="pb-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Amount</th>
                      <th className="pb-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Status</th>
                      <th className="pb-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Date</th>
                      <th className="pb-4 font-bold text-slate-500 uppercase tracking-widest text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="group hover:bg-slate-800/20 transition-colors">
                        <td className="py-6">
                          <div>
                            <div className="font-bold text-white">{tx.profiles?.full_name || 'Investor'}</div>
                            <div className="text-xs text-slate-500">{tx.profiles?.email}</div>
                          </div>
                        </td>
                        <td className="py-6">
                          <div className="flex items-center gap-2">
                            {tx.type === 'deposit' ? <ArrowDownCircle size={16} className="text-emerald-400" /> : <ArrowUpCircle size={16} className="text-amber-400" />}
                            <span className="text-xs font-black uppercase tracking-widest">{tx.type}</span>
                          </div>
                        </td>
                        <td className="py-6 font-mono font-bold">€{tx.amount.toLocaleString()}</td>
                        <td className="py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                            ${tx.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                              tx.status === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 
                              'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-6 text-xs text-slate-500">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-6 text-right">
                          {tx.status === 'pending' && (
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleTransactionStatus(tx.id, 'approved')}
                                className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                              >
                                <CheckCircle size={20} />
                              </button>
                              <button 
                                onClick={() => handleTransactionStatus(tx.id, 'rejected')}
                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <XCircle size={20} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-8">
              <h2 className="text-2xl font-black tracking-tight mb-8">Platform Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-3 mb-6">
                    <Wallet className="text-emerald-400" size={24} />
                    <h3 className="text-lg font-bold">Deposit Wallets</h3>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Bitcoin (BTC) Address</label>
                      <input type="text" defaultValue="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 font-mono text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Ethereum (ETH/USDT) Address</label>
                      <input type="text" defaultValue="0x71C7656EC7ab88b098defB751B7401B5f6d8976F" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 font-mono text-sm" />
                    </div>
                    <button className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20">
                      Update Wallet Addresses
                    </button>
                  </div>
                </div>

                <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-3 mb-6">
                    <Settings className="text-emerald-400" size={24} />
                    <h3 className="text-lg font-bold">System Configuration</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                      <div>
                        <div className="font-bold">Maintenance Mode</div>
                        <div className="text-xs text-slate-500">Temporarily disable platform access</div>
                      </div>
                      <div className="w-12 h-6 bg-slate-700 rounded-full relative">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-slate-500 rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                      <div>
                        <div className="font-bold">Registration</div>
                        <div className="text-xs text-slate-500">Allow new user signups</div>
                      </div>
                      <div className="w-12 h-6 bg-emerald-500 rounded-full relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black tracking-tight">Edit Profile</h3>
              <button onClick={() => setEditingProfile(null)} className="text-slate-500 hover:text-white transition">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400">{editingProfile.full_name}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Account Balance (EUR)</label>
                  <input
                    type="number"
                    value={editForm.balance}
                    onChange={(e) => setEditForm({ ...editForm, balance: parseFloat(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Profit (EUR)</label>
                  <input
                    type="number"
                    value={editForm.profit}
                    onChange={(e) => setEditForm({ ...editForm, profit: parseFloat(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 font-mono text-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Access Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button
                onClick={handleUpdateProfile}
                className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-600 transition flex items-center justify-center gap-2"
              >
                <Save size={20} /> Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
