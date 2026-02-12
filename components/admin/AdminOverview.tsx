import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Briefcase, Activity, DollarSign, ArrowUpRight, ArrowDownLeft, AlertCircle, TrendingUp, ShieldAlert } from 'lucide-react';
import { Profile, Transaction, FraudAlert } from '../../types';

interface OverviewStats {
    totalUsers: number;
    activeUsers: number;
    totalDeposits: number;
    totalWithdrawals: number;
    pendingTransactions: number;
    netRevenue: number;
    activeAlerts: number;
}

const AdminOverview: React.FC = () => {
    const [stats, setStats] = useState<OverviewStats>({
        totalUsers: 0,
        activeUsers: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        pendingTransactions: 0,
        netRevenue: 0,
        activeAlerts: 0
    });
    const [recentActivity, setRecentActivity] = useState<Transaction[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();

        // Real-time subscriptions
        const txSub = supabase
            .channel('admin-overview-tx')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
                fetchDashboardData();
            })
            .subscribe();

        const userSub = supabase
            .channel('admin-overview-users')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
                fetchDashboardData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(txSub);
            supabase.removeChannel(userSub);
        };
    }, []);

    const fetchDashboardData = async () => {
        try {
            // 1. Fetch Users
            const { data: users, count: userCount } = await supabase
                .from('profiles')
                .select('id, kyc_status, is_frozen', { count: 'exact' });

            // 2. Fetch Transactions
            const { data: transactions } = await supabase
                .from('transactions')
                .select('*')
                .order('created_at', { ascending: false });

            // 3. Fetch Alerts (Optional - if table exists)
            const { count: alertCount } = await supabase
                .from('fraud_alerts')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'new');

            if (users && transactions) {
                const totalDeposits = transactions
                    .filter(t => t.type === 'deposit' && t.status === 'completed')
                    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

                const totalWithdrawals = transactions
                    .filter(t => t.type === 'withdrawal' && t.status === 'completed')
                    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

                const pendingCount = transactions.filter(t => t.status === 'pending').length;

                // Chart Data Generator (Last 7 Days)
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return d.toISOString().split('T')[0];
                });

                const newChartData = last7Days.map(dateStr => {
                    const dayTxs = transactions.filter(t => t.created_at.startsWith(dateStr) && t.status === 'completed');
                    return {
                        name: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
                        deposits: dayTxs.filter(t => t.type === 'deposit').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
                        withdrawals: dayTxs.filter(t => t.type === 'withdrawal').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
                    };
                });

                setStats({
                    totalUsers: userCount || 0,
                    activeUsers: users.filter(u => u.kyc_status !== 'suspended' && !u.is_frozen).length,
                    totalDeposits,
                    totalWithdrawals,
                    pendingTransactions: pendingCount,
                    netRevenue: totalDeposits - totalWithdrawals,
                    activeAlerts: alertCount || 0
                });

                setRecentActivity(transactions.slice(0, 5));
                setChartData(newChartData);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading Analytics...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Net Revenue"
                    value={`$${stats.netRevenue.toLocaleString()}`}
                    icon={<DollarSign className="text-emerald-500" />}
                    trend="+12.5%"
                    trendUp={true}
                />
                <StatCard
                    label="Active Users"
                    value={stats.activeUsers.toString()}
                    subValue={`Total: ${stats.totalUsers}`}
                    icon={<Users className="text-blue-500" />}
                    trend="+5 New"
                    trendUp={true}
                />
                <StatCard
                    label="Pending Actions"
                    value={stats.pendingTransactions.toString()}
                    icon={<Activity className="text-amber-500" />}
                    trend="Requires Attention"
                    alert={stats.pendingTransactions > 0}
                />
                <StatCard
                    label="Security Alerts"
                    value={stats.activeAlerts.toString()}
                    icon={<ShieldAlert className="text-rose-500" />}
                    trend={stats.activeAlerts > 0 ? "Critical" : "Secure"}
                    alert={stats.activeAlerts > 0}
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Financial Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <TrendingUp size={20} className="text-emerald-600" />
                            Financial Performance
                        </h3>
                        <div className="flex gap-4">
                            <LegendItem color="bg-emerald-500" label="Inflow" />
                            <LegendItem color="bg-rose-500" label="Outflow" />
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
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                                />
                                <Area type="monotone" dataKey="deposits" name="Inflow" stroke="#10b981" fillOpacity={1} fill="url(#colorDep)" strokeWidth={3} />
                                <Area type="monotone" dataKey="withdrawals" name="Outflow" stroke="#f43f5e" fillOpacity={1} fill="url(#colorWith)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <h3 className="font-bold text-slate-800 mb-6">Live Activity Feed</h3>
                    <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                        {recentActivity.map(tx => (
                            <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'deposit' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                        {tx.type === 'deposit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 capitalize">{tx.type} <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tx.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>{tx.status}</span></p>
                                        <p className="text-[10px] text-slate-400">{new Date(tx.created_at).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                                <span className="font-mono font-bold text-sm text-slate-700">${tx.amount.toLocaleString()}</span>
                            </div>
                        ))}
                        {recentActivity.length === 0 && <p className="text-center text-slate-400 text-sm py-4">No recent activity.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-components
const StatCard = ({ label, value, subValue, icon, trend, trendUp, alert }: any) => (
    <div className={`p-6 rounded-2xl border transition-all ${alert ? 'bg-rose-50 border-rose-200 ring-1 ring-rose-100' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${alert ? 'bg-white' : 'bg-slate-50'}`}>{icon}</div>
            {trend && <span className={`px-2 py-1 rounded-full text-xs font-bold ${alert ? 'bg-rose-100 text-rose-700' : (trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600')}`}>{trend}</span>}
        </div>
        <h3 className="text-2xl font-black text-slate-900">{value}</h3>
        <div className="flex justify-between items-center mt-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            {subValue && <span className="text-xs text-slate-400">{subValue}</span>}
        </div>
    </div>
);

const LegendItem = ({ color, label }: { color: string, label: string }) => (
    <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <span className="text-xs font-bold text-slate-600">{label}</span>
    </div>
);

export default AdminOverview;
