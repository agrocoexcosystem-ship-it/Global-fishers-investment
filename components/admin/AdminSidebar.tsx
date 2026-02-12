import React from 'react';
import {
    LayoutDashboard,
    Users,
    ArrowLeftRight,
    Briefcase,
    Shield,
    MessageSquare,
    FileText,
    LogOut,
    Menu,
    Plus,
    CheckCircle,
    UserCheck,
    CreditCard
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    handleLogout: () => void;
}

const AdminSidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, handleLogout }) => {
    const navItems = [
        { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'transactions', label: 'Transactions', icon: <ArrowLeftRight size={20} /> },
        { id: 'clients', label: 'User Management', icon: <Users size={20} /> },
        { id: 'investments', label: 'Investments', icon: <Briefcase size={20} /> },
        { id: 'financials', label: 'Manual Adjustment', icon: <CreditCard size={20} /> },
        { id: 'kyc', label: 'KYC Center', icon: <UserCheck size={20} /> },
        { id: 'support', label: 'Support Tickets', icon: <MessageSquare size={20} /> },
        { id: 'bot_control', label: 'Bot Engine', icon: <CheckCircle size={20} /> },
        { id: 'audit_logs', label: 'Audit Logs', icon: <FileText size={20} /> },
    ];

    return (
        <>
            {/* Mobile Toggle (Simple placeholder, in real app add toggle state) */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button className="p-2 bg-slate-900 text-white rounded-md shadow-lg">
                    <Menu size={24} />
                </button>
            </div>

            <aside className="fixed inset-y-0 left-0 w-72 bg-slate-900 text-slate-300 flex flex-col z-40 transform transition-transform duration-300 lg:translate-x-0 -translate-x-full shadow-2xl">
                {/* Brand */}
                <div className="p-8 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-900/20">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white tracking-tight">ADMIN PANEL</h1>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Fishers</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 overflow-y-auto space-y-1 custom-scrollbar">
                    <p className="px-4 py-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Main Menu</p>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${activeTab === item.id
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 font-bold'
                                    : 'hover:bg-slate-800 hover:text-white font-medium'
                                }`}
                        >
                            {/* Active Indicator */}
                            {activeTab === item.id && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-r-full"></div>
                            )}

                            <span className={`transform transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                                {item.icon}
                            </span>
                            <span className="text-sm tracking-wide">{item.label}</span>

                            {/* Hover Arrow */}
                            <div className={`ml-auto opacity-0 -translate-x-2 transition-all duration-300 ${activeTab === item.id ? 'opacity-100 translate-x-0' : 'group-hover:opacity-50 group-hover:translate-x-0'}`}>
                                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                            </div>
                        </button>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-200 group"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold text-sm">Sign Out</span>
                    </button>
                    <div className="mt-4 px-4 text-center">
                        <p className="text-[10px] text-slate-600">v2.5.0 • Secure Connection</p>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
