import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Mail, Loader2, AlertCircle, ChevronRight, ArrowLeft, Key, UserPlus } from 'lucide-react';

const AdminRegistration: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        adminSecret: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/auth/register', { 
                email: formData.email, 
                password: formData.password,
                role: 'ADMIN',
                adminSecret: formData.adminSecret
            });
            login(res.data);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Check your secret key.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] p-4 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative w-full max-w-md">
                <Link to="/admin/login" className="inline-flex items-center gap-2 text-sm text-[#7e8fb5] hover:text-white mb-8 transition-colors group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Admin Login
                </Link>

                <div className="glass-card p-8 md:p-10 space-y-6 border-red-500/20">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
                            <UserPlus size={32} />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Admin Enrollment</h1>
                        <p className="text-[#7e8fb5] text-sm">Create a new administrative identity</p>
                        <div className="pt-2">
                             <span className="text-[10px] font-black uppercase tracking-tighter text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                Requires Manual Approval
                             </span>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#4a5578] uppercase tracking-widest ml-1">Secret Key</label>
                            <div className="relative group">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5578] group-focus-within:text-red-500 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="input pl-12 focus:border-red-500/50"
                                    placeholder="Enter System Secret"
                                    value={formData.adminSecret}
                                    onChange={(e) => setFormData({ ...formData, adminSecret: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#4a5578] uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5578]" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="input pl-12"
                                    placeholder="yourname@admin.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#4a5578] uppercase tracking-widest ml-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="input"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#4a5578] uppercase tracking-widest ml-1">Confirm</label>
                                <input
                                    type="password"
                                    required
                                    className="input"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>Enroll Identity <ChevronRight size={20} /></>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminRegistration;
