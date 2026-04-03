import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Send, CheckCircle2, XCircle, Clock, Star, LayoutGrid,
    MessageSquare, Loader2, ArrowLeft, Upload, Plus, Tag, Paperclip, Lock
} from 'lucide-react';

const STATUS_ICONS: Record<string, React.ReactNode> = {
    DRAFT: <Lock size={16} className="text-text-muted" />,
    PENDING: <Clock size={16} className="text-yellow-400" />,
    SUBMITTED: <Upload size={16} className="text-accent" />,
    TEAM_REVIEW: <Clock size={16} className="text-indigo-400" />,
    UNDER_REVIEW: <Clock size={16} className="text-accent ring-2 ring-accent/20 rounded-full" />,
    APPROVED: <CheckCircle2 size={16} className="text-green-400" />,
    CHANGES_REQUESTED: <XCircle size={16} className="text-red-400" />,
};

const STATUS_CLASSES: Record<string, string> = {
    DRAFT: 'bg-glass-bg text-text-muted border-border border-dashed',
    PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    SUBMITTED: 'bg-accent/10 text-accent border-accent/30',
    TEAM_REVIEW: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    UNDER_REVIEW: 'bg-accent/20 text-accent border-accent/50 shadow-[0_0_15px_rgba(56,189,248,0.2)]',
    APPROVED: 'bg-green-500/10 text-green-400 border-green-500/30',
    CHANGES_REQUESTED: 'bg-red-500/10 text-red-400 border-red-500/30',
};

interface TeamMember {
    id: string;
    userId: string;
    role: string;
    user?: {
        profile?: {
            displayName?: string;
        }
    }
}

interface MessageType {
    id: string;
    projectId: string;
    senderId: string;
    content: string;
    isTeamOnly?: boolean;
    createdAt: string;
    attachmentUrl?: string;
    attachmentName?: string;
    sender?: {
        id?: string;
        role?: string;
        profile?: {
            displayName?: string;
        }
    }
}

interface ActivityType {
    id: string;
    projectId: string;
    userId: string | null;
    type: string;
    content: string;
    createdAt: string;
    user?: {
        profile?: {
            displayName?: string;
        }
    }
}

interface MilestoneType {
    id: string;
    projectId: string;
    title: string;
    assignedRole?: string;
    status: string;
    escrowFunded: boolean;
    comments?: string;
    feedback?: string;
    submissionUrl?: string;
}

interface ProjectType {
    id: string;
    brandId: string;
    title: string;
    description: string;
    niche: string;
    status: string;
    openSlots: string | any[];
    team?: TeamMember[];
}

