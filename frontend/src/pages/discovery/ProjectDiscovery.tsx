
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, DollarSign, Calendar, ArrowRight, Loader2, Compass } from 'lucide-react';


interface Project {
    id: string;
    title: string;
    description: string;
    niche: string;
    budget: string;
    deadline: string;
    status: string;
}

const ProjectDiscovery: React.FC = () => {
    const niches = ['All', 'YouTube', 'Instagram', 'TikTok', 'Shorts/Reels', 'UGC', 'Podcast', 'Branding', 'Photography', 'Animation', 'Software', 'Web Development', 'Writing'];
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedNiche, setSelectedNiche] = useState('All');

    useEffect(() => {
        axios.get('/api/projects')
            .then(r => {
                if (Array.isArray(r.data)) {
                    setProjects(r.data.filter((p: Project) => p && ['ACTIVE', 'DRAFT', 'COMPLETED'].includes(p.status)));
                } else {
                    setProjects([]);
                }
            })
            .catch(err => {
                console.error('Fetch projects error', err);
                setProjects([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const filtered = (projects || []).filter(p => {
        if (!p) return false;
        const title = p.title || '';
        const description = p.description || '';
        const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) ||
            description.toLowerCase().includes(search.toLowerCase());
        const matchesNiche = selectedNiche === 'All' || p.niche === selectedNiche;
        return matchesSearch && matchesNiche;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold">
                    <Compass size={16} /> Project Discovery
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-[#f0f4ff]">Find Your Next Project</h1>
                <p className="text-[#7e8fb5]">Browse live briefs from top brands — apply and build something great.</p>
            </div>

            {/* Search & Filters */}
            <div className="glass-card p-4 space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5578]" size={18} />
                    <input
                        type="text"
                        className="input pl-11 text-base"
                        placeholder="Search projects by title, niche, or keyword..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs text-[#4a5578] font-semibold">
                        <Filter size={13} /> Niche:
                    </span>
                    {niches.map(n => (
                        <button
                            key={n}
                            onClick={() => setSelectedNiche(n)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${selectedNiche === n
                                    ? 'text-white shadow-[0_0_16px_rgba(99,102,241,0.3)]'
                                    : 'text-[#7e8fb5] hover:text-[#f0f4ff]'
                                }`}
                            style={selectedNiche === n
                                ? { background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: '1px solid rgba(99,102,241,0.5)' }
                                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
                            }
                        >
                            {n}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results count */}
            <div className="flex items-center gap-2 text-sm text-[#7e8fb5]">
                <span className="font-bold text-[#f0f4ff]">{filtered.length}</span> projects found
                {selectedNiche !== 'All' && <span>in <span className="text-indigo-400 font-medium">{selectedNiche}</span></span>}
            </div>

            {/* Project Grid */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={44} /></div>
            ) : filtered.length === 0 ? (
                <div className="glass-card p-16 text-center space-y-3">
                    <p className="text-4xl">🔍</p>
                    <h3 className="text-xl font-bold text-[#f0f4ff]">No projects found</h3>
                    <p className="text-[#7e8fb5]">Try a different search or filter.</p>
                    <button onClick={() => { setSearch(''); setSelectedNiche('All'); }} className="btn-secondary mx-auto">
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div className="card-grid">
                    {filtered.map(p => (
                        <div key={p.id} className="glass-card p-5 space-y-4 flex flex-col">
                            {/* Top row */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex gap-2">
                                    <span className="badge badge-primary text-[0.68rem]">
                                        {p.niche}
                                    </span>
                                    {p.status === 'COMPLETED' && (
                                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[0.68rem] font-bold uppercase tracking-widest">
                                            Completed
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 text-[#4ade80] font-bold text-sm flex-shrink-0">
                                    <DollarSign size={14} />
                                    {parseFloat(p.budget || "0").toLocaleString()}
                                </div>
                            </div>

                            {/* Title & desc */}
                            <div className="flex-1 space-y-2">
                                <h3 className="font-bold text-[#f0f4ff] text-base leading-snug tracking-tight">{p.title}</h3>
                                <p className="text-sm text-[#7e8fb5] line-clamp-2 leading-relaxed">{p.description}</p>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-white/[0.07]">
                                <div className="flex items-center gap-1.5 text-xs text-[#4a5578]">
                                    <Calendar size={12} />
                                    {p.status === 'COMPLETED' ? 'Finished' : new Date(p.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                                <Link
                                    to={`/projects/${p.id}`}
                                    className="flex items-center gap-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                    {p.status === 'COMPLETED' ? 'View Details' : 'View & Apply'} <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectDiscovery;
