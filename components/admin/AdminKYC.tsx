import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Shield, FileText, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Profile } from '../../types';
import toast from 'react-hot-toast';

interface KYCRequest {
    id: string; // User ID acting as Request ID for simplicity if using profile status
    user_id: string;
    status: string;
    document_url?: string; // Assume single doc for now or array string
    created_at: string;
    email: string;
    username: string;
}

const AdminKYC: React.FC = () => {
    const [requests, setRequests] = useState<KYCRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        // In a real scenario, this would join a separate kyc_requests table.
        // Here we query profiles directly where status is pending.
        const { data, error } = await supabase
            .from('profiles')
            .select('id, kyc_status, email, username, kyc_document_url, created_at')
            .eq('kyc_status', 'pending');

        if (!error && data) {
            setRequests(data.map((p: any) => ({
                id: p.id,
                user_id: p.id,
                status: p.kyc_status,
                document_url: p.kyc_document_url,
                created_at: p.created_at,
                email: p.email,
                username: p.username
            })));
        }
        setLoading(false);
    };

    const handleVerdict = async (verdict: 'verified' | 'rejected') => {
        if (!selectedRequest) return;

        const toastId = toast.loading(`Marking as ${verdict}...`);

        const { error } = await supabase
            .from('profiles')
            .update({ kyc_status: verdict })
            .eq('id', selectedRequest.user_id);

        if (!error) {
            toast.success(`User ${verdict}`, { id: toastId });
            setRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
            setSelectedRequest(null);

            // Log it
            await supabase.from('admin_audit_logs').insert({
                action_type: 'KYC_VERDICT',
                target_resource: `user:${selectedRequest.user_id}`,
                details: { verdict },
                admin_id: (await supabase.auth.getUser()).data.user?.id
            });

        } else {
            toast.error("Failed", { id: toastId });
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)] animate-in fade-in duration-500">
            {/* Request List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Shield size={16} /> Pending Verifications</h3>
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">{requests.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? <div className="p-8 text-center text-slate-400">Loading...</div> : requests.length === 0 ? <div className="p-8 text-center text-slate-400">No pending requests.</div> : (
                        requests.map(req => (
                            <div
                                key={req.id}
                                onClick={() => setSelectedRequest(req)}
                                className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${selectedRequest?.id === req.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                                        {req.username?.[0] || req.email[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-900 truncate">{req.username || 'User'}</h4>
                                        <p className="text-xs text-slate-500 truncate">{req.email}</p>
                                    </div>
                                    <span className="text-[10px] text-slate-400">{new Date(req.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Document Viewer */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col items-center justify-center p-6 relative">
                {selectedRequest ? (
                    <div className="w-full h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Document Review</h2>
                                <p className="text-sm text-slate-500">Reviewing submission for <span className="font-bold text-slate-700">{selectedRequest.email}</span></p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleVerdict('rejected')}
                                    className="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 font-bold text-sm flex items-center gap-2 transition-colors"
                                >
                                    <XCircle size={16} /> Reject
                                </button>
                                <button
                                    onClick={() => handleVerdict('verified')}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-200 transition-colors"
                                >
                                    <CheckCircle size={16} /> Approve
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden relative group">
                            {selectedRequest.document_url ? (
                                <img
                                    src={selectedRequest.document_url}
                                    alt="KYC Document"
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : (
                                <div className="text-center">
                                    <FileText size={64} className="mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-500 font-bold">No Document Uploaded</p>
                                    <p className="text-xs text-slate-400">User has set status to pending without upload?</p>
                                </div>
                            )}
                            {selectedRequest.document_url && (
                                <a
                                    href={selectedRequest.document_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black transition-colors flex items-center gap-2 opacity-0 group-hover:opacity-100"
                                >
                                    <Eye size={14} /> View Full Size
                                </a>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-slate-400">
                        <Shield size={64} className="mx-auto text-slate-200 mb-4" />
                        <p className="font-bold">Select a request to review documents</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminKYC;