const Workspace: React.FC = () => {
    const { id: projectId } = useParams<{ id: string }>();
    const { user, loading: authLoading } = useAuth();

    const [project, setProject] = useState<ProjectType | null>(null);
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [milestones, setMilestones] = useState<MilestoneType[]>([]);
    const [newMsg, setNewMsg] = useState('');
    const [sendingMsg, setSendingMsg] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
    const [newMilestoneRole, setNewMilestoneRole] = useState('');
    const [creatingMilestone, setCreatingMilestone] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingScore, setRatingScore] = useState(5);
    const [ratingReview, setRatingReview] = useState('');
    const [ratingTarget, setRatingTarget] = useState<TeamMember | null>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [reviewedStates, setReviewedStates] = useState<Record<string, boolean>>({});
    const [milestoneFeedback, setMilestoneFeedback] = useState<Record<string, string>>({});

    // Collaboration Hub States
    const [activities, setActivities] = useState<ActivityType[]>([]);
    const [isTeamChat, setIsTeamChat] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);

    const fetchAll = async () => {
        if (authLoading) return;
        try {
            const [projRes, msgRes, msRes, actRes] = await Promise.all([
                axios.get(`/api/projects/${projectId}`),
                axios.get(`/api/projects/${projectId}/messages?teamOnly=${isTeamChat}`),
                axios.get(`/api/projects/${projectId}/milestones`),
                axios.get(`/api/projects/${projectId}/activity`),
            ]);
            setProject(projRes.data);
            setMessages(msgRes.data);
            setMilestones(msRes.data);
            setActivities(actRes.data);
        } catch (err) {
            console.error('Workspace fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const [searchParams] = useSearchParams();

    useEffect(() => {
        fetchAll();
        
        if (searchParams.get('fund') === 'success') {
            // In a real app, you'd use a toast library like sonner
            console.log('Payment Successful! Escrow funded.');
        }

        // Poll chat every 5s
        const interval = setInterval(() => {
            if (!authLoading && user) { // Only poll if authenticated
                axios.get(`/api/projects/${projectId}/messages?teamOnly=${isTeamChat}`)
                    .then(r => setMessages(r.data))
                    .catch(() => { });
                
                axios.get(`/api/projects/${projectId}/activity`)
                    .then(r => setActivities(r.data))
                    .catch(() => { });
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [projectId, user, authLoading, isTeamChat]);

    useEffect(() => {
        // Only scroll the specific chat container instead of forcing the whole window to scroll
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [messages]);

    const sendMsg = async (contentOverride?: string, attachmentUrl?: string, attachmentName?: string) => {
        const textToSubmit = contentOverride || newMsg;
        if (!textToSubmit.trim() && !attachmentUrl) return;
        setSendingMsg(true);
        try {
            const res = await axios.post(`/api/projects/${projectId}/messages`, { 
                content: textToSubmit,
                isTeamOnly: isTeamChat,
                attachmentUrl,
                attachmentName
            });
            setMessages(prev => [...prev, res.data]);
            setNewMsg('');
        } catch (err) {
            console.error('Send msg failed', err);
        } finally {
            setSendingMsg(false);
        }
    };

    const updateMilestone = async (milestoneId: string, status: string, options: { 
        comments?: string, 
        feedback?: string,
        isSubmission?: boolean,
        submissionUrl?: string
    } = {}) => {
        try {
            let submissionUrl = options.submissionUrl;

            // If submitting a file and no URL provided, upload it first
            if (options.isSubmission && !submissionUrl && uploadFile) {
                const formData = new FormData();
                formData.append('file', uploadFile);
                
                // Upload file to backend
                const uploadRes = await axios.post('/api/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                submissionUrl = uploadRes.data.url;
            }

            const res = await axios.patch(`/api/projects/${projectId}/milestones/${milestoneId}`, {
                status,
                comments: options.comments,
                feedback: options.feedback,
                submissionUrl
            });

            setMilestones(prev => prev.map(m => m.id === milestoneId ? res.data : m));
            setUploadFile(null); // clear file after submit

            // Re-fetch project to get updated status
            const projRes = await axios.get(`/api/projects/${projectId}`);
            setProject(projRes.data);
        } catch (err) {
            console.error('Update milestone failed', err);
        }
    };

    const [fundingMilestone, setFundingMilestone] = useState<string | null>(null);

    const handleFundEscrow = async (milestoneId: string) => {
        setFundingMilestone(milestoneId);
        try {
            const res = await axios.post('/api/stripe/checkout-session', {
                projectId,
                milestoneId
            });
            if (res.data?.url) {
                window.location.href = res.data.url;
            } else {
                alert('Failed to generate payment link');
            }
        } catch (err) {
            console.error('Fund Escrow failed', err);
            alert('Payment service unavailable');
        } finally {
            setFundingMilestone(null);
        }
    };

    const createMilestone = async () => {
        if (!newMilestoneTitle.trim()) return;
        setCreatingMilestone(true);
        try {
            const res = await axios.post(`/api/projects/${projectId}/milestones`, {
                title: newMilestoneTitle,
                assignedRole: newMilestoneRole || null
            });
            setMilestones(prev => [...prev, res.data]);
            setNewMilestoneTitle('');
        } catch (err) {
            console.error('Failed to create milestone', err);
        } finally {
            setCreatingMilestone(false);
        }
    };

    const submitRating = async () => {
        if (!ratingTarget) return;
        try {
            await axios.post(`/api/projects/${projectId}/ratings`, {
                revieweeId: ratingTarget.userId,
                score: ratingScore,
                review: ratingReview,
            });
            setShowRatingModal(false);
        } catch (err) {
            console.error('Rating failed', err);
        }
    };

    const isBrand = project?.brandId === user?.id;
    const isTeamMember = project?.team?.some((m) => m.userId === user?.id);
    const myRole = project?.team?.find((m) => m.userId === user?.id)?.role;
    const isCompleted = project?.status === 'COMPLETED';

    const getAcceptedFileTypes = () => {
        if (!project) return '*/*';
        // If writer, force documents
        if (myRole === 'WRITER') return '.pdf,.doc,.docx,.txt,.odt,.rtf';

        switch (project.niche) {
            case 'YouTube':
            case 'Instagram':
            case 'TikTok':
            case 'Shorts/Reels':
            case 'UGC':
            case 'Animation':
                return '.mp4,.mov,.avi,.mkv,.webm'; // Video formats
            case 'Podcast':
                return '.mp3,.wav,.flac,.m4a,.aac'; // Audio formats
            case 'Photography':
            case 'Branding':
                return '.jpg,.jpeg,.png,.pdf,.ai,.psd,.eps,.svg,.raw'; // Image/Design formats
            case 'Software':
            case 'Web Development':
                return '.zip,.rar,.7z,.tar.gz'; // Code/Software architecture
            case 'Writing':
                return '.pdf,.doc,.docx,.txt,.odt,.rtf';
            default:
                return '.zip,.pdf,.txt,.rar,.7z';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link to="/dashboard" className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors text-sm">
                    <ArrowLeft size={16} /> Dashboard
                </Link>
                <span className="text-border">/</span>
                <h1 className="text-2xl font-bold truncate">{project?.title ?? 'Workspace'}</h1>
                {project?.niche && (
                    <span className="px-3 py-1 bg-glass-bg border border-border rounded-full text-xs font-semibold flex items-center gap-1.5 text-text-muted">
                        <Tag size={12} className="text-primary" /> {project.niche}
                    </span>
                )}
                {isCompleted && (
                    <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/30 rounded-full text-xs font-semibold">COMPLETED</span>
                )}
            </div>

            {/* ── PROJECT PULSE (Progress Bar) ── */}
            <div className="glass-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Star size={16} className="text-yellow-400 fill-yellow-400/20" />
                        <span className="text-sm font-bold uppercase tracking-wider">Project Pulse</span>
                    </div>
                    <span className="text-xs font-bold text-accent">
                        {milestones.length > 0 
                            ? Math.round((milestones.filter(m => m.status === 'APPROVED').length / milestones.length) * 100) 
                            : 0}% Complete
                    </span>
                </div>
                <div className="h-2 w-full bg-glass-bg rounded-full overflow-hidden border border-white/5">
                    <div 
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                        style={{ width: `${milestones.length > 0 ? (milestones.filter(m => m.status === 'APPROVED').length / milestones.length) * 100 : 0}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* ── MILESTONE BOARD ── */}
                <div className="lg:col-span-2 glass-card p-6 space-y-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <LayoutGrid size={18} className="text-accent" /> Milestone Board
                    </h2>

                    {/* Create Milestone */}
                    {(isTeamMember || isBrand) && project?.status !== 'COMPLETED' && (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="E.g. Script Draft..."
                                className="flex-1 bg-glass-bg border border-border rounded-xl py-2 px-3 text-sm outline-none focus:border-primary transition-all"
                                value={newMilestoneTitle}
                                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && createMilestone()}
                            />
                            <select
                                className="bg-glass-bg border border-border rounded-xl py-2 px-3 text-sm outline-none focus:border-primary transition-all appearance-none cursor-pointer text-text-muted"
                                value={newMilestoneRole}
                                onChange={(e) => setNewMilestoneRole(e.target.value)}
                            >
                                <option value="">Assign Role (Optional)</option>
                                <option value="CREATOR_LEAD">Team Lead</option>
                                {project?.openSlots && (
                                    (() => {
                                        try {
                                            const slots = typeof project.openSlots === 'string' ? JSON.parse(project.openSlots) : project.openSlots;
                                            return Array.isArray(slots) ? (slots as string[]).map((role) => (
                                                <option key={role} value={role}>{role}</option>
                                            )) : null;
                                        } catch {
                                            return null;
                                        }
                                    })()
                                )}
                                <option value="CREATOR">Creator</option>
                            </select>
                            <button
                                onClick={createMilestone}
                                disabled={creatingMilestone || !newMilestoneTitle.trim()}
                                className="btn-primary p-2 flex items-center justify-center disabled:opacity-50"
                            >
                                {creatingMilestone ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            </button>
                        </div>
                    )}

                    {milestones.length === 0 ? (
                        <p className="text-text-muted text-sm italic">No milestones created yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {milestones.map((m) => (
                                <div key={m.id} className={`p-4 rounded-xl border ${STATUS_CLASSES[m.status] ?? 'border-border'} space-y-4`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold">{m.title}</span>
                                            {m.escrowFunded && (
                                                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/30 rounded-full text-[10px] font-bold tracking-wider flex items-center gap-1">
                                                    💰 ESCROW FUNDED
                                                </span>
                                            )}
                                            {m.assignedRole && (
                                                <span className="px-2 py-0.5 bg-accent/10 border border-accent/20 text-accent rounded-full text-[10px] font-bold">
                                                    {m.assignedRole}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-medium">
                                            {STATUS_ICONS[m.status]}
                                            {m.status.replace('_', ' ')}
                                        </div>
                                    </div>

                                    {m.comments && (
                                        <div className="flex gap-2 p-3 bg-glass-bg/40 rounded-xl border border-white/5">
                                            <MessageSquare size={14} className="text-text-muted mt-0.5 shrink-0" />
                                            <p className="text-xs text-text-muted leading-relaxed italic">"{m.comments}"</p>
                                        </div>
                                    )}

                                    {m.feedback && (
                                        <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <Star size={12} className="text-primary fill-primary/20" />
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Brand Feedback / Report</span>
                                            </div>
                                            <p className="text-xs text-[#b8c5e2] leading-relaxed pl-5">
                                                {m.feedback}
                                            </p>
                                        </div>
                                    )}

                                    {/* Creator/Team Member Actions */}
                                    {isTeamMember && (m.status === 'PENDING' || m.status === 'DRAFT' || m.status === 'CHANGES_REQUESTED') && (
                                        <div className="pt-2 space-y-4 border-t border-white/[0.05]">
                                            {m.assignedRole && m.assignedRole !== myRole && myRole !== 'CREATOR_LEAD' && myRole !== 'ADMIN' ? (
                                                <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center gap-2 text-[10px] font-bold text-red-400 uppercase tracking-wider">
                                                    <Lock size={12} /> Restricted: Only {m.assignedRole} can submit
                                                </div>
                                            ) : !m.escrowFunded ? (
                                                <div className="flex flex-col items-center justify-center py-4 bg-glass-bg border border-border border-dashed rounded-xl gap-2 text-text-muted">
                                                    <Lock size={20} className="text-text-muted/50" />
                                                    <p className="text-sm font-medium">Awaiting Escrow Funding</p>
                                                    {isBrand && (
                                                        <button 
                                                            onClick={() => handleFundEscrow(m.id)}
                                                            disabled={fundingMilestone === m.id}
                                                            className="mt-2 px-4 py-1.5 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                                        >
                                                            {fundingMilestone === m.id ? 'Processing...' : 'Fund Escrow Now'}
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {/* File Upload */}
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Option 1: Upload File</label>
                                                        <input
                                                            type="file"
                                                            accept={getAcceptedFileTypes()}
                                                            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                                            className="w-full text-xs text-text-muted file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
                                                        />
                                                    </div>
                                                    
                                                    <div className="relative flex items-center py-1">
                                                        <div className="flex-1 h-px bg-white/5"></div>
                                                        <span className="px-3 text-[10px] font-bold text-text-muted">OR</span>
                                                        <div className="flex-1 h-px bg-white/5"></div>
                                                    </div>

                                                    {/* URL Submission */}
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Option 2: Submit Link</label>
                                                        <div className="flex gap-2">
                                                            <input 
                                                                type="url"
                                                                id={`url-${m.id}`}
                                                                placeholder="Paste link (Figma, GitHub, Google Doc...)"
                                                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary transition-all"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const input = document.getElementById(`url-${m.id}`) as HTMLInputElement;
                                                                    if (input.value) {
                                                                        updateMilestone(m.id, 'SUBMITTED', { isSubmission: true, submissionUrl: input.value });
                                                                    }
                                                                }}
                                                                className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl text-[10px] font-bold hover:bg-primary/20 transition-all"
                                                            >
                                                                Submit Link
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {uploadFile && (
                                                        <button
                                                            onClick={() => updateMilestone(m.id, 'SUBMITTED', { isSubmission: true })}
                                                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent text-white text-xs font-bold shadow-[0_4px_12px_rgba(56,189,248,0.3)] hover:scale-[1.02] transition-all"
                                                        >
                                                            <Upload size={14} /> {m.status === 'CHANGES_REQUESTED' ? 'Resubmit File' : 'Complete with File'}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Team Lead Actions (The Merge) */}
                                    {myRole === 'CREATOR_LEAD' && m.status === 'TEAM_REVIEW' && (
                                        <div className="pt-2 border-t border-white/[0.05] space-y-3">
                                            <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Team Lead Internal Review</p>
                                                    {m.submissionUrl && (
                                                        <a href={m.submissionUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:underline">
                                                            <Paperclip size={12} /> View Draft
                                                        </a>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-[#b8c5e2]">
                                                    This work is currently internal. The Brand <span className="text-indigo-400 font-bold">cannot</span> see it yet. Merge it once you verify quality.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => updateMilestone(m.id, 'SUBMITTED')}
                                                className="w-full py-2 bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20"
                                            >
                                                ✓ Accept & Release to Brand
                                            </button>
                                        </div>
                                    )}

                                    {/* Brand Actions */}
                                    {isBrand && m.status === 'SUBMITTED' && (
                                        <div className="pt-2 border-t border-white/[0.05] space-y-3">
                                            <div className="p-3 bg-glass-bg border border-border rounded-xl space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-semibold text-text-muted uppercase tracking-widest">Deliverable Review</p>
                                                    {m.submissionUrl && (
                                                        <a href={m.submissionUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline">
                                                            <Paperclip size={12} /> View Submission
                                                        </a>
                                                    )}
                                                </div>
                                                
                                                {m.submissionUrl ? (
                                                    <a href={m.submissionUrl} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-2 bg-primary/10 border border-primary/20 rounded-lg text-xs font-bold text-primary hover:bg-primary/20 transition-all">
                                                        ⬇ Download & Audit Submission
                                                    </a>
                                                ) : (
                                                    <p className="text-[11px] text-yellow-500 italic">No file attached. Verify manually before approving.</p>
                                                )}

                                                <div className="space-y-1.5 pt-1">
                                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Your Report / FeedBack</p>
                                                    <textarea 
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs min-h-[80px] focus:border-primary outline-none transition-all placeholder:text-[#4a5578]"
                                                        placeholder="Provide detailed feedback or your review report..."
                                                        value={milestoneFeedback[m.id] || ''}
                                                        onChange={(e) => setMilestoneFeedback(prev => ({ ...prev, [m.id]: e.target.value }))}
                                                    />
                                                </div>

                                                <label className="flex items-start gap-2 pt-1 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        className="mt-1 flex-shrink-0 cursor-pointer w-4 h-4 rounded border-border bg-glass-bg text-primary focus:ring-primary focus:ring-offset-0 transition-all"
                                                        checked={reviewedStates[m.id] || false}
                                                        onChange={(e) => setReviewedStates(prev => ({ ...prev, [m.id]: e.target.checked }))}
                                                    />
                                                    <span className="text-xs text-text-muted leading-tight group-hover:text-text-main transition-colors">
                                                        I have cross-checked the outcomes and confirm they meet the project vision.
                                                    </span>
                                                </label>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateMilestone(m.id, 'APPROVED', { feedback: milestoneFeedback[m.id] })}
                                                    disabled={!reviewedStates[m.id]}
                                                    className="flex-1 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-semibold hover:bg-green-500/20 transition-all disabled:opacity-40"
                                                >
                                                    ✓ Approve Outcome
                                                </button>
                                                <button
                                                    onClick={() => updateMilestone(m.id, 'CHANGES_REQUESTED', { feedback: milestoneFeedback[m.id] || 'Please revise based on the report above.' })}
                                                    className="flex-1 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-all"
                                                >
                                                    ✗ Request Changes
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Rating CTA after completion */}
                    {isCompleted && (
                        <div className="mt-4 border-t border-border pt-4 space-y-3">
                            <p className="text-sm font-semibold text-text-muted">Project Complete! Rate your collaborators:</p>
                            {project.team?.filter((m) => m.userId !== user?.id).map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => { setRatingTarget(m); setShowRatingModal(true); }}
                                    className="w-full flex items-center gap-2 py-2 px-4 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-all"
                                >
                                    <Star size={16} /> Rate {m.user?.profile?.displayName ?? m.role}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── CHAT ── */}
                <div className="lg:col-span-3 glass-card p-0 flex flex-col overflow-hidden" style={{ height: '600px' }}>
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <h2 className="text-sm font-bold flex items-center gap-2">
                            <MessageSquare size={16} className="text-primary" /> 
                            {isTeamChat ? 'Crew Hideout (Private)' : 'Project Channel'}
                        </h2>
                        
                        {isTeamMember && (
                            <div className="flex bg-glass-bg p-1 rounded-xl border border-white/5 scale-90">
                                <button
                                    onClick={() => setIsTeamChat(false)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all ${!isTeamChat ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text-main'}`}
                                >
                                    PROJECT
                                </button>
                                <button
                                    onClick={() => setIsTeamChat(true)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all flex items-center gap-1.5 ${isTeamChat ? 'bg-indigo-500 text-white shadow-lg' : 'text-text-muted hover:text-text-main'}`}
                                >
                                    <Lock size={10} /> CREW
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 p-6 scrollbar-hide">
                        {messages.map((msg) => {
                            const isMe = msg.senderId === user?.id;
                            const isAttachment = !!msg.attachmentUrl;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                                                {msg.sender?.profile?.displayName ?? (msg.sender?.id === project?.brandId ? 'BRAND' : (msg.sender?.role ?? 'User'))}
                                            </span>
                                            {msg.isTeamOnly && <Lock size={10} className="text-indigo-400" />}
                                        </div>
                                        
                                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe
                                            ? 'bg-primary text-white rounded-tr-sm shadow-[0_4px_12px_rgba(56,189,248,0.2)]'
                                            : 'bg-glass-bg border border-border rounded-tl-sm'
                                            }`}>
                                            {isAttachment ? (
                                                <div className="flex flex-col gap-2">
                                                    <p className="text-xs opacity-80 italic">{msg.content}</p>
                                                    <a 
                                                        href={msg.attachmentUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className={`flex items-center gap-2 p-2.5 rounded-xl border ${isMe ? 'bg-white/10 border-white/20' : 'bg-primary/5 border-primary/20'} transition-all hover:scale-[1.02]`}
                                                    >
                                                        <Paperclip size={14} className={isMe ? "text-white" : "text-primary"} />
                                                        <span className="font-bold truncate max-w-[150px]">{msg.attachmentName || 'Attachment'}</span>
                                                    </a>
                                                </div>
                                            ) : (
                                                msg.content
                                            )}
                                        </div>
                                        <span className="text-[10px] text-text-muted/60 font-medium">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 bg-white/[0.01] border-t border-white/5 space-y-3">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={newMsg}
                                onChange={(e) => setNewMsg(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMsg()}
                                placeholder={isTeamChat ? "Share draft or message with crew..." : "Type a message to project channel..."}
                                className="flex-1 bg-glass-bg border border-border rounded-xl py-2.5 px-4 text-sm outline-none focus:border-primary transition-all placeholder:text-text-muted/40"
                            />
                            <button
                                onClick={() => sendMsg()}
                                disabled={sendingMsg || (!newMsg.trim())}
                                className="btn-primary px-4 py-2.5 disabled:opacity-50 shadow-lg shadow-primary/20"
                            >
                                {sendingMsg ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </div>
                        
                        {isTeamChat && (
                            <div className="flex items-center gap-2 pb-1">
                                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 text-[10px] font-bold cursor-pointer hover:bg-indigo-500/20 transition-all uppercase tracking-widest">
                                    <Paperclip size={12} /> Share Resource
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                try {
                                                    setSendingMsg(true);
                                                    const uploadRes = await axios.post('/api/upload', formData, {
                                                        headers: { 'Content-Type': 'multipart/form-data' }
                                                    });
                                                    sendMsg(`Shared team resource: ${file.name}`, uploadRes.data.url, file.name);
                                                } catch (err) {
                                                    console.error('File share failed', err);
                                                } finally {
                                                    setSendingMsg(false);
                                                }
                                            }
                                        }}
                                    />
                                </label>
                                <span className="text-[10px] text-text-muted italic opacity-60">Internal crew-only sharing</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── ACTIVITY FEED SIDEBAR ── */}
                <div className="lg:col-span-5 glass-card p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Clock size={18} className="text-yellow-400" /> Live Project Feed
                        </h2>
                        <span className="text-[10px] font-bold bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-lg border border-yellow-500/20">REAL-TIME</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activities.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-text-muted space-y-2">
                                <Clock size={32} className="mx-auto opacity-20" />
                                <p className="text-sm italic">Broadcasts will appear here as the project evolves.</p>
                            </div>
                        ) : (
                            activities.map((activity) => (
                                <div key={activity.id} className="p-4 bg-glass-bg border border-white/5 rounded-2xl space-y-2 hover:border-white/10 transition-all group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                                {activity.user?.profile?.displayName?.[0] ?? 'A'}
                                            </div>
                                            <span className="text-xs font-bold text-text-main">
                                                {activity.user?.profile?.displayName ?? 'System'}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-text-muted">
                                            {new Date(activity.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-text-muted leading-relaxed">
                                        {activity.content}
                                    </p>
                                    <div className="pt-2 flex items-center gap-2">
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                            activity.type.includes('MILESTONE') ? 'bg-green-500/10 text-green-400' : 'bg-primary/10 text-primary'
                                        }`}>
                                            {activity.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ── RATING MODAL ── */}
            {showRatingModal && ratingTarget && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-8 max-w-md w-full space-y-6 border border-primary/30">
                        <h3 className="text-xl font-bold">
                            Rate {ratingTarget.user?.profile?.displayName ?? ratingTarget.role}
                        </h3>
                        <div className="flex gap-2 justify-center">
                            {[1, 2, 3, 4, 5].map(n => (
                                <button
                                    key={n}
                                    onClick={() => setRatingScore(n)}
                                    className={`text-3xl transition-all ${n <= ratingScore ? 'text-yellow-400 scale-110' : 'text-text-muted/30'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        <textarea
                            className="w-full bg-glass-bg border border-border rounded-xl py-3 px-4 h-24 outline-none focus:border-primary transition-all text-sm"
                            placeholder="Leave a review (optional)..."
                            value={ratingReview}
                            onChange={(e) => setRatingReview(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <button onClick={submitRating} className="btn-primary flex-1 py-3">
                                Submit Rating
                            </button>
                            <button
                                onClick={() => setShowRatingModal(false)}
                                className="flex-1 py-3 rounded-xl border border-border hover:border-text-muted transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Workspace;
