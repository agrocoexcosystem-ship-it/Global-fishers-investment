import React from 'react';
import {
    LayoutDashboard, Users, Wallet, FileText,
    Settings, Shield, Briefcase, BarChart2,
    Bell, HelpCircle, Terminal, LogOut, Database
} from 'lucide-react';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    handleLogout: () => void;
}

const AdminSidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, handleLogout }) => {
    const menuItems = [
        { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'clients', label: 'Client Management', icon: <Users size={20} /> },
        { id: 'portfolio', label: 'Portfolios', icon: <Briefcase size={20} /> },
        { id: 'transactions', label: 'Transactions', icon: <Wallet size={20} /> },
        { id: 'bot', label: 'Bot Terminal', icon: <Terminal size={20} className="text-emerald-400" /> }, // Special Feature
        { id: 'products', label: 'Invest. Products', icon: <BarChart2 size={20} /> },
        { id: 'compliance', label: 'Compliance & KYC', icon: <Shield size={20} /> },
        { id: 'reports', label: 'Reports', icon: <FileText size={20} /> },
        { id: 'settings', label: 'System Settings', icon: <Settings size={20} /> },
        { id: 'database', label: 'Database Viewer', icon: <Database size={20} /> },
    ];

    return (
        <aside className="hidden lg:flex flex-col w-72 bg-[#020617] border-r border-slate-800 text-slate-300 h-screen fixed left-0 top-0 z-50">
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                    <span className="font-bold text-white">GF</span>
                </div>
                <div>
                    <h1 className="font-bold text-white text-lg tracking-tight">Global Fishers</h1>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Admin Portal</p>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${activeTab === item.id
                            ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20 shadow-lg shadow-emerald-900/20'
                            : 'hover:bg-slate-800/50 hover:text-white'
                            }`}
                    >
                        <span className={`transition-colors ${activeTab === item.id ? 'text-emerald-400' : 'text-slate-500 group-hover:text-white'}`}>
                            {item.icon}
                        </span>
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
