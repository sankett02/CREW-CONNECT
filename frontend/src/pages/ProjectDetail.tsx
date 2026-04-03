import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoginComponent from '../components/auth/LoginComponent';
import {
    Calendar, DollarSign, Tag, Users, Send, Loader2, CheckCircle2,
    Plus, Trash2, ArrowLeft, UserCircle2, LayoutGrid, CreditCard, Star, Zap
} from 'lucide-react';

const ProjectDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [message, setMessage] = useState('');
    const [appliedRole, setAppliedRole] = useState('CREATOR');
    const [showApplyPanel, setShowApplyPanel] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [processingAppId, setProcessingAppId] = useState<string | null>(null);

    // Team builder state (only visible to CREATOR_LEAD of this project)
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberRole, setNewMemberRole] = useState('WRITER');
    const [addingMember, setAddingMember] = useState(false);
    
    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        niche: '',
        budget: '',
        deadline: '',
        openSlots: [] as string[],
    });
    const [isUpdating, setIsUpdating] = useState(false);

    // Ratings state
    const [ratings, setRatings] = useState<any[]>([]);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await axios.get(`/api/projects/${id}`);
                setProject(res.data);

                // Try to infer default role from openSlots if available
                if (res.data.openSlots) {
                    try {
                        const slots = JSON.parse(res.data.openSlots);
                        if (slots.length > 0) setAppliedRole(slots[0]);
                    } catch {
                        // ignore parse error natively
                    }
                }
            } catch (err) {
                console.error('Failed to fetch project', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    useEffect(() => {
        if (project) {
            setEditForm({
                title: project.title,
                description: project.description,
                niche: project.niche,
                budget: project.budget.toString(),
                deadline: project.deadline.split('T')[0], // Extract date part
                openSlots: (() => {
                    try {
                        const parsed = JSON.parse(project.openSlots || '[]');
                        return Array.isArray(parsed) ? parsed : ['CREATOR'];
                    } catch { return ['CREATOR']; }
                })(),
            });
        }
    }, [project]);
    
    const AVAILABLE_ROLES = ['CREATOR', 'WRITER', 'EDITOR'];
    
    const toggleEditRole = (role: string) => {
        setEditForm(prev => {
            const current = prev.openSlots;
            if (current.includes(role)) {
                if (current.length === 1) return prev; // Must have at least one role
                return { ...prev, openSlots: current.filter(r => r !== role) };
            }
            return { ...prev, openSlots: [...current, role] };
        });
    };

    const isLead = project?.team?.some(
        (m: any) => m.userId === user?.id && m.role === 'CREATOR_LEAD'
    );
    const isTeamMember = project?.team?.some(
        (m: any) => m.userId === user?.id
    );

    useEffect(() => {
        const fetchRatings = async () => {
            if (project?.status === 'COMPLETED') {
                try {
                    const res = await axios.get(`/api/projects/${id}/ratings`);
                    setRatings(res.data);
                } catch (err) {
                    console.error('Failed to fetch ratings', err);
                }
            }
        };
        fetchRatings();
    }, [id, project?.status]);

    const handleApply = async () => {
        setApplying(true);
        try {
            await axios.post(`/api/projects/${id}/apply`, { message, appliedRole });
            setApplied(true);
            setShowApplyPanel(false);
        } catch (err) {
            console.error('Application failed', err);
        } finally {
            setApplying(false);
        }
    };

    const isBrand = user?.id === project?.brandId;

    const handleApplication = async (appId: string, status: string) => {
        setProcessingAppId(appId);
        try {
            await axios.put(`/api/projects/applications/${appId}`, { status });
            const res = await axios.get(`/api/projects/${id}`);
            setProject(res.data);
        } catch (err) {
            console.error('Failed to handle application', err);
        } finally {
            setProcessingAppId(null);
        }
    };

    const handleAddMember = async () => {
        setAddingMember(true);
        try {
            await axios.post(`/api/projects/${id}/team`, {
                email: newMemberEmail,
                role: newMemberRole,
            });
            const res = await axios.get(`/api/projects/${id}`);
            setProject(res.data);
            setNewMemberEmail('');
        } catch (err) {
            console.error('Failed to add member', err);
        } finally {
            setAddingMember(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        try {
            await axios.delete(`/api/projects/${id}/team/${memberId}`);
            const res = await axios.get(`/api/projects/${id}`);
            setProject(res.data);
        } catch (err) {
            console.error('Failed to remove member', err);
        }
    };

    const handleUpdateProject = async () => {
        setIsUpdating(true);
        try {
            const res = await axios.patch(`/api/projects/${id}`, {
                ...editForm,
                openSlots: JSON.stringify(editForm.openSlots)
            });
            setProject({ ...project, ...res.data });
            setIsEditing(false);
        } catch (err) {
            console.error('Update failed', err);
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center py-20 text-text-muted">
                Project not found. <Link to="/discover" className="text-primary hover:underline">Back to Discovery</Link>
            </div>
        );
    }

    const statusColor: Record<string, string> = {
        DRAFT: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30',
        ACTIVE: 'bg-green-500/10 text-green-400 border border-green-500/30',
        COMPLETED: 'bg-primary/10 text-primary border border-primary/30',
        CANCELLED: 'bg-red-500/10 text-red-400 border border-red-500/30',
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Link to="/discover" className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors text-sm">
                <ArrowLeft size={16} /> Back to Discovery
            </Link>

            {/* Hero Card */}
            <div className="glass-card p-8 space-y-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor[project.status]}`}>
                            {project.status}
                        </span>
                        <h1 className="text-3xl font-bold mt-3 mb-1">{project.title}</h1>
                        <p className="text-text-muted">
                            by <span className="text-text-main font-medium">{project.brand?.profile?.displayName ?? 'Brand'}</span>
                        </p>
                    </div>
                    {user?.role !== 'BRAND' && !applied && !isTeamMember && project.status !== 'COMPLETED' && (
                        <div>
                            {!showApplyPanel ? (
                                <button
                                    onClick={() => {
                                        if (!user) {
                                            setShowLoginModal(true);
                                        } else {
                                            setShowApplyPanel(true);
                                        }
                                    }}
                                    className="btn-primary flex items-center gap-2 px-6 py-3"
                                >
                                    <Send size={18} /> Apply Now
                                </button>
                            ) : null}
                        </div>
                    )}
                    {isBrand && !isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 px-6 py-3 rounded-xl font-bold transition-all h-fit self-start flex items-center gap-2"
                        >
                            <Zap size={18} className="text-yellow-400" /> Edit Brief
                        </button>
                    )}
                    {applied && !isTeamMember && (
                        <span className="flex items-center gap-2 text-green-400 font-medium">
                            <CheckCircle2 size={20} /> Application Sent!
                        </span>
                    )}

                    {/* Navigation for accepted Team Members or Brand */}
                    {(isTeamMember || isBrand) && (
                        <div className="flex gap-3">
                            <Link to={`/workspace/${id}`} className="btn-primary flex items-center gap-2 px-5 py-2.5">
                                <LayoutGrid size={18} /> Workspace
                            </Link>
                            {isBrand && (
                                <Link to={`/payments/${id}`} className="px-5 py-2.5 rounded-xl border border-border hover:border-text-main transition-all flex items-center gap-2 text-text-main font-semibold bg-glass-bg">
                                    <CreditCard size={18} /> Payments
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <div className="space-y-6 pt-4 border-t border-white/5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Project Title</label>
                                <input
                                    className="input py-2.5"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Niche</label>
                                <select
                                    className="input py-2.5 appearance-none cursor-pointer"
                                    value={editForm.niche}
                                    onChange={(e) => setEditForm({ ...editForm, niche: e.target.value })}
                                    style={{ background: 'rgba(8,13,30,0.8)' }}
                                >
                                    {['YouTube', 'Instagram', 'TikTok', 'Shorts/Reels', 'UGC', 'Podcast', 'Branding', 'Photography', 'Animation', 'Software', 'Web Development', 'Writing', 'Other'].map(n => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Description / Detailed Brief</label>
                            <textarea
                                className="input h-64 resize-none leading-relaxed"
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Budget (USD)</label>
                                <input
                                    type="number"
                                    className="input py-2.5"
                                    value={editForm.budget}
                                    onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Deadline</label>
                                <input
                                    type="date"
                                    className="input py-2.5"
                                    value={editForm.deadline}
                                    onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Required Team Roles</label>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_ROLES.map(role => {
                                    const isSelected = editForm.openSlots.includes(role);
                                    return (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => toggleEditRole(role)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${isSelected
                                                ? 'bg-accent/20 border-accent text-accent shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                                                : 'bg-glass-bg border-border text-text-muted hover:border-text-muted/50'
                                                }`}
                                        >
                                            {role}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={handleUpdateProject}
                                disabled={isUpdating}
                                className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                            >
                                {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                Save Changes
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-8 py-3 rounded-xl border border-border hover:border-text-muted transition-all font-bold text-text-muted"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-text-muted leading-relaxed whitespace-pre-wrap">{project.description}</p>
                )}

                <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2 text-sm glass-card px-4 py-2">
                        <Tag size={16} className="text-primary" />
                        <span>{project.niche}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm glass-card px-4 py-2">
                        <DollarSign size={16} className={isBrand ? "text-indigo-400" : "text-green-400"} />
                        <div className="flex flex-col">
                            <span className="font-bold underline decoration-dotted decoration-white/20" title={isBrand ? "Base Budget + 3% Processing" : "Base Budget"}>
                                ${isBrand
                                    ? (parseFloat(project.budget) * 1.03).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                    : parseFloat(project.budget).toLocaleString()
                                }
                            </span>
                            <span className="text-[10px] text-text-muted">
                                {isBrand ? 'Total Cost (incl. 3% fee)' : 'Project Budget'}
                            </span>
                        </div>
                    </div>
                    {!isBrand && (
                        <div className="flex items-center gap-2 text-sm glass-card px-4 py-2 border-indigo-500/20 bg-indigo-500/5">
                            <Zap size={16} className="text-indigo-400" />
                            <div className="flex flex-col">
                                <span className="font-bold text-indigo-300">
                                    ${(parseFloat(project.budget) * 0.90).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <span className="text-[10px] text-indigo-400/70 font-medium">Estimated Payout (Net)</span>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-sm glass-card px-4 py-2">
                        <Calendar size={16} className="text-accent" />
                        <span>{new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* Apply Panel */}
            {showApplyPanel && (
                <div className="glass-card p-6 space-y-4 border border-primary/30">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Send size={18} className="text-primary" /> Join the Team
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-text-muted mb-2 block">Applying for Role:</label>
                            <div className="flex flex-wrap gap-2">
                                {(() => {
                                    const slots = (() => {
                                        try {
                                            const parsed = JSON.parse(project.openSlots || '[]');
                                            return parsed.length > 0 ? parsed : ['CREATOR', 'WRITER', 'EDITOR'];
                                        } catch { return ['CREATOR', 'WRITER', 'EDITOR']; }
                                    })();
                                    return slots.map((role: string) => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => setAppliedRole(role)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                                                appliedRole === role
                                                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                                                    : 'bg-glass-bg border-border text-text-muted hover:border-primary/40 hover:text-text-main'
                                            }`}
                                        >
                                            {role.charAt(0) + role.slice(1).toLowerCase()}
                                        </button>
                                    ));
                                })()}
                            </div>
                        </div>

                        <textarea
                            className="w-full bg-glass-bg border border-border rounded-xl py-3 px-4 h-28 outline-none focus:border-primary transition-all text-sm"
                            placeholder="Tell the brand or team lead why you're the perfect fit for this role..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleApply} disabled={applying} className="btn-primary flex items-center gap-2 px-6 py-3">
                            {applying ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                            Submit Application
                        </button>
                        <button onClick={() => setShowApplyPanel(false)} className="px-6 py-3 rounded-xl border border-border hover:border-text-muted transition-all">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Applications Panel (For Brands) */}
            {isBrand && project.applications?.filter((a: any) => a.status !== 'REJECTED').length > 0 && (
                <div className="glass-card p-6 space-y-5">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                        <Users size={20} className="text-accent" /> Project Applications
                    </h3>
                    <div className="space-y-3">
                        {project.applications.filter((a: any) => a.status !== 'REJECTED').map((app: any) => (
                            <div key={app.id} className="flex flex-col md:flex-row items-start md:items-center justify-between bg-glass-bg px-4 py-3 rounded-xl border border-border gap-4">
                                <div>
                                    <p className="font-medium">
                                        {app.creator?.profile?.displayName ?? app.creator?.email}
                                        <span className="ml-2 text-xs font-bold text-accent px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                                            {app.appliedRole || 'CREATOR'}
                                        </span>
                                    </p>
                                    <p className="text-sm text-text-muted mt-1 italic">"{app.message}"</p>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-[#7e8fb5] mt-2 block">Status: {app.status}</span>
                                </div>
                                  {app.status === 'PENDING' && (
                                    <div className="flex gap-2">
                                        <Link 
                                            to={`/profile/${app.creatorId}`} 
                                            className="px-3 py-1.5 rounded-lg border border-border hover:border-text-main hover:bg-white/5 text-text-muted transition-all text-sm flex items-center gap-1 font-bold"
                                        >
                                            <UserCircle2 size={14} /> Profile
                                        </Link>
                                        <button 
                                            onClick={() => handleApplication(app.id, 'ACCEPTED')} 
                                            disabled={processingAppId === app.id}
                                            className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1 disabled:opacity-70"
                                        >
                                            {processingAppId === app.id ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                                            Accept
                                        </button>
                                        <button 
                                            onClick={() => handleApplication(app.id, 'REJECTED')} 
                                            disabled={processingAppId === app.id}
                                            className="px-3 py-1.5 rounded-lg border border-border hover:border-red-400/50 hover:bg-red-400/10 text-red-400 transition-all text-sm disabled:opacity-50"
                                        >
                                            {processingAppId === app.id ? <Loader2 className="animate-spin" size={14} /> : 'Reject'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Team Panel */}
            <div className="glass-card p-6 space-y-5">
                <h3 className="text-xl font-bold flex items-center gap-3">
                    <Users size={20} className="text-accent" /> Project Team
                </h3>

                {project.team?.length > 0 ? (
                    <div className="space-y-3">
                        {project.team.map((member: any) => (
                            <div key={member.id} className="flex items-center justify-between bg-glass-bg px-4 py-3 rounded-xl border border-border">
                                <div className="flex items-center gap-3">
                                    <UserCircle2 size={36} className="text-primary" />
                                    <div>
                                        <p className="font-medium">{member.user?.profile?.displayName ?? member.user?.email}</p>
                                        <p className="text-xs text-text-muted">{member.role}</p>
                                    </div>
                                </div>
                                {isLead && member.role !== 'CREATOR_LEAD' && (
                                    <button
                                        onClick={() => handleRemoveMember(member.id)}
                                        className="text-red-400 hover:text-red-300 transition-colors p-2"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-text-muted italic py-4">No team members yet.</p>
                )}

                {/* Team Builder – only for Creator Lead */}
                {isLead && (
                    <div className="border-t border-border pt-5 space-y-4">
                        <h4 className="font-semibold text-sm text-text-muted uppercase tracking-wider">Add Team Member</h4>
                        <div className="flex gap-3 flex-wrap">
                            <input
                                type="text"
                                placeholder="User Email"
                                className="flex-1 min-w-[200px] bg-glass-bg border border-border rounded-xl py-2.5 px-4 outline-none focus:border-primary transition-all text-sm"
                                value={newMemberEmail}
                                onChange={(e) => setNewMemberEmail(e.target.value)}
                            />
                            <select
                                className="bg-glass-bg border border-border rounded-xl py-2.5 px-4 outline-none focus:border-primary transition-all text-sm appearance-none"
                                value={newMemberRole}
                                onChange={(e) => setNewMemberRole(e.target.value)}
                            >
                                <option value="CREATOR" className="bg-bg-main">Creator</option>
                                <option value="WRITER" className="bg-bg-main">Writer</option>
                                <option value="EDITOR" className="bg-bg-main">Editor</option>
                            </select>
                            <button
                                onClick={handleAddMember}
                                disabled={addingMember || !newMemberEmail}
                                className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-50"
                            >
                                {addingMember ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                                Add
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Project Reviews Panel (Visible when COMPLETED) */}
            {project?.status === 'COMPLETED' && ratings.length > 0 && (
                <div className="glass-card p-6 space-y-5">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                        <Star size={20} className="text-amber-400" /> Project Reviews
                    </h3>
                    <div className="space-y-4">
                        {ratings.map((rating: any) => (
                            <div key={rating.id} className="bg-glass-bg p-4 rounded-xl border border-border">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="text-sm font-semibold">{rating.reviewer?.profile?.displayName} <span className="text-text-muted font-normal mx-1">reviewed</span> {rating.reviewee?.profile?.displayName}</p>
                                    </div>
                                    <div className="flex text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < rating.score ? "currentColor" : "none"} className={i >= rating.score ? "text-border" : ""} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-text-muted italic">"{rating.review}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Centered Login Modal Overlay */}
            {showLoginModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-md">
                        {/* Close button */}
                        <button
                            onClick={() => setShowLoginModal(false)}
                            className="absolute -top-12 right-0 md:-right-12 md:top-0 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all z-10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                        
                        {/* The Reusable Login Component */}
                        <div className="bg-[#0b1120] rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative">
                            {/* Inner glows for modal */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
                            <div className="p-4 md:p-6">
                                <LoginComponent isModal={true} onSuccess={() => setShowLoginModal(false)} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetail;
