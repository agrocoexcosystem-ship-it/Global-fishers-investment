import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MessageSquare, Clock, User, CheckCircle, XCircle, Send, MoreHorizontal } from 'lucide-react';
import { SupportTicket } from '../../types';
import toast from 'react-hot-toast';

const AdminSupport: React.FC = () => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [reply, setReply] = useState('');

    useEffect(() => {
        fetchTickets();
        const sub = supabase.channel('tickets').on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, fetchTickets).subscribe();
        return () => { supabase.removeChannel(sub); };
    }, []);

    const fetchTickets = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('support_tickets').select('*, profiles(email)').order('created_at', { ascending: false });
        if (!error) setTickets(data as unknown as SupportTicket[]);
        setLoading(false);
    };

    const handleReply = async () => {
        if (!reply || !selectedTicket) return;

        const newLog = [...(selectedTicket.response_log || []), {
            sender: 'Support Agent',
            message: reply,
            date: new Date().toISOString()
        }];

        const { error } = await supabase.from('support_tickets').update({
            response_log: newLog,
            status: 'resolved', // Auto-resolve on reply for simplicity, or keep open
            updated_at: new Date().toISOString()
        }).eq('id', selectedTicket.id);

        if (!error) {
            toast.success("Reply Sent");
            setReply('');
            setSelectedTicket({ ...selectedTicket, response_log: newLog, status: 'resolved' });
        } else {
            toast.error("Failed to send reply");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)] animate-in fade-in duration-500">
            {/* Ticket List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Inbox</h3>
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">{tickets.filter(t => t.status === 'open').length} Open</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {tickets.map(ticket => (
                        <div
                            key={ticket.id}
                            onClick={() => setSelectedTicket(ticket)}
                            className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${selectedTicket?.id === ticket.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''}`}
                        >
                            <div className="flex justify-between mb-1">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${ticket.status === 'open' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>{ticket.status}</span>
                                <span className="text-[10px] text-slate-400">{new Date(ticket.created_at).toLocaleDateString()}</span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm truncate">{ticket.subject}</h4>
                            <p className="text-xs text-slate-500 truncate">{ticket.message}</p>
                        </div>
                    ))}
                    {tickets.length === 0 && <div className="p-8 text-center text-slate-400">No tickets found.</div>}
                </div>
            </div>

            {/* Ticket Detail & Chat */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                {selectedTicket ? (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">{selectedTicket.subject}</h2>
                                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                        <User size={14} /> {selectedTicket.profiles?.email || 'Unknown User'} • Ticket #{selectedTicket.id.slice(0, 8)}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><MoreHorizontal size={20} /></button>
                                </div>
                            </div>
                            <div className="flex gap-4 text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="flex items-center gap-1"><Clock size={14} className="text-rose-500" /> Created: {new Date(selectedTicket.created_at).toLocaleString()}</span>
                                <span className="flex items-center gap-1"><CheckCircle size={14} className="text-emerald-500" /> Status: {selectedTicket.status.toUpperCase()}</span>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                            {/* Original Message */}
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">U</div>
                                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm max-w-[80%]">
                                    <p className="text-sm text-slate-800 leading-relaxed">{selectedTicket.message}</p>
                                </div>
                            </div>

                            {/* Responses */}
                            {selectedTicket.response_log?.map((res, i) => (
                                <div key={i} className="flex gap-4 flex-row-reverse">
                                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shrink-0">A</div>
                                    <div className="bg-emerald-600 p-4 rounded-2xl rounded-tr-none shadow-md max-w-[80%]">
                                        <p className="text-sm text-white leading-relaxed">{res.message}</p>
                                        <div className="text-[10px] text-emerald-200 mt-2 text-right">{new Date(res.date).toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reply Input */}
                        <div className="p-4 border-t border-slate-200 bg-white">
                            <div className="relative">
                                <textarea
                                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-24 text-sm"
                                    placeholder="Type your reply..."
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                ></textarea>
                                <button
                                    onClick={handleReply}
                                    disabled={!reply.trim()}
                                    className="absolute bottom-3 right-3 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-200"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <MessageSquare size={48} className="mb-4 text-slate-200" />
                        <p>Select a ticket to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSupport;
