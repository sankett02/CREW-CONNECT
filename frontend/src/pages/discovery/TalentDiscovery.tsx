import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Loader2, Search, Filter, User, Star, Briefcase, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import InviteModal from '../../components/modals/InviteModal';

interface TalentProfile {
    userId: string;
    displayName?: string;
    bio?: string;
    ratingAvg: number;
    nicheTags?: string;
    user?: {
        email?: string;
        role?: string;
    };
}

const TalentDiscovery: React.FC = () => {
    const { user } = useAuth();
    const [profiles, setProfiles] = useState<TalentProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [invitingTalent, setInvitingTalent] = useState<TalentProfile | null>(null);

    // Filters
    const [roleFilter, setRoleFilter] = useState('');
    const [nicheFilter, setNicheFilter] = useState('');
    const [skillFilter, setSkillFilter] = useState('');

    const fetchTalent = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (roleFilter) params.append('role', roleFilter);
            if (nicheFilter) params.append('niche', nicheFilter);
            if (skillFilter) params.append('skill', skillFilter);

            const res = await axios.get(`/api/profiles/search?${params.toString()}`);
            setProfiles(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to fetch talent', err);
            setProfiles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTalent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roleFilter]); // Auto-fetch on role change, require manual search for text inputs

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchTalent();
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black gradient-text">Discover Talent</h1>
                    <p className="text-text-muted text-sm">Find the perfect creators, writers, and editors for your next project.</p>
                </div>
            </div>

            {/* Filters */}
            <form onSubmit={handleSearch} className="glass-card p-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-1">
                    <label className="text-xs font-semibold text-text-muted ml-1 flex items-center gap-1">
                        <User size={12} /> Role
                    </label>
                    <select
                        className="input w-full"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="">All Roles</option>
                        <option value="CREATOR">Creator</option>
                        <option value="WRITER">Writer</option>
                        <option value="EDITOR">Editor</option>
                    </select>
                </div>
                <div className="flex-1 space-y-1">
                    <label className="text-xs font-semibold text-text-muted ml-1 flex items-center gap-1">
                        <Briefcase size={12} /> Niche (e.g. YouTube, Tech)
                    </label>
                    <input
                        type="text"
                        className="input w-full"
                        placeholder="Search niche..."
                        value={nicheFilter}
                        onChange={(e) => setNicheFilter(e.target.value)}
                    />
                </div>
                <div className="flex-1 space-y-1">
                    <label className="text-xs font-semibold text-text-muted ml-1 flex items-center gap-1">
                        <Briefcase size={12} /> Skill (e.g. Premiere Pro)
                    </label>
                    <input
                        type="text"
                        className="input w-full"
                        placeholder="Search skill..."
                        value={skillFilter}
                        onChange={(e) => setSkillFilter(e.target.value)}
                    />
                </div>
                <div className="flex items-end">
                    <button type="submit" className="btn-primary w-full md:w-auto px-6 h-[42px] flex items-center justify-center gap-2">
                        <Search size={16} /> Search
                    </button>
                </div>
            </form>

            {/* Results */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
            ) : profiles.length === 0 ? (
                <div className="glass-card flex flex-col items-center justify-center py-20 text-text-muted">
                    <Filter size={48} className="mb-4 opacity-50" />
                    <p className="text-lg font-medium text-text-main">No talent found matching your criteria.</p>
                    <p className="text-sm">Try adjusting your filters or clearing them to see more users.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profiles.map(p => (
                        <div key={p.userId} className="relative group">
                            <Link to={`/profile/${p.userId}`} className="glass-card p-6 flex flex-col h-full hover-lift border border-border hover:border-primary/30 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform">
                                            <User className="text-primary" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-text-main group-hover:text-primary transition-colors">{p.displayName || p.user?.email?.split('@')[0] || "User"}</h3>
                                            <span className="text-xs font-bold text-text-muted uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-full inline-block mt-1">
                                                {p.user?.role ? (p.user.role.charAt(0) + p.user.role.slice(1).toLowerCase()) : "User"}
                                            </span>
                                        </div>
                                    </div>
                                    {p.ratingAvg > 0 && (
                                        <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-2 py-1 rounded-lg text-sm">
                                            <Star size={14} fill="currentColor" /> {p.ratingAvg.toFixed(1)}
                                        </div>
                                    )}
                                </div>

                                <p className="text-sm text-text-muted line-clamp-2 mb-4 flex-grow">
                                    {p?.bio || "No biography provided."}
                                </p>

                                <div className="flex items-center justify-between text-xs text-text-muted border-t border-white/[0.05] pt-4 mt-auto">
                                    <div className="flex gap-2 truncate">
                                        {p.nicheTags ? (
                                            p.nicheTags.split(',').slice(0, 2).map((tag: string) => (
                                                <span key={tag.trim()} className="bg-glass-bg px-2 py-1 rounded-md border border-border truncate max-w-[100px]">{tag.trim()}</span>
                                            ))
                                        ) : (
                                            <span>No niches listed</span>
                                        )}
                                    </div>
                                    <span className="text-primary font-medium group-hover:translate-x-1 transition-transform inline-block">
                                        View Profile →
                                    </span>
                                </div>
                            </Link>
                            
                            {user?.role === 'BRAND' && (
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setInvitingTalent(p);
                                    }}
                                    className="absolute top-4 right-12 p-2 bg-primary/20 text-primary rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/30 z-10 mr-2"
                                    title="Invite to Project"
                                >
                                    <Sparkles size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {invitingTalent && (
                <InviteModal 
                    creatorId={invitingTalent.userId}
                    creatorName={invitingTalent.displayName || invitingTalent.user?.email?.split('@')[0] || ""}
                    onClose={() => setInvitingTalent(null)}
                />
            ) }
        </div>
    );
};

export default TalentDiscovery;
