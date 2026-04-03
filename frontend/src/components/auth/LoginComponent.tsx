import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, ArrowRight, Loader2, Zap, Eye, EyeOff, Briefcase, Sparkles } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

type LoginRole = 'BRAND' | 'CREATOR' | 'ADMIN';

const ROLES: { key: LoginRole; label: string; icon: React.ReactNode; color: string; border: string; desc: string }[] = [
    {
        key: 'BRAND',
        label: 'Brand',
        icon: <Briefcase size={18} />,
        color: 'text-sky-400',
        border: 'border-sky-400',
        desc: 'I post projects & hire creators',
    },
    {
        key: 'CREATOR',
        label: 'Creator / Talent',
        icon: <Sparkles size={18} />,
        color: 'text-violet-400',
        border: 'border-violet-400',
        desc: 'Creators, Writers, Editors & Freelancers',
    },
];

interface LoginComponentProps {
    onSuccess?: () => void;
    isModal?: boolean;
}

const LoginComponent: React.FC<LoginComponentProps> = ({ onSuccess, isModal = false }) => {
    const [selectedRole, setSelectedRole] = useState<LoginRole>('CREATOR');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSuccess = () => {
        if (onSuccess) {
            onSuccess();
        } else {
            // Force dashboard redirection to ensure correct role-based dashboard loading
            navigate('/dashboard', { replace: true });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/auth/login', {
                email,
                password,
                expectedRole: selectedRole,
            });
            login(res.data);
            handleSuccess();
        } catch (err) {
            const axiosError = err as any; 
            setError(axiosError.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/auth/google', {
                credential: credentialResponse.credential,
            });
            login(res.data);
            handleSuccess();
        } catch (err) {
            const axiosError = err as any;
            const message = axiosError.response?.status === 404 
                ? 'do registration first !!' 
                : (axiosError.response?.data?.message || 'Google Login failed. Please try again.');
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const activeRole = ROLES.find(r => r.key === selectedRole)!;

    return (
        <div className={`relative w-full max-w-md ${isModal ? '' : 'px-4'}`}>
            {/* Logo */}
            <div className="flex flex-col items-center mb-4 gap-2">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-[0_0_32px_rgba(99,102,241,0.4)]" style={{ background: 'linear-gradient(135deg, #6366f1, #38bdf8)' }}>
                    <Zap size={22} className="text-white" fill="white" />
                </div>
                <div className="text-center">
                    <h1 className="text-3xl font-black text-[#f0f4ff]">Welcome Back</h1>
                    <p className="text-[#7e8fb5] mt-1">Sign in to your creative workspace</p>
                </div>
            </div>

            {/* Role Selector Tabs */}
            <div className="glass-card p-1.5 flex gap-1.5 mb-4">
                {ROLES.map(role => (
                    <button
                        key={role.key}
                        type="button"
                        onClick={() => { setSelectedRole(role.key); setError(''); }}
                        className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                            selectedRole === role.key
                                ? `bg-white/10 ${role.color} border ${role.border} shadow-sm`
                                : 'text-[#7e8fb5] hover:text-[#a8b8d8] hover:bg-white/5 border border-transparent'
                        }`}
                    >
                        {role.icon}
                        <span>{role.label}</span>
                    </button>
                ))}
            </div>

            {/* Role description */}
            <p className={`text-center text-xs mb-3 font-medium ${activeRole.color}`}>
                {activeRole.desc}
            </p>

            {/* Card */}
            <div className="glass-card p-8 space-y-6">
                {error && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                        <span>⚠</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-[#a8b8d8]">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5578]" size={17} />
                            <input
                                type="email"
                                className="input pl-11"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-[#a8b8d8]">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5578]" size={17} />
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input pl-11 pr-11"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a5578] hover:text-[#a8b8d8] transition-colors">
                                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                        </div>
                        <div className="flex justify-end pt-1">
                            <Link to="/forgot-password" onClick={onSuccess} className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-4 text-base shadow-[0_8px_32px_rgba(99,102,241,0.35)]">
                        {loading
                            ? <><Loader2 className="animate-spin" size={19} /> Signing in...</>
                            : <>Sign in as {activeRole.label} <ArrowRight size={19} /></>
                        }
                    </button>
                </form>

                {/* Google login — hidden for Admin */}
                {selectedRole !== 'ADMIN' && (
                    <>
                        <div className="relative flex items-center gap-3">
                            <div className="flex-1 h-px bg-white/[0.07]" />
                            <span className="text-xs text-[#4a5578]">OR</span>
                            <div className="flex-1 h-px bg-white/[0.07]" />
                        </div>
                        <div className="flex justify-center w-full">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google Login Failed')}
                                theme="filled_black"
                                width="100%"
                                text="continue_with"
                                shape="circle"
                            />
                        </div>
                    </>
                )}

                <p className="text-center text-sm text-[#7e8fb5] flex flex-col gap-3">
                    <span>
                        Don't have an account?{' '}
                        <Link to="/signup" onClick={onSuccess} className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                            Create Account
                        </Link>
                    </span>
                    <span className="text-xs opacity-50 pt-2 border-t border-white/5">
                        Administrative staff? <Link to="/admin/login" onClick={onSuccess} className="text-amber-400 hover:underline">Access Terminal</Link>
                    </span>
                </p>
            </div>
        </div>
    );
};

export default LoginComponent;
