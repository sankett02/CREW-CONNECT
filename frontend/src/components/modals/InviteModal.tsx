import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Loader2, Send, CheckCircle2, Briefcase, Sparkles } from 'lucide-react';

interface InviteModalProps {
    creatorId: string;
    creatorName: string;
    onClose: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ creatorId, creatorName, onClose }) => {
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [message, setMessage] = useState('');
    const [role, setRole] = useState('CREATOR');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMyProjects = async () => {
            try {
                await axios.get('/api/projects?status=DRAFT'); // Invite to drafts or active? User likely wants to invite to new projects.
                // Fetching all my projects might be better
                const resAll = await axios.get('/api/projects');
                // Filter where user is brand (could also be done on backend)
                setProjects(resAll.data.filter((p: any) => p.status !== 'COMPLETED'));
            } catch (err) {
                console.error('Failed to fetch projects', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyProjects();
    }, []);

    const handleSendInvite = async () => {
        if (!selectedProject) {
            setError('Please select a project');
            return;
        }
        setSending(true);
        setError('');
        try {
            await axios.post(`/api/projects/${selectedProject}/invite`, {
                creatorId,
                message,
                appliedRole: role
            });
            setSuccess(true);
            setTimeout(onClose, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send invitation');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-glass-bg border-b border-white/5 p-5 flex justify-between items-center bg-gradient-to-r from-primary/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Invite Creator</h3>
                            <p className="text-xs text-text-muted">Approach {creatorName} for your project</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-text-muted hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {success ? (
                        <div className="py-10 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                                <CheckCircle2 size={40} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xl font-bold text-white">Invitation Sent!</h4>
                                <p className="text-sm text-text-muted">We've notified {creatorName} of your interest.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm animate-shake">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#4a5578] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                        <Briefcase size={12} /> Select Project
                                    </label>
                                    {loading ? (
                                        <div className="h-12 bg-white/5 animate-pulse rounded-xl border border-white/5" />
                                    ) : (
                                        <select 
                                            className="input w-full"
                                            value={selectedProject}
                                            onChange={(e) => setSelectedProject(e.target.value)}
                                        >
                                            <option value="">Choose a project...</option>
                                            {projects.map(p => (
                                                <option key={p.id} value={p.id}>{p.title}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#4a5578] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                        <Sparkles size={12} /> Requested Role
                                    </label>
                                    <select 
                                        className="input w-full"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                    >
                                        <option value="CREATOR">Creator</option>
                                        <option value="WRITER">Writer</option>
                                        <option value="EDITOR">Editor</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#4a5578] uppercase tracking-widest ml-1">Personal Message</label>
                                    <textarea 
                                        className="input w-full min-h-[120px] py-3 resize-none"
                                        placeholder="Hey! I love your work and would love to have you on my project..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSendInvite}
                                disabled={sending || loading}
                                className="btn-primary w-full py-4 text-base shadow-xl shadow-primary/25 group overflow-hidden"
                            >
                                {sending ? (
                                    <><Loader2 size={20} className="animate-spin" /> Dispatching...</>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Send Invitation <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </span>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InviteModal;
