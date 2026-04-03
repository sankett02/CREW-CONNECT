import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
    LayoutGrid, Loader2, ArrowRight, Clock, 
    CheckCircle2, AlertCircle, Sparkles, Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Project {
    id: string;
    title: string;
    description: string;
    status: string;
    budget: string | number;
    niche: string;
    brand?: {
        profile?: {
            displayName: string;
        };
    };
    team?: {
        userId: string;
    }[];
    brandId?: string;
}

const Workspaces: React.FC = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWorkspaces = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/projects');
            const myId = user?.id;
            
            // Filter: I am the owner OR I am in the team
            // AND status is not DRAFT
            const myWorkspaces = res.data.filter((p: Project) => {
                const isOwner = p.brandId === myId;
                const isTeam = p.team?.some((m) => m.userId === myId);
                const isActiveStatus = ['ACTIVE', 'IN_REVISION', 'UNDER_REVIEW', 'COMPLETED'].includes(p.status);
                return (isOwner || isTeam) && isActiveStatus;
            });
            
            setProjects(myWorkspaces);
        } catch (err) {
            console.error('Failed to fetch workspaces', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkspaces();
    }, [user]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-[#7e8fb5] font-medium animate-pulse">Opening your project command center...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black gradient-text flex items-center gap-3">
                        <LayoutGrid size={32} /> Your Workspaces
                    </h1>
                    <p className="text-[#7e8fb5] text-sm">Manage all your active collaborations and deliveries in one place.</p>
                </div>
                <div className="bg-glass-bg border border-border px-4 py-2 rounded-xl flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-[#7e8fb5] uppercase tracking-widest">Active Collaboration</p>
                        <p className="text-sm font-black text-white">{projects.length} Accepted Project{projects.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="glass-card p-20 text-center space-y-6 border-dashed border-white/10 bg-white/[0.01] rounded-3xl">
                    <div className="w-20 h-20 mx-auto rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                        <Briefcase size={40} />
                    </div>
                    <div className="space-y-2 max-w-sm mx-auto">
                        <h3 className="text-xl font-bold text-white">No active workspaces</h3>
                        <p className="text-[#a8b8d8] text-sm">Once project applications are accepted or projects are launched, they will appear here as workspaces.</p>
                    </div>
                    <Link to="/discover" className="btn-primary inline-flex py-3 px-8 text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20">
                        Explore Projects
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {projects.map(p => (
                        <Link 
                            to={`/workspace/${p.id}`} 
                            key={p.id} 
                            className="glass-card p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-indigo-500/30 transition-all hover:bg-white/[0.02]"
                        >
                            <div className="w-full md:w-32 h-24 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-sky-500/10 border border-white/5 flex items-center justify-center text-indigo-400 font-black text-xs relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                                <Sparkles className="absolute top-2 right-2 opacity-20" size={12} />
                                WORKSPACE
                            </div>
                            
                            <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded">{p.niche}</span>
                                    <span className="text-[10px] font-bold text-[#7e8fb5] uppercase tracking-widest">#{p.id.split('-')[0]}</span>
                                </div>
                                
                                <h3 className="text-xl font-bold text-white truncate group-hover:text-indigo-300 transition-colors tracking-tight">
                                    {p.title}
                                </h3>
                                
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-xs">
                                        {p.status === 'COMPLETED' ? (
                                            <CheckCircle2 size={14} className="text-green-400" />
                                        ) : (
                                            <Clock size={14} className="text-amber-400" />
                                        )}
                                        <span className={`font-bold ${p.status === 'COMPLETED' ? 'text-green-400' : 'text-amber-400'}`}>
                                            {p.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-[#7e8fb5]">
                                        <AlertCircle size={14} className="text-indigo-400" />
                                        <span>{p.team?.length || 0} Members</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/5 justify-end">
                                <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20 group-hover:bg-indigo-600 transition-all">
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Workspaces;
