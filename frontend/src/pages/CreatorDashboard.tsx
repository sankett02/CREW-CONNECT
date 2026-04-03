import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
    Loader2, Sparkles, 
    Wallet, Clock, AlertCircle, CheckCircle2,
    Zap, ChevronRight, Shield, ArrowRight
} from 'lucide-react';
import VideoHero from '../components/shared/VideoHero';

interface Project {
    id: string;
    title: string;
    description: string;
    status: string;
    budget: string | number;
    niche: string;
    deadline: string;
    milestones?: any[]; // Added milestones
    team?: any[]; // Added team
}

const CreatorDashboard: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [earnings, setEarnings] = useState({ available: 0, pending: 0, activeEscrow: 0 });
    const [loading, setLoading] = useState(true);
    const [processingAppId, setProcessingAppId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'REVISION'>('ALL');

    const fetchData = async () => {
        if (authLoading || !user) return;
        setLoading(true);
        try {
            const [projRes, appRes, payRes] = await Promise.all([
                axios.get('/api/projects'),
                axios.get('/api/projects/applications/me'),
                axios.get('/api/payments')
            ]);
            
            const myId = user?.id;
            const myProjects = projRes.data.filter((p: any) => 
                p.team?.some((m: any) => m.userId === myId)
            );
            
            setProjects(myProjects);
            setApplications(appRes.data);

            const stats = payRes.data.reduce((acc: any, pay: any) => {
                // Check if user is a recipient in this payment
                let isRecipient = false;
                let amount = 0;

                if (pay.payoutSplit && typeof pay.payoutSplit === 'object') {
                    if (pay.payoutSplit.recipientId === myId) {
                        isRecipient = true;
                        amount = Number(pay.amount);
                    } else if (Array.isArray(pay.payoutSplit.splits)) {
                        const mySplit = pay.payoutSplit.splits.find((s: any) => s.userId === myId);
                        if (mySplit) {
                            isRecipient = true;
                            amount = Number(mySplit.amount);
                        }
                    }
                }

                if (isRecipient) {
                    if (pay.status === 'PAID') {
                        acc.available += amount;
                    } else if (pay.status === 'PAYOUT_RELEASED') {
                        acc.pending += amount;
                    }
                }
                return acc;
            }, { available: 0, pending: 0, activeEscrow: 0 });

            // Calculate ACTIVE (Escrow) from my projects' funded milestones that aren't approved yet
            let activeEscrow = 0;
            for (const proj of myProjects) {
                if (proj.milestones) {
                    const fundedUnapproved = proj.milestones.filter((m: any) => m.escrowFunded && m.status !== 'APPROVED');
                    if (fundedUnapproved.length > 0) {
                        const msBudget = Number(proj.budget) / (proj.milestones.length || 1);
                        const teamSize = proj.team?.filter((tm: any) => tm.role !== 'BRAND').length || 1;
                        activeEscrow += (msBudget / teamSize) * fundedUnapproved.length;
                    }
                }
            }
            stats.activeEscrow = activeEscrow;

            setEarnings(stats);
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user, authLoading]);

    const handleApplicationAction = async (appId: string, status: string) => {
        setProcessingAppId(appId);
        try {
            await axios.put(`/api/projects/applications/${appId}`, { status });
            fetchData();
        } catch (err) {
            console.error('Failed to handle application', err);
        } finally {
            setProcessingAppId(null);
        }
    };

    const activeOrders = projects.filter(p => ['ACTIVE', 'IN_REVISION', 'COMPLETED', 'UNDER_REVIEW'].includes(p.status));
    const invitations = applications.filter(a => a.type === 'INVITATION' && a.status === 'PENDING');

    const filteredOrders = activeOrders.filter(p => {
        if (activeTab === 'ALL') return true;
        if (activeTab === 'REVISION') return p.status === 'IN_REVISION' || p.status === 'UNDER_REVIEW';
        if (activeTab === 'COMPLETED') return p.status === 'COMPLETED';
        return true;
    });

    const counts = {
        all: activeOrders.length,
        revision: activeOrders.filter(p => p.status === 'IN_REVISION' || p.status === 'UNDER_REVIEW').length,
        completed: activeOrders.filter(p => p.status === 'COMPLETED').length
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="animate-spin text-indigo-500" size={48} />
                <p className="text-[#7e8fb5] font-medium animate-pulse">Loading your creative workspace...</p>
            </div>
        );
    }

    return (
        <div className="pb-20">
            {/* HERO SECTION WITH VIDEO - Moved outside constrained container for full width */}
            <VideoHero 
                videoSrc="/assets/videos/Cinematic_Video_Generation_for_CrewConnect.mp4"
                height="65vh"
                videoBlur="blur-[4px]"
                title={
                    <div className="flex flex-col items-center">
                        <span className="text-[#a5b4fc] text-sm font-black uppercase tracking-[0.3em] mb-4 animate-pulse">Welcome Back</span>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none mb-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                             {user?.displayName?.split(' ')[0] || 'Creator'}<span className="text-[#6366f1]">!</span>
                        </h1>
                        <div className="h-1.5 w-32 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-full mt-4" />
                    </div>
                }
                subtitle={
                    <span className="text-slate-300 font-medium text-lg md:text-xl">
                        High-performance tools for world-class creators. Manage your projects, track earnings, and scale your creative business.
                    </span>
                }
                action={
                    <div className="flex gap-4">
                        <Link to="/discover" className="btn-primary px-8 py-4 text-xs font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/40">
                            Find New Gigs
                        </Link>
                        <Link to="/profile/me" className="btn-secondary px-8 py-4 text-xs font-black uppercase tracking-widest bg-white/10 border-white/20 hover:bg-white/20">
                            Public Profile
                        </Link>
                    </div>
                }
            />

            <div className="max-w-7xl mx-auto space-y-12 px-4 md:px-0 mt-12">
                {/* Top Bar / Earnings Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-6">
                <div className="lg:col-span-2 glass-premium p-8 flex flex-col md:flex-row items-center justify-between group">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">Verified Creator</span>
                            <span className="text-xs text-[#7e8fb5] font-bold tracking-tight opacity-70">• Prime Member</span>
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Active Pulse</h2>
                        <p className="text-[#a8b8d8] text-sm font-medium">You have {activeOrders.length} active orders and {invitations.length} invitations.</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 mt-6 md:mt-0">
                         <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:rotate-12 transition-transform duration-700">
                            <Zap size={32} className="fill-indigo-400" />
                        </div>
                    </div>
                </div>

                <div className="glass-premium p-0 overflow-hidden flex flex-col border-emerald-500/20">
                    <div className="bg-emerald-500/10 px-8 py-4 border-b border-emerald-500/10 flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                            <Wallet size={14} /> Earnings
                        </span>
                        <Link to="/payments" className="text-[10px] font-black text-[#7e8fb5] hover:text-emerald-400 transition-colors uppercase tracking-widest">Details →</Link>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="flex justify-between items-end border-b border-white/5 pb-6">
                            <div>
                                <p className="text-[10px] font-black text-[#7e8fb5] uppercase tracking-widest mb-2 opacity-60">Available</p>
                                <h2 className="text-4xl font-black text-white tracking-tighter">${earnings.available.toLocaleString()}</h2>
                            </div>
                            <button className="bg-emerald-500 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 hover:-translate-y-1">
                                Withdraw
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-[10px] font-black text-[#7e8fb5] uppercase tracking-widest mb-1 opacity-60">Pending</p>
                                <p className="text-xl font-black text-white">${earnings.pending.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-[#7e8fb5] uppercase tracking-widest mb-1 opacity-60">Active</p>
                                <p className="text-xl font-black text-indigo-400">${earnings.activeEscrow.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Sidebar: Performance Stats */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="glass-premium p-8 space-y-8">
                        <div className="flex items-center justify-between border-b border-white/5 pb-6">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Performance</h3>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>
                        
                        <div className="space-y-6">
                            {[
                                { label: 'Response Rate', value: '100%', color: 'from-emerald-500 to-teal-400 shadow-emerald-500/20' },
                                { label: 'On-Time Delivery', value: '100%', color: 'from-indigo-500 to-sky-400 shadow-indigo-500/20' },
                                { label: 'Order Completion', value: `${projects.length > 0 ? Math.round((projects.filter(p => p.status === 'COMPLETED').length / projects.length) * 100) : 100}%`, color: 'from-purple-500 to-indigo-400 shadow-purple-500/20' },
                            ].map((stat, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                                        <span className="text-[#a8b8d8]">{stat.label}</span>
                                        <span className="text-white">{stat.value}</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                                        <div className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 shadow-lg`} style={{ width: stat.value }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="pt-6 space-y-4 border-t border-white/5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-[#7e8fb5] font-black uppercase tracking-tighter">Total Withdrawn</span>
                                <span className="text-white font-black text-lg">${earnings.available.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-[#7e8fb5] font-black uppercase tracking-tighter">Response Time</span>
                                <span className="text-indigo-400 font-black">1 hr</span>
                            </div>
                        </div>
                    </div>

                    {/* Side Informational Card */}
                    <Link to="/milestone-guide" className="glass-premium overflow-hidden group h-64 relative block border-indigo-500/30 bg-indigo-950/40 hover:bg-indigo-900/40 transition-all duration-500">
                        <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-[#080d1a] to-transparent">
                            <div className="mb-4 w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                <Shield size={24} />
                            </div>
                            <h4 className="text-white font-black text-2xl uppercase tracking-tighter mb-2 group-hover:text-indigo-400 transition-colors">Creator Security</h4>
                            <p className="text-sm text-[#7e8fb5] font-bold leading-snug">
                                Learn about our Milestone Payment System and Escrow protection.
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 group-hover:translate-x-2 transition-transform">
                                View Guide <ArrowRight size={12} />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Main Content: Active Orders & Invitations */}
                <div className="lg:col-span-3 space-y-10">
                    {/* invitations if any */}
                    {invitations.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    <Sparkles className="text-amber-400 fill-amber-400" size={24} /> Prime Invitations
                                </h2>
                                <span className="bg-amber-400/20 text-amber-400 text-[10px] font-black px-3 py-1 rounded-full border border-amber-400/20 tracking-[0.2em]">PRIORITY</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {invitations.map(inv => (
                                    <div key={inv.id} className="glass-premium p-8 border-amber-400/20 bg-amber-400/[0.03] hover:bg-amber-400/[0.05] relative overflow-hidden group transition-all duration-500">
                                        <div className="flex flex-col gap-6">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest">{inv.project?.niche || 'Specialized'}</span>
                                                        <span className="bg-amber-400/20 text-white text-[9px] font-black px-2 py-0.5 rounded-full border border-amber-400/20 uppercase tracking-tighter">Direct</span>
                                                    </div>
                                                    <h3 className="text-xl font-black text-white leading-tight transition-colors group-hover:text-amber-400">{inv.project?.title}</h3>
                                                    <p className="text-[11px] text-[#7e8fb5] font-bold italic mt-2 flex items-center gap-2">
                                                        <Sparkles size={12} className="text-amber-400" /> 
                                                        Invited by <span className="text-white not-italic">{inv.project?.brand?.profile?.displayName || 'Elite Brand'}</span>
                                                    </p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <span className="text-[10px] text-[#7e8fb5] uppercase font-black block opacity-60">Reserved</span>
                                                    <span className="text-emerald-400 font-black text-2xl tracking-tighter">${Number(inv.project?.budget).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                                                <p className="text-[11px] text-[#a8b8d8] leading-relaxed italic opacity-80">
                                                    "Elite brand Match: This creative brief was specifically designated for your skill-level and past performance."
                                                </p>
                                            </div>
                                            <div className="flex gap-4">
                                                <button 
                                                    onClick={() => handleApplicationAction(inv.id, 'ACCEPTED')} 
                                                    disabled={processingAppId === inv.id}
                                                    className="btn-primary flex-1 py-3 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20"
                                                >
                                                    {processingAppId === inv.id ? <Loader2 className="animate-spin" size={14} /> : 'Accept & Deploy'}
                                                </button>
                                                <button 
                                                    onClick={() => handleApplicationAction(inv.id, 'REJECTED')}
                                                    disabled={processingAppId === inv.id}
                                                    className="bg-white/5 text-white/40 hover:text-white px-6 py-3 rounded-2xl text-[11px] font-black border border-white/5 flex items-center justify-center gap-2 transition-all hover:bg-white/10"
                                                >
                                                    {processingAppId === inv.id ? <Loader2 className="animate-spin" size={14} /> : 'Decline'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Active Orders Section */}
                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
                            <h2 className="text-2xl font-black text-white tracking-tight">Project Workspace</h2>
                            <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-[#7e8fb5]">
                                {(['ALL', 'REVISION', 'COMPLETED'] as const).map(tab => (
                                    <span 
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`cursor-pointer transition-all relative py-2 ${activeTab === tab ? 'text-indigo-400' : 'hover:text-white'}`}
                                    >
                                        {tab} ({counts[tab === 'ALL' ? 'all' : tab === 'REVISION' ? 'revision' : 'completed']})
                                        {activeTab === tab && (
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-400 rounded-full"></div>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {filteredOrders.length === 0 ? (
                            <div className="glass-premium p-24 text-center space-y-6 border-dashed border-white/10 bg-white/[0.01]">
                                <div className="w-24 h-24 mx-auto rounded-[2rem] bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group hover:rotate-12 transition-transform duration-700">
                                    <Clock size={40} />
                                </div>
                                <div className="space-y-2 max-w-sm mx-auto">
                                    <h3 className="text-3xl font-black text-white leading-tight">No {activeTab.toLowerCase()} orders yet</h3>
                                    <p className="text-[#a8b8d8] text-sm font-medium">Your active orders and revision cycles will manifest here once you begin working.</p>
                                </div>
                                {activeTab === 'ALL' && (
                                    <Link to="/discover" className="btn-primary inline-flex py-4 px-10 text-xs font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/20 mt-6">
                                        Explore Opportunities
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                                <div className="grid grid-cols-1 gap-6">
                                    {filteredOrders.map(order => (
                                        <Link to={`/workspace/${order.id}`} key={order.id} className="glass-premium p-8 flex flex-col md:flex-row items-center gap-8 group hover:border-indigo-400/30 transition-all duration-500">
                                            <div className="w-full md:w-40 h-24 rounded-2xl bg-white/5 border border-white/5 overflow-hidden flex-shrink-0 relative">
                                                <div className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-[10px] uppercase tracking-widest group-hover:scale-110 transition-transform duration-700">
                                                    Workspace
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">{order.niche}</span>
                                                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                                    <span className="text-[11px] font-black text-[#4a5578] uppercase tracking-widest">Order #C-{order.id.split('-')[0].toUpperCase()}</span>
                                                </div>
                                                <h3 className="text-2xl font-black text-white truncate group-hover:text-indigo-300 transition-colors tracking-tight leading-tight">{order.title}</h3>
                                                <div className="flex items-center gap-6 pt-2">
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <Clock size={16} className={order.status === 'COMPLETED' ? 'text-emerald-400' : 'text-amber-400'} />
                                                        <span className={`font-black uppercase tracking-tighter ${order.status === 'COMPLETED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                            {order.status === 'COMPLETED' ? 'Project Completed' : 'Final Submission: 3 Days'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-[#a8b8d8]">
                                                        {order.status === 'COMPLETED' ? (
                                                            <CheckCircle2 size={16} className="text-emerald-400" />
                                                        ) : (
                                                            <AlertCircle size={16} className="text-indigo-400" />
                                                        )}
                                                        <span className="font-black uppercase tracking-tighter">{order.status.replace('_', ' ')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-row md:flex-col items-center md:items-end gap-6 w-full md:w-auto mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-white/5 justify-between">
                                                <div className="text-right">
                                                    <p className="text-[11px] font-black text-[#7e8fb5] uppercase tracking-widest mb-1 opacity-60">Revenue</p>
                                                    <p className="text-3xl font-black text-white tracking-tighter">${Number(order.budget).toLocaleString()}</p>
                                                </div>
                                                <div className="flex items-center gap-2 px-6 py-3 bg-indigo-500 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest shadow-xl shadow-indigo-500/20 group-hover:bg-indigo-600 transition-all hover:-translate-y-1">
                                                    {order.status === 'COMPLETED' ? 'View Details' : 'Collaborate'}
                                                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};

export default CreatorDashboard;
