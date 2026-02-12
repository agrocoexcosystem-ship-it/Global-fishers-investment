import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Search, Clock, ShieldCheck, User, Database, AlertCircle } from 'lucide-react';

interface AuditLog {
    id: string;
    action_type: string;
    target_resource: string;
    details: any;
    admin_id: string;
    created_at: string;
    profiles?: {
        email: string;
    }
}

const AdminAuditLogs: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        const { data, error } = await supabase
            .from('admin_audit_logs')
            .select('*, profiles!admin_id(email)')
            .order('created_at', { ascending: false })
            .limit(50);

        if (!error && data) {
            setLogs(data as unknown as AuditLog[]);
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm animate-in fade-in duration-500">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Database size={18} className="text-slate-400" /> System Audit Trail
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                        <tr>
                            <th className="px-6 py-4">Timestamp</th>
                            <th className="px-6 py-4">Admin</th>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">Resource</th>
                            <th className="px-6 py-4">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                                    {new Date(log.created_at).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600">
                                            {log.profiles?.email?.[0]?.toUpperCase() || 'S'}
                                        </div>
                                        <span className="font-bold text-slate-700 text-xs">{log.profiles?.email || 'System'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
                                        {log.action_type.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-emerald-600">
                                    {log.target_resource}
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate" title={JSON.stringify(log.details)}>
                                    {JSON.stringify(log.details)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && <div className="p-8 text-center text-slate-400 italic">No logs recorded yet.</div>}
            </div>
        </div>
    );
};

export default AdminAuditLogs;
