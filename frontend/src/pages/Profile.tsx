import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Loader2, Edit3, Save, User as UserIcon, Star, Briefcase, Link as LinkIcon, AlertCircle, Activity, CreditCard, CheckCircle2, Building2, Globe, Sparkles, Trash2, Instagram, Linkedin, Youtube } from 'lucide-react';
import InviteModal from '../components/modals/InviteModal';

interface ProfileData {
    userId: string;
    displayName?: string;
    bio?: string;
    profileImage?: string;
    companyName?: string;
    brandType?: string;
    websiteUrl?: string;
    portfolioUrl?: string;
    hourlyRate?: number;
    skills?: string;
    portfolioLinks?: string;
    nicheTags?: string;
    socialLinks?: string;
    completedCount?: number;
    successRate?: number;
    ratingAvg?: number;
    user?: {
        email: string;
        role: string;
        stripeAccountId?: string;
        teamMemberAt?: any[];
        ratingsReceived?: any[];
    };
}

const Profile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        portfolioUrl: '',
        websiteUrl: '',
        companyName: '',
        brandType: '',
        hourlyRate: '',
        skills: '',
        portfolioLinks: '',
        instagram: '',
        youtube: '',
        linkedin: '',
        nicheTags: '',
        profileImage: '',
    });
    const [uploadingImage, setUploadingImage] = useState(false);
    const [connectingBanking, setConnectingBanking] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const targetId = id === 'me' ? user?.id : id;
                if (!targetId) {
                    navigate('/login');
                    return;
                }
                const res = await axios.get(`/api/profiles/${targetId}`);
                if (res.data) {
                    setProfileData(res.data);
                    setFormData({
                        displayName: res.data.displayName || '',
                        bio: res.data.bio || '',
                        portfolioUrl: res.data.portfolioUrl || '',
                        websiteUrl: res.data.websiteUrl || '',
                        companyName: res.data.companyName || '',
                        brandType: res.data.brandType || '',
                        hourlyRate: res.data.hourlyRate?.toString() || '',
                        skills: res.data.skills || '',
                        portfolioLinks: res.data.portfolioLinks || '',
                        instagram: '',
                        youtube: '',
                        linkedin: '',
                        nicheTags: res.data.nicheTags || '',
                        profileImage: res.data.profileImage || '',
                    });

                    if (res.data.socialLinks) {
                        try {
                            const social = JSON.parse(res.data.socialLinks);
                            setFormData(prev => ({
                                ...prev,
                                instagram: social.instagram || '',
                                youtube: social.youtube || '',
                                linkedin: social.linkedin || '',
                            }));
                        } catch (e) {
                            console.error('Failed to parse social links', e);
                        }
                    }
                } else {
                    setError('Profile not found.');
                }
            } catch (err) {
                const axiosError = err as any;
                console.error('Fetch profile error', axiosError);
                setError(axiosError.response?.data?.message || 'Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id, user, navigate]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, profileImage: res.data.url }));
        } catch {
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, profileImage: '' }));
    };

    const handleSave = async () => {
        const targetId = id === 'me' ? user?.id : id;
        if (!targetId) return;

        setSaving(true);
        try {
            const res = await axios.put(`/api/profiles/${targetId}`, {
                ...formData,
                socialLinks: JSON.stringify({
                    instagram: formData.instagram,
                    youtube: formData.youtube,
                    linkedin: formData.linkedin,
                }),
                hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
            });
            setProfileData((prev) => (prev ? { ...prev, ...res.data } : res.data));
            updateUser({ displayName: res.data.displayName });
            setIsEditing(false);
        } catch (err) {
            const axiosError = err as any;
            console.error('Save profile error', axiosError);
            alert(axiosError.response?.data?.message || 'Failed to save profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleConnectBanking = async () => {
        setConnectingBanking(true);
        try {
            // Step 1: Initialize account if not already done
            await axios.post('/api/stripe/connect');
            
            // Step 2: Get onboarding link
            const res = await axios.post('/api/stripe/onboarding-link');
            if (res.data?.url) {
                window.location.href = res.data.url;
            } else {
                alert('Could not generate banking link. Please try again.');
            }
        } catch (err) {
            const axiosError = err as any;
            console.error('Connect banking error', axiosError);
            alert(axiosError.response?.data?.message || 'Failed to connect banking. Please try again later.');
        } finally {
            setConnectingBanking(false);
        }
    };
    const [activeTab, setActiveTab] = useState<'about' | 'portfolio' | 'reviews'>('about');

    if (loading) {
        return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <AlertCircle className="text-red-400" size={48} />
                <h2 className="text-xl font-bold">{error}</h2>
                <button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button>
            </div>
        );
    }

    const email = profileData?.user?.email ?? '';
    const role = profileData?.user?.role ?? 'USER';
    const profile = profileData;
    const isOwner = Boolean(user?.id && profileData?.userId && user.id === profileData.userId);

    const tabs = [
        { id: 'about', label: role === 'BRAND' ? 'Vision' : 'About', icon: UserIcon },
        { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
        { id: 'reviews', label: 'Reviews', icon: Star },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-0">
            {/* Header Card */}
            <div className="glass-card overflow-hidden border-white/5 shadow-2xl">
                <div className="h-56 relative" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(56,189,248,0.1) 100%)' }}>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    
                    <div className="absolute -bottom-16 left-8 md:left-12 w-40 h-40 rounded-[2.5rem] bg-[#0d1425] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex items-center justify-center backdrop-blur-3xl z-10 p-1.5 group">
                        <div className="w-full h-full rounded-[2.2rem] bg-gradient-to-br from-indigo-500/20 to-sky-500/20 flex items-center justify-center overflow-hidden relative">
                            {isEditing ? (
                                <>
                                    {formData.profileImage ? (
                                        <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon size={56} className="text-indigo-400" />
                                    )}
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        <div className="text-center">
                                            <Edit3 size={20} className="mx-auto mb-1 text-white" />
                                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">{uploadingImage ? '...' : 'Edit'}</span>
                                        </div>
                                    </label>
                                    {formData.profileImage && !uploadingImage && (
                                        <button 
                                            onClick={handleRemoveImage}
                                            className="absolute top-3 right-3 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            title="Remove Image"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </>
                            ) : (
                                profile?.profileImage ? (
                                    <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon size={64} className="text-indigo-400" />
                                )
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-24 pb-10 px-8 md:px-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#f0f4ff]">
                                        {profile?.displayName || 'Anonymous User'}
                                    </h1>
                                    <div className="bg-indigo-600 text-white p-1 rounded-full border-2 border-[#0a0c10] shadow-glow-indigo">
                                        <CheckCircle2 size={14} fill="currentColor" />
                                    </div>
                                </div>
                                {profile?.companyName && role === 'BRAND' && (
                                    <p className="text-xl font-bold text-indigo-400 flex items-center gap-2">
                                        <Building2 size={20} /> {profile.companyName}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border ${role === 'BRAND' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                                    }`}>
                                    {role === 'BRAND' ? 'Elite Partner' : `Verified ${role.charAt(0) + role.slice(1).toLowerCase()}`}
                                </span>
                                <span className="text-[#4a5578] opacity-30">|</span>
                                <div className="flex items-center gap-2 text-[#7e8fb5] hover:text-[#f0f4ff] transition-colors cursor-default">
                                    <Globe size={14} className="opacity-50" />
                                    <span>{email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {isOwner && !isEditing && (
                                <button onClick={() => setIsEditing(true)} className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                                    <Edit3 size={16} /> Edit Profile
                                </button>
                            )}
                            {user?.role === 'BRAND' && role !== 'BRAND' && (
                                <button
                                    onClick={() => setShowInviteModal(true)}
                                    className="px-8 py-3.5 rounded-2xl bg-indigo-600 text-white text-sm font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2"
                                >
                                    <Sparkles size={18} /> Invite to Project
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column - Sidebar (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Stats Box */}
                    <div className="glass-card p-6 grid grid-cols-2 gap-4 border-white/5">
                        {[
                            { label: 'Completed', value: profile?.completedCount || 0, color: 'text-sky-400' },
                            { label: 'Success', value: `${profile?.successRate || 100}%`, color: 'text-emerald-400' },
                            { label: 'Rating', value: profile?.ratingAvg ? profile.ratingAvg.toFixed(1) : '5.0', color: 'text-amber-400' },
                            { label: 'Avg Rate', value: `$${profile?.hourlyRate || '0'}/hr`, color: 'text-indigo-400' }
                        ].map((m, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center text-center">
                                <span className="text-[9px] font-black text-[#5a658a] uppercase tracking-widest mb-1">{m.label}</span>
                                <span className={`text-xl font-black ${m.color}`}>{m.value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="glass-card p-8 space-y-8 border-white/5">
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-[#f0f4ff] uppercase tracking-[0.2em] flex items-center gap-2">
                                <Activity size={14} className="text-indigo-400" />
                                Professional Presence
                            </h3>

                            {isEditing ? (
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[10px] font-black text-[#5a658a] uppercase tracking-widest ml-1">Display Name</label>
                                        <input type="text" className="input mt-1.5 py-3 text-sm" value={formData.displayName} onChange={e => setFormData({ ...formData, displayName: e.target.value })} />
                                    </div>
                                    {role === 'BRAND' ? (
                                        <>
                                            <div>
                                                <label className="text-[10px] font-black text-[#5a658a] uppercase tracking-widest ml-1">Company Name</label>
                                                <input type="text" className="input mt-1.5 py-3 text-sm" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-[#5a658a] uppercase tracking-widest ml-1">Website</label>
                                                <input type="url" className="input mt-1.5 py-3 text-sm" value={formData.websiteUrl} onChange={e => setFormData({ ...formData, websiteUrl: e.target.value })} />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="text-[10px] font-black text-[#5a658a] uppercase tracking-widest ml-1">Featured Portfolio</label>
                                                <input type="url" className="input mt-1.5 py-3 text-sm" value={formData.portfolioUrl} onChange={e => setFormData({ ...formData, portfolioUrl: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-[#5a658a] uppercase tracking-widest ml-1">Hourly Rate ($)</label>
                                                <input type="number" className="input mt-1.5 py-3 text-sm" value={formData.hourlyRate} onChange={e => setFormData({ ...formData, hourlyRate: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-[#5a658a] uppercase tracking-widest ml-1">Primary Skills</label>
                                                <input type="text" className="input mt-1.5 py-3 text-sm" placeholder="Editing, Writing, etc." value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} />
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {role === 'BRAND' ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                                <span className="text-[10px] font-black text-[#5a658a] uppercase tracking-widest">Website</span>
                                                {profile?.websiteUrl ? (
                                                    <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                                        <Globe size={18} />
                                                    </a>
                                                ) : <span className="text-[10px] font-bold text-[#4a5578] italic uppercase">Pending</span>}
                                            </div>
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                                <span className="text-[10px] font-black text-[#5a658a] uppercase tracking-widest">Industry</span>
                                                <span className="text-xs font-bold text-[#f0f4ff]">{profile?.brandType || 'Agency'}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                                <span className="text-[10px] font-black text-[#5a658a] uppercase tracking-widest">Portfolio</span>
                                                {profile?.portfolioUrl ? (
                                                    <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 transition-colors">
                                                        <LinkIcon size={18} />
                                                    </a>
                                                ) : <span className="text-[10px] font-bold text-[#4a5578] italic uppercase">Private</span>}
                                            </div>
                                            
                                            {profile?.skills && (
                                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                                                    <span className="text-[10px] font-black text-[#5a658a] uppercase tracking-widest">Core Domain</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {profile.skills.split(',').map((s: string) => s.trim()).filter(Boolean).map((skill: string) => (
                                                            <span key={skill} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 rounded-lg text-[9px] font-black uppercase tracking-wider">{skill}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
                                                <span className="text-[10px] font-black text-[#5a658a] uppercase tracking-widest">Connect & Follow</span>
                                                <div className="flex gap-4">
                                                    {(() => {
                                                        try {
                                                            const social = JSON.parse(profile?.socialLinks || '{}');
                                                            const links = [];
                                                            if (social.instagram) links.push(<a key="ig" href={`https://instagram.com/${social.instagram}`} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/[0.03] text-[#7e8fb5] hover:text-[#E4405F] hover:bg-[#E4405F]/5 transition-all"><Instagram size={18} /></a>);
                                                            if (social.linkedin) links.push(<a key="li" href={social.linkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/[0.03] text-[#7e8fb5] hover:text-[#0077B5] hover:bg-[#0077B5]/5 transition-all"><Linkedin size={18} /></a>);
                                                            if (social.youtube) links.push(<a key="yt" href={social.youtube} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/[0.03] text-[#7e8fb5] hover:text-[#FF0000] hover:bg-[#FF0000]/5 transition-all"><Youtube size={18} /></a>);
                                                            return links.length > 0 ? links : <span className="text-[9px] font-bold text-[#4a5578] uppercase py-2">No socials linked</span>;
                                                        } catch { return null; }
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {isOwner && (role === 'CREATOR' || role === 'WRITER' || role === 'EDITOR') && (
                            <div className="pt-6 border-t border-white/5">
                                {profile?.user?.stripeAccountId ? (
                                    <div className="flex items-center gap-3 text-[#10b981] bg-[#10b981]/5 border border-[#10b981]/20 px-5 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest">
                                        <div className="p-1.5 rounded-full bg-[#10b981]/20">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        Identity Verified
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleConnectBanking}
                                        disabled={connectingBanking}
                                        className="w-full py-4 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-500 text-white transition-all text-[10px] font-black flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                                    >
                                        {connectingBanking ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={18} />}
                                        {connectingBanking ? 'Processing...' : 'Verify Payments'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Tabs Content (8 cols) */}
                <div className="lg:col-span-8 flex flex-col h-full">
                    {/* Tab Bar */}
                    <div className="glass-card mb-6 p-1.5 flex gap-1 border-white/5 bg-white/[0.02]">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 relative group
                                    ${activeTab === tab.id 
                                        ? 'bg-indigo-600 text-white shadow-lg' 
                                        : 'text-[#7e8fb5] hover:text-white hover:bg-white/5'}`}
                            >
                                <tab.icon size={18} className={`${activeTab === tab.id ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'} transition-opacity`} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-glow-white" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Panels */}
                    <div className="flex-1 flex flex-col">
                        <div className="glass-card flex-1 p-10 md:p-12 border-white/5 min-h-[500px] flex flex-col">
                            {/* About Tab */}
                            {activeTab === 'about' && (
                                <div className="space-y-8 animate-in fade-in duration-500 flex flex-col flex-1">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-1.5 h-12 bg-indigo-600 rounded-full" />
                                        <h3 className="text-3xl font-black text-[#f0f4ff] tracking-tighter">
                                            {role === 'BRAND' ? 'Our Strategy' : 'Professional Biography'}
                                        </h3>
                                    </div>

                                    {isEditing ? (
                                        <div className="flex-1 flex flex-col space-y-6">
                                            <div className="flex-1 min-h-[300px] flex flex-col">
                                                <label className="text-[10px] font-black text-[#5a658a] uppercase tracking-widest ml-1 mb-2">About Section</label>
                                                <textarea
                                                    className="input flex-1 w-full min-h-[350px] resize-none pt-4 text-sm leading-relaxed"
                                                    value={formData.bio}
                                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                                    placeholder="Tell the world about your creative vision..."
                                                />
                                            </div>
                                            <div className="flex justify-end gap-4 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                                                <button onClick={() => setIsEditing(false)} disabled={saving} className="px-8 py-3 rounded-2xl text-[10px] font-black text-[#7e8fb5] hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest">
                                                    Discard
                                                </button>
                                                <button onClick={handleSave} disabled={saving} className="px-10 py-3.5 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30">
                                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                                    Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="max-h-[550px] overflow-y-auto custom-scrollbar pr-4">
                                            <div className="text-[#a8b8d8] text-xl leading-relaxed whitespace-pre-wrap font-medium max-w-3xl">
                                                {profile?.bio ? profile.bio : <p className="italic text-[#4a5578] text-base">Professional summary is pending. This user is in the process of building their elite profile.</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Portfolio Tab */}
                            {activeTab === 'portfolio' && (
                                <div className="space-y-8 animate-in fade-in duration-500 h-full">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1.5 h-12 bg-sky-500 rounded-full" />
                                            <h3 className="text-3xl font-black text-[#f0f4ff] tracking-tighter">Verified Projects</h3>
                                        </div>
                                        <div className="hidden md:flex bg-sky-500/10 text-sky-400 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border border-sky-500/20">
                                            Proof of Work
                                        </div>
                                    </div>

                                    <div className="max-h-[600px] overflow-y-auto custom-scrollbar pr-2 -mr-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {profileData?.user?.teamMemberAt && profileData.user.teamMemberAt.length > 0 ? (
                                                profileData.user.teamMemberAt.map((member: any) => (
                                                    <div key={member.project.id} className="group p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-sky-500/30 transition-all duration-500 relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-4">
                                                            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/20">
                                                                <div className="w-1 h-1 rounded-full bg-[#10b981]" />
                                                                <span className="text-[8px] font-black text-[#10b981] uppercase tracking-widest">Done</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-6">
                                                            <div className="space-y-2">
                                                                <span className="text-[10px] font-black text-sky-500/60 uppercase tracking-widest">{member.project.niche}</span>
                                                                <h4 className="font-black text-white text-xl leading-tight group-hover:text-sky-400 transition-colors uppercase tracking-tight">{member.project.title}</h4>
                                                            </div>
                                                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                                                <div className="flex items-center gap-2 text-[#5a658a]">
                                                                    <CheckCircle2 size={14} className="text-sky-500" />
                                                                    <span className="text-[9px] font-black uppercase tracking-widest">Industry Scale</span>
                                                                </div>
                                                                <span className="text-sm font-black text-[#f0f4ff] tracking-tighter">$ {Number(member.project.budget).toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-full border border-dashed border-white/10 rounded-[2.5rem] p-20 text-center space-y-4">
                                                    <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto mb-2">
                                                        <Briefcase size={32} className="text-[#4a5578] opacity-30" />
                                                    </div>
                                                    <h4 className="text-[#f0f4ff] font-bold text-lg">No projects visible yet</h4>
                                                    <p className="text-[#7e8fb5] text-sm max-w-sm mx-auto leading-relaxed">This creator is currenty building their showcase. Elite collaborations will appear here shortly.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reviews Tab */}
                            {activeTab === 'reviews' && (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1.5 h-12 bg-amber-400 rounded-full" />
                                            <h3 className="text-3xl font-black text-[#f0f4ff] tracking-tighter">Market Trust</h3>
                                        </div>
                                        <div className="hidden md:flex bg-amber-400/10 text-amber-400 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border border-amber-400/20">
                                            Verified Feedback
                                        </div>
                                    </div>

                                    <div className="max-h-[600px] overflow-y-auto custom-scrollbar pr-2 -mr-2">
                                        <div className="space-y-6">
                                            {profileData?.user?.ratingsReceived && profileData.user.ratingsReceived.length > 0 ? (
                                                profileData.user.ratingsReceived.map((rating: any) => (
                                                    <div key={rating.id} className="group p-10 rounded-[2.5rem] bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 hover:border-amber-400/20 transition-all duration-500">
                                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-amber-400 border border-white/5">
                                                                    <UserIcon size={24} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xl font-black text-[#f0f4ff] tracking-tight">{rating.reviewer?.profile?.displayName || 'Elite Partner'}</p>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow-emerald" />
                                                                        <p className="text-[9px] text-emerald-500 uppercase font-black tracking-[0.2em]">Closed & Paid</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-1.5 p-3 rounded-2xl bg-black/20 border border-white/5 w-fit">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star key={i} size={18} fill={i < rating.score ? "#fbbf24" : "none"} className={i < rating.score ? "text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" : "text-white/5"} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="relative">
                                                            <div className="absolute -left-6 top-0 text-amber-400 opacity-20 text-6xl font-serif">"</div>
                                                            <p className="text-[#c7d2e8] text-xl italic leading-relaxed font-bold pl-2">
                                                                {rating.review}
                                                            </p>
                                                            <div className="absolute -right-2 -bottom-2 text-amber-400 opacity-20 text-6xl font-serif rotate-180">"</div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="border border-dashed border-white/10 rounded-[2.5rem] p-24 text-center space-y-4">
                                                    <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto mb-2">
                                                        <Star size={32} className="text-[#4a5578] opacity-30" />
                                                    </div>
                                                    <h4 className="text-[#f0f4ff] font-bold text-lg">Trust building in progress</h4>
                                                    <p className="text-[#7e8fb5] text-sm max-w-sm mx-auto">First collaborations are pending. Verified market feedback will appear here soon.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showInviteModal && profileData && (
                <InviteModal
                    creatorId={profileData.userId}
                    creatorName={profileData.displayName || 'Creator'}
                    onClose={() => setShowInviteModal(false)}
                />
            )}
        </div >
    );
};

export default Profile;
