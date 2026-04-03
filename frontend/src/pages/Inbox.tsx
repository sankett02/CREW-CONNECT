import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Mail, ArrowRight, Clock, CheckCircle2, XCircle, Loader2, Shapes } from 'lucide-react';
import { Link } from 'react-router-dom';

const Inbox: React.FC = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchApplications = async () => {
        try {
            const res = await axios.get('/api/projects/applications/me');
            setApplications(res.data);
        } catch (err) {
            console.error('Failed to fetch applications', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleAction = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
        try {
            await axios.put(`/api/projects/applications/${id}`, { status });
            fetchApplications();
        } catch (err) {
            console.error('Action failed', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
            </div>
        );
    }

    const invitations = applications.filter(a => a.type === 'INVITATION' && a.status === 'PENDING');
    const history = applications.filter(a => a.status !== 'PENDING' || a.type !== 'INVITATION');

    return (
        <div className="max-w-6xl mx-auto space-y-10 py-6">
            <div className="flex items-end justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-[0.2em]">
                        <Mail size={14} />
                        Communications hub
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Your Inbox</h1>
                    <p className="text-[#7e8fb5] max-w-md">Manage your project invitations, applications, and brand requests in one place.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center min-w-[120px]">
                        <div className="text-2xl font-black text-white">{invitations.length}</div>
                        <div className="text-[10px] font-bold text-[#7e8fb5] uppercase tracking-widest">New Requests</div>
                    </div>
                </div>
            </div>

            {/* Invitations Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Clock className="text-amber-400" size={20} />
                        Pending Invitations
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>

                {invitations.length === 0 ? (
                    <div className="glass-card p-12 text-center space-y-4 border-dashed">
                        <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-[#4a5578]">
                            <Mail size={32} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg font-bold text-white">No pending requests</p>
                            <p className="text-sm text-[#7e8fb5]">When brands invite you to projects, they'll appear here.</p>
                        </div>
                        <Link to="/discover" className="inline-block text-xs font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors pt-2">
                            Browse Jobs Instead →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {invitations.map((inv) => (
                            <div key={inv.id} className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-indigo-500/30 transition-all group">
                                <div className="flex items-center gap-6 flex-1">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                                        <Shapes size={28} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded uppercase tracking-tighter">Project Invitation</span>
                                            <span className="text-[10px] font-bold text-[#4a5578] tracking-widest uppercase">• {new Date(inv.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors">{inv.project.title}</h3>
                                        <div className="flex items-center gap-3 pt-1">
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                                                <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-[10px] font-bold">
                                                    {inv.project.brand?.profile?.displayName?.charAt(0) || 'B'}
                                                </div>
                                                <span className="text-xs font-bold text-[#7e8fb5]">{inv.project.brand?.profile?.displayName || 'Brand'}</span>
                                            </div>
                                            <span className="text-xs font-black text-indigo-400">${Number(inv.project.budget).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <button 
                                        onClick={() => handleAction(inv.id, 'REJECTED')}
                                        className="flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 border border-red-500/10 transition-all"
                                    >
                                        Decline
                                    </button>
                                    <button 
                                        onClick={() => handleAction(inv.id, 'ACCEPTED')}
                                        className="flex-1 md:flex-none px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-600 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                    >
                                        Accept Request <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* History Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-[#7e8fb5] uppercase tracking-widest">Application History</h2>
                    <div className="h-[1px] flex-1 bg-white/5" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {history.map((app) => (
                        <div key={app.id} className="glass-card p-5 flex items-center justify-between border-white/[0.03] opacity-80 hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                                    app.status === 'ACCEPTED' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                    app.status === 'REJECTED' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                    'bg-white/5 border-white/5 text-[#7e8fb5]'
                                }`}>
                                    {app.status === 'ACCEPTED' ? <CheckCircle2 size={18} /> : 
                                     app.status === 'REJECTED' ? <XCircle size={18} /> : 
                                     <Clock size={18} />}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">{app.project.title}</h4>
                                    <p className="text-[10px] font-bold text-[#4a5578] uppercase tracking-widest mt-0.5">
                                        {app.type === 'INVITATION' ? 'Invite' : 'Application'} • {app.status}
                                    </p>
                                </div>
                            </div>
                            <Link to={`/projects/${app.projectId}`} className="p-2 text-[#4a5578] hover:text-white transition-colors">
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Inbox;
