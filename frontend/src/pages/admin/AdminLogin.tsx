import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Mail, Loader2, AlertCircle, ChevronRight, ArrowLeft } from 'lucide-react';

const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            if (res.data.user.role !== 'ADMIN') {
                setError('Access denied. This portal is for administrators only.');
                return;
            }
            login(res.data);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px]" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative w-full max-w-md">
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#7e8fb5] hover:text-white mb-8 transition-colors group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Site
                </Link>

                <div className="glass-card p-8 md:p-10 space-y-8 border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.05)]">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                            <Shield size={32} />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Admin Portal</h1>
                        <p className="text-[#7e8fb5] font-medium uppercase tracking-[0.2em] text-[10px]">Secure Authorization Required</p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm animate-in fade-in slide-in-from-top-1">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#4a5578] uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5578] group-focus-within:text-amber-500 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="input pl-12 focus:border-amber-500/50 focus:shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                                    placeholder="admin@crewconnect.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#4a5578] uppercase tracking-widest ml-1">Secure Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5578] group-focus-within:text-amber-500 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="input pl-12 focus:border-amber-500/50 focus:shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-900/40 hover:shadow-amber-500/20 disabled:opacity-50 mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>Access Terminal <ChevronRight size={20} /></>
                            )}
                        </button>
                    </form>

                    <div className="pt-6 border-t border-white/5 text-center">
                        <p className="text-sm text-[#4a5578]">
                            New administrator? <Link to="/admin/register" className="text-amber-400 hover:text-amber-300 font-bold transition-colors">Request Access</Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-6 text-[10px] font-bold text-[#4a5578] uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Shield size={12} /> Encrypted Session</span>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span>IP Logged</span>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
