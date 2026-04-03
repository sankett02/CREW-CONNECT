import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Shield, CheckCircle2, Flag, Users,
    AlertTriangle, Loader2, CheckCheck,
    TrendingUp, DollarSign, Activity,
    Trash2, Search, Briefcase,
    BarChart3, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Tab = 'overview' | 'users' | 'moderation';

interface AdminUser {
    id: string;
    email: string;
    role: string;
    isVerified: boolean;
    isFlagged: boolean;
    profile?: {
        displayName?: string;
    };
}

interface Dispute {
    id: string;
    projectId: string;
    notes: string;
    status: 'OPEN' | 'RESOLVED';
    project?: {
        title: string;
    };
}

interface Analytics {
    stats: {
        totalRevenue: number;
        totalVolume: number;
        totalUsers: number;
        recentGrowth: number;
    };
}

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPending, setIsPending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        if (!user) return;
        try {
            const [usersRes, disputesRes, analyticsRes] = await Promise.all([
                axios.get('/api/admin/users'),
                axios.get('/api/admin/disputes'),
                axios.get('/api/admin/analytics')
            ]);
            console.log('Admin Data Fetched:', { users: usersRes.data.length, disputes: disputesRes.data.length, analytics: analyticsRes.data });
            setUsers(usersRes.data);
            setDisputes(disputesRes.data);
            setAnalytics(analyticsRes.data);
            setIsPending(false);
        } catch (err: unknown) {
            console.error('Admin fetch error', err);
            if (axios.isAxiosError(err) && err.response?.status === 403) {
                setIsPending(true);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const toggleVerify = async (userId: string) => {
        try {
            const res = await axios.patch(`/api/admin/users/${userId}/verify`);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: res.data.isVerified } : u));
        } catch (err) { console.error('Verify failed', err); }
    };

    const toggleFlag = async (userId: string) => {
        try {
            const res = await axios.patch(`/api/admin/users/${userId}/flag`);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isFlagged: res.data.isFlagged } : u));
        } catch (err) { console.error('Flag failed', err); }
    };

    const deleteUser = async (userId: string) => {
        if (!window.confirm('Are you sure you want to REJECT and DELETE this registration? This action cannot be undone.')) return;
        try {
            await axios.delete(`/api/admin/users/${userId}`);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) { console.error('Delete failed', err); }
    };

    const resolveDispute = async (disputeId: string) => {
        try {
            await axios.patch(`/api/admin/disputes/${disputeId}/resolve`);
            setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status: 'RESOLVED' } : d));
        } catch (err) { console.error('Resolve failed', err); }
    };

    if (isPending) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 mb-6 border border-amber-500/20 animate-pulse">
                    <Shield size={40} />
                </div>
                <h1 className="text-3xl font-black text-text-main mb-3">Admin Access Pending</h1>
                <p className="text-text-muted max-w-md mx-auto leading-relaxed">
                    Gate 1 (Secret Key) confirmed. <br />
                    <span className="text-amber-400 font-bold">Gate 2 (Manual Approval)</span> is now required.
                    An existing verified administrator must authorize your account before you can access the command center.
                </p>
                <div className="mt-8 p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
                    <Activity size={18} className="text-text-muted" />
                    <p className="text-xs text-text-muted italic">Awaiting manual verification from root admin...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-text-muted animate-pulse">Loading Secure Command Center...</p>
        </div>;
    }

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.profile?.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const flaggedUsers = users.filter(u => u.isFlagged);
    const pendingAdmins = users.filter(u => u.role === 'ADMIN' && !u.isVerified);

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
                        <ShieldAlert size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black gradient-text">Command Center</h1>
                        <p className="text-text-muted text-sm font-medium">System status, user traffic, and platform trust.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 self-start md:self-center">
                    {(['overview', 'users', 'moderation'] as Tab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all capitalize ${activeTab === tab
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                : 'text-text-muted hover:text-text-main'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'overview' && (
                <>
                    {/* Analytics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Revenue', value: `$${(analytics?.stats?.totalRevenue || 0).toLocaleString()}`, icon: <DollarSign size={20} />, color: 'text-green-400', bg: 'bg-green-500/10' },
                            { label: 'Platform Volume', value: `$${(analytics?.stats?.totalVolume || 0).toLocaleString()}`, icon: <TrendingUp size={20} />, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                            { label: 'Total Members', value: analytics?.stats?.totalUsers || 0, icon: <Users size={20} />, color: 'text-sky-400', bg: 'bg-sky-500/10' },
                            { label: '30d Growth', value: `+${analytics?.stats?.recentGrowth || 0}`, icon: <Activity size={20} />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                        ].map(stat => (
                            <div key={stat.label} className="glass-card p-6 flex items-center justify-between group hover:border-white/20 transition-all">
                                <div>
                                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className="text-3xl font-black text-text-main">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                    {stat.icon}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Traffic Chart Placeholder */}
                        <div className="glass-card p-6 min-h-[300px] flex flex-col">
                            <h3 className="text-lg font-bold flex items-center gap-2 mb-6"><BarChart3 size={18} className="text-indigo-400" /> Revenue Flow</h3>
                            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                                <Activity className="text-white/10 mb-2" size={40} />
                                <p className="text-text-muted text-sm italic">Revenue analytics tracking active...</p>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold flex items-center gap-2 mb-6"><Activity size={18} className="text-indigo-400" /> System Alerts</h3>
                            <div className="space-y-4">
                                 {pendingAdmins.length > 0 && (
                                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-left-4 duration-500">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <Shield size={20} className="text-amber-400" />
                                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-amber-400">{pendingAdmins.length} New Admin Enrollment(s)</p>
                                                <p className="text-xs text-amber-400/70 capitalize font-medium">Verification required for system access.</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setActiveTab('users')} className="btn-primary !py-1.5 !px-3 !text-[10px] bg-amber-500 hover:bg-amber-400 shadow-none border-none">Review</button>
                                    </div>
                                )}
                                {disputes.filter(d => d.status === 'OPEN').length > 0 && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle size={20} className="text-red-400" />
                                            <div>
                                                <p className="text-sm font-bold text-red-400">{disputes.filter(d => d.status === 'OPEN').length} Open Dispute(s)</p>
                                                <p className="text-xs text-red-400/70">Requires immediate attention.</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setActiveTab('moderation')} className="text-xs font-bold underline text-red-400">Handle Now</button>
                                    </div>
                                )}
                                <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center text-text-muted text-sm italic">
                                    No other urgent alerts.
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'users' && (
                <div className="glass-card overflow-hidden border border-white/10">
                    <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold flex items-center gap-2"><Users size={18} className="text-indigo-400" /> User Directory</h2>
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                            <input
                                type="text"
                                className="input !py-2 !pl-9 text-sm"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-xs text-text-muted uppercase tracking-wider border-b border-white/10 bg-white/[0.02]">
                                    <th className="px-6 py-4 text-left">Identity</th>
                                    <th className="px-6 py-4 text-left">Internal Role</th>
                                    <th className="px-6 py-4 text-left">Status</th>
                                    <th className="px-6 py-4 text-left">Command</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.05]">
                                {filteredUsers.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-12 text-center text-text-muted italic">No users matching search...</td></tr>
                                ) : filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/10">
                                                    {u.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-text-main leading-none mb-1">{u.profile?.displayName ?? 'New User'}</p>
                                                    <p className="text-xs text-text-muted">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-md text-[0.65rem] font-bold tracking-widest uppercase ${u.role === 'ADMIN' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                         <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {u.isVerified ?
                                                    <span className="flex items-center gap-1 text-[0.65rem] font-black text-green-400 bg-green-500/5 px-2.5 py-1 rounded-full border border-green-500/20 uppercase tracking-widest leading-none">
                                                        <CheckCheck size={10} /> Authorized
                                                    </span> :
                                                    (u.role === 'ADMIN' ? 
                                                        <span className="flex items-center gap-1 text-[0.65rem] font-black text-amber-400 bg-amber-500/5 px-2.5 py-1 rounded-full border border-amber-500/20 uppercase tracking-widest leading-none animate-pulse">
                                                            <Shield size={10} /> Approval Req
                                                        </span> :
                                                        <span className="text-[0.65rem] font-black text-[#7e8fb5] bg-white/5 px-2.5 py-1 rounded-full border border-white/10 uppercase tracking-widest leading-none">
                                                            Pending
                                                        </span>
                                                    )
                                                }
                                                {u.isFlagged && <span className="flex items-center gap-1 text-[0.65rem] font-black text-red-500 bg-red-500/5 px-2.5 py-1 rounded-full border border-red-500/20 uppercase tracking-widest leading-none"><Flag size={10} /> Flagged</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => toggleVerify(u.id)}
                                                    title={u.isVerified ? "De-verify User" : "Approve/Verify User"}
                                                    className={`p-2 rounded-lg transition-all border ${u.isVerified ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-white/5 border-white/10 text-text-muted hover:border-green-500/50 hover:text-green-400'}`}
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => toggleFlag(u.id)}
                                                    title={u.isFlagged ? "Unflag Account" : "Flag for Misuse"}
                                                    className={`p-2 rounded-lg transition-all border ${u.isFlagged ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-text-muted hover:border-red-500/50 hover:text-red-400'}`}
                                                >
                                                    <Flag size={16} />
                                                </button>
                                                <button
                                                    onClick={() => deleteUser(u.id)}
                                                    title="Reject & Delete Account"
                                                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-text-muted hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'moderation' && (
                <div className="grid grid-cols-1 gap-8">
                    {/* Disputes Log */}
                    <div className="glass-card overflow-hidden border border-white/10">
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold flex items-center gap-2"><AlertTriangle size={18} className="text-red-400" /> Payment & Milestone Disputes</h2>
                        </div>
                        <div className="divide-y divide-white/[0.05]">
                            {disputes.length === 0 ? (
                                <div className="p-12 text-center text-text-muted italic flex flex-col items-center gap-3">
                                    <Briefcase size={40} className="text-white/5" />
                                    No active disputes found.
                                </div>
                            ) : disputes.map(d => (
                                <div key={d.id} className="p-6 flex items-start justify-between gap-4 bg-white/[0.01]">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-text-main text-lg">{d.project?.title ?? d.projectId}</p>
                                            <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-black uppercase tracking-widest ${d.status === 'OPEN' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                                                {d.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-text-muted leading-relaxed max-w-2xl bg-white/5 p-4 rounded-xl border border-white/5 italic">"{d.notes}"</p>
                                    </div>
                                    {d.status === 'OPEN' && (
                                        <button
                                            onClick={() => resolveDispute(d.id)}
                                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                                        >
                                            <CheckCheck size={18} /> Resolve
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Misused / Flagged Content Tab */}
                    <div className="glass-card p-6 border border-white/10">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Flag size={18} className="text-red-400" /> Flagged for Misuse</h3>
                        {flaggedUsers.length === 0 ? (
                            <p className="text-text-muted italic text-center py-8">No content is currently flagged for misuse.</p>
                        ) : (
                            <div className="space-y-4">
                                {flaggedUsers.map(u => (
                                    <div key={u.id} className="flex items-center justify-between p-4 bg-red-500/5 rounded-xl border border-red-500/10">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-red-500/10 text-red-400 rounded-lg"><Users size={18} /></div>
                                            <div>
                                                <p className="text-sm font-bold text-text-main">{u.profile?.displayName ?? u.email}</p>
                                                <p className="text-xs text-red-400/70">Potential platform misuse detected.</p>
                                            </div>
                                        </div>
                                        <button onClick={() => toggleFlag(u.id)} className="text-xs font-bold text-text-muted hover:text-text-main underline capitalize">Dismiss Alert</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
