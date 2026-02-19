import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';

// Components
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminOverview from '../components/admin/AdminOverview';
import AdminTransactions from '../components/admin/AdminTransactions';
import AdminUsers from '../components/admin/AdminUsers';
import AdminFinancials from '../components/admin/AdminFinancials';
import AdminKYC from '../components/admin/AdminKYC';
import AdminSupport from '../components/admin/AdminSupport';
import AdminAuditLogs from '../components/admin/AdminAuditLogs';
import AdminBotControl from '../components/admin/AdminBotControl';
import AdminInvestments from '../components/admin/AdminInvestments';

const Admin: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/admin/login');
                return; // Early return
            }

            // Super Admin Bypass for Developer / Owner
            if (session.user.email === 'obiesieprosper@gmail.com' || session.user.email === 'admin@fisherspay.de') {
                setCurrentUser({ ...session.user, role: 'super_admin' });
                setLoading(false);
                return;
            }

            // Standard Admin Check via Profiles Table
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            // Validate Role
            if (!profile || !['admin', 'super_admin', 'support', 'finance'].includes(profile.role)) {
                toast.error("Access Denied: Insufficient Privileges");
                navigate('/dashboard');
                return;
            }
            setCurrentUser(profile);
            setLoading(false);
        } catch (error) {
            console.error("Auth Check Error:", error);
            navigate('/admin/login');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin/login');
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="text-emerald-500 font-bold tracking-widest text-xs uppercase animate-pulse">Establishing Secure Uplink...</p>
            </div>
        </div>
    );

    return (
        <div className="flex bg-slate-50 min-h-screen text-slate-900 font-sans">
            <Toaster position="top-right" toastOptions={{
                style: { background: '#1e293b', color: '#fff', borderRadius: '12px', fontSize: '14px' },
                success: { iconTheme: { primary: '#10b981', secondary: '#fff' } }
            }} />

            {/* Sidebar Navigation */}
            <AdminSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleLogout={handleLogout}
            />

            {/* Main Operational Area */}
            <main className="flex-1 lg:ml-72 p-6 lg:p-10 transition-all duration-300">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 capitalize tracking-tight flex items-center gap-3">
                            {activeTab.replace('_', ' ')}
                            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full tracking-normal border border-slate-200">v2.5.0</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium mt-1 flex items-center gap-2">
                            Session Active for <span className="text-emerald-600 font-bold">{currentUser?.email}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-slate-100">
                            {currentUser?.email?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="text-xs">
                            <p className="font-bold text-slate-900 leading-tight">Administrator</p>
                            <p className="text-slate-400 capitalize leading-tight">{currentUser?.role?.replace('_', ' ') || 'Admin'}</p>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content Module */}
                <div className="min-h-[80vh] relative">
                    {activeTab === 'overview' && <AdminOverview />}
                    {activeTab === 'transactions' && <AdminTransactions />}
                    {activeTab === 'clients' && <AdminUsers />}
                    {activeTab === 'investments' && <AdminInvestments />}
                    {activeTab === 'financials' && <AdminFinancials />}
                    {activeTab === 'kyc' && <AdminKYC />}
                    {activeTab === 'support' && <AdminSupport />}
                    {activeTab === 'bot_control' && <AdminBotControl />}
                    {activeTab === 'audit_logs' && <AdminAuditLogs />}
                </div>
            </main>
        </div>
    );
};

export default Admin;
