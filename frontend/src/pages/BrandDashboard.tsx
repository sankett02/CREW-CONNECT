import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
    Plus, Briefcase, Users, CheckCircle2, TrendingUp, 
    Loader2, RotateCcw, Sparkles,
    Clock, Search, Filter, ChevronRight,
    Zap, PlayCircle, ShieldCheck
} from 'lucide-react';
import VideoHero from '../components/shared/VideoHero';

interface Project {
    id: string;
    brandId: string;
    title: string;
    description: string;
    status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    budget: string | number;
    deadline: string;
    completedAt?: string;
    team?: any[];
    milestones?: any[];
}

const BrandDashboard: React.FC = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'DELIVERED' | 'COMPLETED'>('ALL');

    useEffect(() => {
        axios.get('/api/projects')
            .then(r => setProjects(r.data.filter((p: Project) => p.brandId === user?.id)))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    const filteredProjects = projects.filter(p => {
        if (activeTab === 'ALL') return true;
        if (activeTab === 'ACTIVE') return p.status === 'ACTIVE';
        if (activeTab === 'COMPLETED') return p.status === 'COMPLETED';
        if (activeTab === 'DELIVERED') {
            return p.milestones?.some((m: any) => m.status === 'SUBMITTED');
        }
        return true;
    });

    const stats = {
        active: projects.filter(p => p.status === 'ACTIVE').length,
        delivered: projects.filter(p => p.milestones?.some((m: any) => m.status === 'SUBMITTED')).length,
        completed: projects.filter(p => p.status === 'COMPLETED').length,
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="animate-spin text-indigo-500" size={48} />
                <p className="text-[#7e8fb5] font-medium animate-pulse">Accessing your brand portal...</p>
            </div>
        );
    }

    return (
        <div className="pb-20">
            {/* HERO SECTION WITH VIDEO - Moved outside constrained container for full width */}
            <VideoHero 
                videoSrc="/assets/videos/Cinematic_Startup_Hero_Background_Video.mp4"
                height="65vh"
                videoBlur="blur-[4px]"
                title={
                    <div className="flex flex-col items-center">
                        <span className="text-[#a5b4fc] text-sm font-black uppercase tracking-[0.3em] mb-4 animate-pulse">Your Vision</span>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none mb-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                             Amplified<span className="text-[#6366f1]">.</span>
                        </h1>
                        <div className="h-1.5 w-32 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-full mt-4" />
                    </div>
                }
                subtitle={
                    <span className="text-slate-300 font-medium text-lg md:text-xl">
                        High-performance teams for world-class content. Track your creative projects and crew performance in real-time.
                    </span>
                }
                action={
                    <div className="flex gap-4">
                        <Link to="/post" className="btn-primary px-8 py-4 text-xs font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/40">
                            <Plus size={16} className="mr-2" /> Launch New Brief
                        </Link>
                        <Link to="/talent" className="btn-secondary px-8 py-4 text-xs font-black uppercase tracking-widest bg-white/10 border-white/20 hover:bg-white/20">
                            <Search size={16} className="mr-2" /> Explore Talent
                        </Link>
                    </div>
                }
            />

            <div className="max-w-7xl mx-auto space-y-12 px-4 md:px-0 mt-12">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
                {[
                    { label: 'Active Projects', value: stats.active, icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-400/20' },
                    { label: 'Pending Approval', value: stats.delivered, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/20' },
                    { label: 'Completed works', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/20' },
                ].map((stat, i) => (
                    <div key={i} className="glass-premium p-8 flex items-center justify-between group">
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold text-[#7e8fb5] uppercase tracking-widest group-hover:text-white transition-colors">{stat.label}</p>
                            <h3 className="text-4xl font-black text-white">{stat.value}</h3>
                        </div>
                        <div className={`p-5 rounded-3xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                            <stat.icon size={28} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Video Feature Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-premium overflow-hidden group h-64 relative">
                    <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-1000">
                        <source src="/assets/videos/Cinematic_Video_Generation_for_CrewConnect.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#080d1a] via-[#080d1a]/80 to-transparent p-10 flex flex-col justify-center">
                        <div className="flex items-center gap-3 text-indigo-400 mb-3">
                            <PlayCircle size={24} />
                            <span className="text-xs font-black uppercase tracking-widest">Guide</span>
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">How it Works</h3>
                        <p className="text-sm text-[#a8b8d8] max-w-xs leading-relaxed">Master the CrewConnect workflow and accelerate your content delivery cycle.</p>
                        <button className="text-xs font-bold text-white mt-4 flex items-center gap-2 hover:gap-3 transition-all underline underline-offset-4">
                            Watch the explainer <ChevronRight size={14} />
                        </button>
                    </div>
                </div>

                <div className="glass-premium overflow-hidden group h-64 relative">
                    <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-1000">
                        <source src="/assets/videos/Premium_Trust_Video_For_CrewConnect.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#080d1a] via-[#080d1a]/80 to-transparent p-10 flex flex-col justify-center">
                        <div className="flex items-center gap-3 text-emerald-400 mb-3">
                            <ShieldCheck size={24} />
                            <span className="text-xs font-black uppercase tracking-widest">Security</span>
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Trust & Quality</h3>
                        <p className="text-sm text-[#a8b8d8] max-w-xs leading-relaxed">Our multi-tier verification ensures you only work with the top 1% of creative talent.</p>
                        <button className="text-xs font-bold text-white mt-4 flex items-center gap-2 hover:gap-3 transition-all underline underline-offset-4">
                            Learn about verification <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Order Management Section */}
            <div className="space-y-8">
                {/* Tabs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-4">
                    <div className="flex gap-10">
                        {(['ALL', 'ACTIVE', 'DELIVERED', 'COMPLETED'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-2 text-xs font-black uppercase tracking-widest transition-all relative ${
                                    activeTab === tab ? 'text-indigo-400' : 'text-[#7e8fb5] hover:text-white'
                                }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-[-17px] left-0 right-0 h-[3px] bg-indigo-400 rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300"></div>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5578] group-focus-within:text-indigo-400 transition-colors" size={14} />
                            <input 
                                type="text" 
                                placeholder="Search orders..." 
                                className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-[10px] font-bold text-white w-64 focus:border-indigo-500/50 transition-all outline-none"
                            />
                        </div>
                        <button className="text-[10px] font-black text-[#7e8fb5] hover:text-white flex items-center gap-2 uppercase tracking-widest">
                            <Filter size={14} /> Filter
                        </button>
                    </div>
                </div>

                {/* Project List */}
                {filteredProjects.length === 0 ? (
                    <div className="glass-premium p-24 text-center space-y-6 border-dashed border-white/10 bg-white/[0.01]">
                        <div className="w-24 h-24 mx-auto rounded-[2rem] bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group hover:rotate-12 transition-transform duration-700">
                            <Briefcase size={40} />
                        </div>
                        <div className="space-y-2 max-w-sm mx-auto">
                            <h3 className="text-3xl font-black text-white leading-tight">No {activeTab.toLowerCase()} projects found</h3>
                            <p className="text-[#a8b8d8] text-sm font-medium">Ready to start something amazing? Launch your next creative project today.</p>
                            <Link to="/post" className="btn-primary mt-6 px-10 py-4 text-xs font-black uppercase tracking-widest">
                                Start Your Journey
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                        <div className="grid grid-cols-1 gap-6">
                            {filteredProjects.map(p => {
                                const completedMilestones = p.milestones?.filter(m => m.status === 'APPROVED').length || 0;
                                const totalMilestones = p.milestones?.length || 1;
                                const progress = Math.round((completedMilestones / totalMilestones) * 100);

                                return (
                                    <div key={p.id} className="glass-premium p-0 overflow-hidden flex flex-col md:flex-row group border-white/5">
                                        <div className="w-full md:w-72 bg-white/[0.02] p-10 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-white/5 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-sky-500"></div>
                                            <div className="w-24 h-24 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 mb-6 group-hover:scale-110 transition-transform duration-700 shadow-2xl shadow-indigo-500/10">
                                                <Zap size={40} className="fill-indigo-500" />
                                            </div>
                                            <div className="text-center space-y-1">
                                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7e8fb5] opacity-60">Investment</span>
                                                <p className="text-3xl font-black text-white">${Number(p.budget).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 p-10 space-y-8 flex flex-col">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                                            p.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                                            p.status === 'ACTIVE' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                        }`}>
                                                            {p.status === 'COMPLETED' ? 'DELIVERED' : p.status}
                                                        </span>
                                                        <span className="text-[10px] font-black text-[#4a5578] uppercase tracking-[0.15em]">Ref ID: {p.id.split('-')[0].toUpperCase()}</span>
                                                    </div>
                                                    <Link to={`/projects/${p.id}`}>
                                                        <h3 className="text-2xl font-black text-white hover:text-indigo-400 transition-all tracking-tight leading-tight">{p.title}</h3>
                                                    </Link>
                                                </div>
                                                <div className="flex -space-x-4">
                                                    {p.team?.slice(0, 4).map((m, i) => (
                                                        <div key={i} className="w-12 h-12 rounded-2xl border-4 border-[#0a0f1d] bg-indigo-950 flex items-center justify-center text-xs font-black text-white overflow-hidden shadow-xl ring-1 ring-white/10">
                                                            {m.user?.profile?.profileImage ? <img src={m.user.profile.profileImage} className="w-full h-full object-cover" /> : <Users size={20} />}
                                                        </div>
                                                    ))}
                                                    {(p.team?.length || 0) > 4 && (
                                                        <div className="w-12 h-12 rounded-2xl border-4 border-[#0a0f1d] bg-[#1a1f35] flex items-center justify-center text-[11px] font-black text-white shadow-xl">
                                                            +{p.team!.length - 4}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                                    <span className="text-[#a8b8d8]">Milestone Completion</span>
                                                    <span className="text-indigo-400">{progress}%</span>
                                                </div>
                                                <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-[2px]">
                                                    <div className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-sky-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: `${progress}%` }}></div>
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-white/5">
                                                <div className="flex flex-wrap items-center gap-8">
                                                    <div className="flex items-center gap-3 text-xs">
                                                        <div className="w-8 h-8 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 border border-amber-400/20">
                                                            <Clock size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-[#4a5578] uppercase tracking-tighter">Timeline</p>
                                                            <p className="text-white font-bold">
                                                                {p.status === 'COMPLETED' ? 'Finished On: ' : 'Due In: '}
                                                                {p.status === 'COMPLETED' 
                                                                    ? (p.completedAt ? new Date(p.completedAt).toLocaleDateString() : 'Recently')
                                                                    : `${Math.max(0, Math.ceil((new Date(p.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} Days`
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs">
                                                        <div className="w-8 h-8 rounded-xl bg-indigo-400/10 flex items-center justify-center text-indigo-400 border border-indigo-400/20">
                                                            <Sparkles size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-[#4a5578] uppercase tracking-tighter">Velocity</p>
                                                            <p className={`font-bold ${
                                                                p.status === 'COMPLETED' 
                                                                    ? (p.completedAt ? (new Date(p.completedAt) <= new Date(p.deadline) ? 'text-emerald-400' : 'text-red-400') : 'text-emerald-400')
                                                                    : 'text-emerald-400'
                                                            }`}>
                                                                {p.status === 'COMPLETED' ? 'On Schedule' : 'Ahead of Target'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    {p.status === 'COMPLETED' && (
                                                        <Link to="/discover" className="text-[11px] font-black text-emerald-400 hover:text-emerald-300 transition-all uppercase tracking-[0.2em] flex items-center gap-2">
                                                            <RotateCcw size={14} /> Buy Again
                                                        </Link>
                                                    )}
                                                    <Link to={`/projects/${p.id}`} className="btn-primary py-3 px-8 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20">
                                                        Project Workspace <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
    );
};

export default BrandDashboard;
