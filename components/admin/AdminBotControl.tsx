import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Terminal, Play, Square, Save, Activity, Cpu, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { Profile } from '../../types';

interface BotControlProps {
    users: Profile[];
}

const AdminBotControl: React.FC<BotControlProps> = ({ users }) => {
    const [selectedUser, setSelectedUser] = useState<string>('');
    const targetUser = users.find(u => u.id === selectedUser) || null;
    const [botConfig, setBotConfig] = useState({
        enabled: false,
        strategy: 'AI_OPTIMIZED',
        win_rate: 85
    });
    const [logs, setLogs] = useState<string[]>([]);

    const handleUserSelect = (id: string) => {
        setSelectedUser(id);
        const user = users.find(u => u.id === id);

        // Simulate fetching settings
        setBotConfig({
            enabled: user?.bot_settings?.enabled || false,
            strategy: (user?.bot_settings?.strategy as any) || 'AI_OPTIMIZED',
            win_rate: user?.bot_settings?.win_rate || 85
        });

        addLog(`Loaded configuration for user: ${user?.email}`);
    };

    const addLog = (msg: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
    };

    const saveConfig = async () => {
        if (!selectedUser) return;
        const toastId = toast.loading("Updating Neural Net...");

        try {
            const { error } = await supabase.from('profiles').update({
                bot_settings: botConfig
            }).eq('id', selectedUser);

            if (error) throw error;

            addLog(`Configuration saved. Mode: ${botConfig.strategy}, Win Rate: ${botConfig.win_rate}%`);
            toast.success("Bot configuration updated", { id: toastId });
        } catch (e: any) {
            console.error(e);
            toast.error("Failed to update bot: " + e.message, { id: toastId });
        }
    };

    const executeForceTrade = async (type: 'WIN' | 'LOSS') => {
        if (!selectedUser || !targetUser) return;

        const amount = Math.floor(Math.random() * 500) + 100;
        const pnl = type === 'WIN' ? amount * 0.85 : -amount;

        addLog(`Executing FORCE ${type} trade...`);

        // 1. Record Transaction
        const { error } = await supabase.from('transactions').insert({
            user_id: selectedUser,
            type: 'bot_trade',
            amount: Math.abs(pnl),
            status: 'completed',
            method: `Bot Execution (${botConfig.strategy})`,
            details: `Forced ${type} by Admin. Asset: BTC/USD`
        });

        if (!error) {
            // 2. Update Profile Balance/Profit manually (Trigger might not handle 'bot_trade')
            const newProfit = (targetUser.profit || 0) + pnl;
            const newBalance = (targetUser.balance || 0) + pnl;

            await supabase.from('profiles').update({
                profit: newProfit,
                balance: newBalance
            }).eq('id', selectedUser);

            addLog(`Trade Executed: ${type} $${Math.abs(pnl).toFixed(2)}`);
            toast.success(`Forced ${type} trade executed`);
        } else {
            addLog(`Trade Failed: ${error.message}`);
            toast.error("Trade execution failed");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Terminal className="text-emerald-600" />
                        Bot Control Terminal
                    </h2>
                    <p className="text-slate-500">Manage algorithmic trading parameters for active clients.</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
                    <Activity size={18} className="text-emerald-600 animate-pulse" />
                    <span className="text-sm font-bold text-emerald-700">System Online</span>
                </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Cpu size={18} />
                            Neural Configuration
                        </h3>
                        <select
                            className="bg-white border border-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                            value={selectedUser}
                            onChange={(e) => handleUserSelect(e.target.value)}
                        >
                            <option value="">Select Target Client...</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.email} ({u.username})</option>
                            ))}
                        </select>
                    </div>

                    {selectedUser ? (
                        <div className="p-6 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Trading Strategy</label>
                                    <div className="space-y-3">
                                        {['AI_OPTIMIZED', 'AGGRESSIVE', 'SAFE'].map((mode) => (
                                            <div
                                                key={mode}
                                                onClick={() => setBotConfig(prev => ({ ...prev, strategy: mode as any }))}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${botConfig.strategy === mode
                                                    ? 'border-emerald-500 bg-emerald-50/50'
                                                    : 'border-slate-100 hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-slate-700">{mode.replace('_', ' ')}</span>
                                                    {botConfig.strategy === mode && <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Target Win Rate ({botConfig.win_rate}%)</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={botConfig.win_rate}
                                            onChange={(e) => setBotConfig(prev => ({ ...prev, win_rate: parseInt(e.target.value) }))}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Bot Status</label>
                                        <button
                                            onClick={() => setBotConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${botConfig.enabled
                                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700'
                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                }`}
                                        >
                                            {botConfig.enabled ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                                            {botConfig.enabled ? 'STOP ENGINE' : 'START ENGINE'}
                                        </button>
                                    </div>
                                    <button
                                        onClick={saveConfig}
                                        className="w-full py-3 border border-emerald-200 text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 flex items-center justify-center gap-2"
                                    >
                                        <Save size={18} />
                                        Save Configuration
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                            <Cpu size={48} className="mb-4 opacity-20" />
                            <p>Select a client node to configure trading parameters.</p>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-[#0f172a] rounded-2xl shadow-lg border border-slate-800 overflow-hidden flex flex-col h-[400px]">
                        <div className="p-4 bg-[#1e293b] border-b border-slate-700 flex justify-between items-center">
                            <span className="text-xs font-mono text-emerald-400 font-bold">TERMINAL_OUTPUT</span>
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                            </div>
                        </div>
                        <div className="flex-1 p-4 font-mono text-xs space-y-2 overflow-y-auto custom-scrollbar">
                            {logs.length === 0 && <span className="text-slate-600">Waiting for command...</span>}
                            {logs.map((log, i) => (
                                <div key={i} className="text-emerald-400/80 border-l-2 border-emerald-500/20 pl-2">
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>

                    {selectedUser && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Manual Overrides</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => executeForceTrade('WIN')} className="px-4 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-colors flex flex-col items-center gap-1">
                                    <Zap size={16} />
                                    Force Win
                                </button>
                                <button onClick={() => executeForceTrade('LOSS')} className="px-4 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-bold text-sm hover:bg-rose-100 transition-colors flex flex-col items-center gap-1">
                                    <Zap size={16} />
                                    Force Loss
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminBotControl;
