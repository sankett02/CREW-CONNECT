import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, UserPlus, Loader2, Eye, EyeOff, Shield, Building2, Globe, Sparkles, CheckCircle2, ChevronRight, ChevronLeft, AlertCircle, Phone, Instagram, Youtube, Linkedin, Link2, User, Target, Trash2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Signup: React.FC = () => {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState('CREATOR');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // Professional Details
    const [companyName, setCompanyName] = useState('');
    const [displayName, setDisplayName] = useState(''); // Real Name for Creators
    const [category, setCategory] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [portfolioUrl, setPortfolioUrl] = useState('');
    const [bio, setBio] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [skills, setSkills] = useState('');
    const [nicheTags, setNicheTags] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    // Social & Portfolio Links
    const [instagram, setInstagram] = useState('');
    const [youtube, setYoutube] = useState('');
    const [linkedin, setLinkedin] = useState('');
    
    const [adminSecret, setAdminSecret] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [userId, setUserId] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

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
            setProfileImage(res.data.url);
        } catch {
            setError('Failed to upload image. Please try again.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleRemoveImage = () => {
        setProfileImage('');
    };

    const handleNext = () => {
        if (step === 2) {
            if (role === 'BRAND') {
                if (!companyName || !websiteUrl || !bio || !category || !contactNumber) {
                    setError('Please fill in all mandatory brand details.');
                    return;
                }
            } else if (['CREATOR', 'WRITER', 'EDITOR'].includes(role)) {
                if (!displayName || !bio || !skills || !nicheTags || !contactNumber) {
                    setError(`Please fill in all mandatory ${role.toLowerCase()} details.`);
                    return;
                }
            }
        }
        setError('');
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setError('');
        setStep(prev => prev - 1);
    };

    const getPayload = () => {
        const socialLinks = { instagram, youtube, linkedin };
        const portfolioLinks = ['CREATOR', 'WRITER', 'EDITOR'].includes(role) ? [portfolioUrl].filter(Boolean) : [];
        
        return {
            email, 
            password, 
            role, 
            adminSecret,
            companyName,
            websiteUrl,
            bio,
            category,
            contactNumber,
            socialLinks,
            portfolioLinks,
            profileImage,
            displayName,
            skills,
            nicheTags
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/auth/register', getPayload());
            if (res.data.requireVerification) {
                setUserId(res.data.userId);
                setStep(4);
                startResendTimer();
            } else {
                login(res.data);
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/auth/google', {
                ...getPayload(),
                credential: credentialResponse.credential,
                isSignup: true, // Flag to allow user creation in backend
            });
            login(res.data);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Google Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleVerifyOtp = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            setError('Please enter a valid 6-digit code.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/auth/verify-otp', { userId, otp: otpCode });
            login(res.data);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Verification failed.');
        } finally {
            setLoading(false);
        }
    };

    const startResendTimer = () => {
        setResendTimer(60);
        const interval = setInterval(() => {
            setResendTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        setError('');
        try {
            await axios.post('/api/auth/resend-otp', { userId });
            startResendTimer();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center overflow-hidden py-4 px-4 bg-[#0a0c10]">
            {/* Background glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-sky-600/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative w-full max-w-lg">
                {/* Progress Bar */}
                {step === 1 && (
                    <div className="flex items-center justify-between mb-8 px-2">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex items-center flex-1 last:flex-none">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-500 ${step >= s ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-white/5 text-[#4a5578] border border-white/5'}`}>
                                    {step > s ? <CheckCircle2 size={20} /> : s}
                                </div>
                                {s < 4 && <div className={`h-1 flex-1 mx-3 rounded-full transition-all duration-500 ${step > s ? 'bg-indigo-600' : 'bg-white/5'}`} />}
                            </div>
                        ))}
                    </div>
                )}

                {/* Card */}
                <div className="glass-card p-8 md:p-10 space-y-6">
                    <div className="text-center space-y-1">
                        <h1 className="text-3xl font-black text-[#f0f4ff]">
                            {step === 1 ? 'Choose Your Path' : step === 2 ? 'Professional Details' : step === 3 ? 'Secure Your Account' : 'Verify Your Email'}
                        </h1>
                        <p className="text-[#7e8fb5]">
                            {step === 1 ? 'Select how you want to use CrewConnect' : step === 2 ? 'Tell us more about your business or craft' : step === 3 ? 'Finalize your login credentials' : 'Enter the 6-digit code sent to your email'}
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm animate-in fade-in slide-in-from-top-1">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {/* STEP 1: ROLE SELECTION */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { id: 'CREATOR', title: 'I am a Creator', desc: 'I build content and manage communities', icon: Sparkles },
                                    { id: 'WRITER', title: 'I am a Writer', desc: 'I craft scripts, blogs, and copy', icon: Mail },
                                    { id: 'EDITOR', title: 'I am an Editor', desc: 'I specialize in video & motion graphics', icon: Target },
                                    { id: 'BRAND', title: 'I am a Brand', desc: 'I want to find talent for my projects', icon: Building2 }
                                ].map((r) => (
                                    <button
                                        key={r.id}
                                        onClick={() => setRole(r.id)}
                                        className={`p-4 rounded-2xl border text-left transition-all duration-300 group ${role === r.id 
                                            ? 'bg-indigo-600/10 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.1)]' 
                                            : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${role === r.id ? 'bg-indigo-600 text-white' : 'bg-white/5 text-[#4a5578] group-hover:text-[#a8b8d8]'}`}>
                                                <r.icon size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`font-bold text-base ${role === r.id ? 'text-white' : 'text-[#f0f4ff]'}`}>{r.title}</h3>
                                                <p className="text-[11px] text-[#7e8fb5]">{r.desc}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${role === r.id ? 'border-indigo-500 bg-indigo-500' : 'border-white/10'}`}>
                                                {role === r.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <button onClick={handleNext} className="btn-primary w-full py-4 text-lg">
                                Continue <ChevronRight size={20} />
                            </button>
                        </div>
                    )}

                    {/* STEP 2: PROFESSIONAL DETAILS */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="space-y-6">
                                {/* Profile Image Upload */}
                                <div className="flex flex-col items-center gap-4 py-2">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                                            {profileImage ? (
                                                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={32} className="text-[#4a5578]" />
                                            )}
                                        </div>
                                        <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-3xl">
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">{uploadingImage ? 'Uploading...' : profileImage ? 'Change' : 'Upload'}</span>
                                        </label>
                                        {profileImage && !uploadingImage && (
                                            <button 
                                                onClick={handleRemoveImage}
                                                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                                                title="Remove Image"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-[#4a5578] uppercase font-bold tracking-widest">Profile Image (Optional)</p>
                                </div>

                                {role === 'BRAND' ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-[#4a5578] uppercase tracking-wider">Brand Name</label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5578]" size={15} />
                                                    <input type="text" className="input pl-10 h-11 text-sm" placeholder="e.g. Acme Corp" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-[#4a5578] uppercase tracking-wider">Category</label>
                                                <select className="input h-11 text-sm appearance-none bg-[#1a1c24]" value={category} onChange={(e) => setCategory(e.target.value)}>
                                                    <option value="">Select Category</option>
                                                    {['Tech', 'Finance', 'Fitness', 'Lifestyle', 'Fashion', 'SaaS', 'Agency', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#4a5578] uppercase tracking-wider">Website URL</label>
                                            <div className="relative">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5578]" size={15} />
                                                <input type="url" className="input pl-10 h-11 text-sm" placeholder="https://brand.com" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#4a5578] uppercase tracking-wider">Contact Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5578]" size={15} />
                                                <input type="tel" className="input pl-10 h-11 text-sm" placeholder="+1 (555) 000-0000" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#4a5578] uppercase tracking-wider">Brand Description</label>
                                            <textarea className="input p-4 min-h-[100px] text-sm resize-none" placeholder="Tell us about your brand vision..." value={bio} onChange={(e) => setBio(e.target.value)} />
                                        </div>

                                        <div className="space-y-3 pt-2">
                                            <label className="text-xs font-bold text-[#4a5578] uppercase tracking-wider">Social Links</label>
                                            <div className="grid grid-cols-1 gap-2">
                                                <div className="relative">
                                                    <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5578]" size={15} />
                                                    <input type="text" className="input pl-10 h-10 text-xs" placeholder="Instagram Username" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                                                </div>
                                                <div className="relative">
                                                    <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5578]" size={15} />
                                                    <input type="text" className="input pl-10 h-10 text-xs" placeholder="YouTube Channel Link" value={youtube} onChange={(e) => setYoutube(e.target.value)} />
                                                </div>
                                                <div className="relative">
                                                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5578]" size={15} />
                                                    <input type="text" className="input pl-10 h-10 text-xs" placeholder="LinkedIn Profile" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : role === 'ADMIN' ? (
                                    <div className="space-y-1.5 pt-2">
                                        <label className="text-sm font-semibold text-indigo-400 capitalize">🔒 Admin Secret Passcode</label>
                                        <div className="relative">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400/50" size={17} />
                                            <input
                                                type="password"
                                                className="input pl-11 border-indigo-500/30 focus:border-indigo-500/60"
                                                placeholder="Enter the master secret"
                                                value={adminSecret}
                                                onChange={(e) => setAdminSecret(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-[#4a5578] uppercase tracking-wider">Full Name</label>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5578]" size={15} />
                                                    <input type="text" className="input pl-10 h-11 text-sm" placeholder="Your Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-[#4a5578] uppercase tracking-wider">
                                                    {role === 'WRITER' ? 'Writing Niche' : role === 'EDITOR' ? 'Editing Style' : 'Content Niche'}
                                                </label>
                                                <div className="relative">
                                                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5578]" size={15} />
                                                    <input 
                                                        type="text" 
                                                        className="input pl-10 h-11 text-sm" 
                                                        placeholder={role === 'WRITER' ? 'e.g. Scriptwriting, Blogging' : role === 'EDITOR' ? 'e.g. Documentary, YouTube' : 'e.g. Tech Reviewer'} 
                                                        value={nicheTags} 
                                                        onChange={(e) => setNicheTags(e.target.value)} 
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#4a5578] uppercase tracking-wider">Contact Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5578]" size={15} />
                                                <input type="tel" className="input pl-10 h-11 text-sm" placeholder="+1 (555) 000-0000" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#4a5578] uppercase tracking-wider">
                                                {role === 'EDITOR' ? 'Softwares Used' : 'Key Skills'}
                                            </label>
                                            <div className="relative">
                                                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5578]" size={15} />
                                                <input 
                                                    type="text" 
                                                    className="input pl-10 h-11 text-sm" 
                                                    placeholder={role === 'EDITOR' ? 'Premiere Pro, After Effects...' : 'SEO, Scripting, Comedy...'} 
                                                    value={skills} 
                                                    onChange={(e) => setSkills(e.target.value)} 
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#4a5578] uppercase tracking-wider">Portfolio / Work Link</label>
                                            <div className="relative">
                                                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5578]" size={15} />
                                                <input type="url" className="input pl-10 h-11 text-sm" placeholder="Link to your best work..." value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#4a5578] uppercase tracking-wider">Professional Bio</label>
                                            <textarea className="input p-4 min-h-[100px] text-sm resize-none" placeholder="Tell brands about your background and experience..." value={bio} onChange={(e) => setBio(e.target.value)} />
                                        </div>

                                        <div className="space-y-3 pt-2">
                                            <label className="text-xs font-bold text-[#4a5578] uppercase tracking-wider">Social Links</label>
                                            <div className="grid grid-cols-1 gap-2">
                                                <div className="relative">
                                                    <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5578]" size={15} />
                                                    <input type="text" className="input pl-10 h-10 text-xs" placeholder="Instagram Username" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                                                </div>
                                                <div className="relative">
                                                    <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5578]" size={15} />
                                                    <input type="text" className="input pl-10 h-10 text-xs" placeholder="YouTube Channel Link" value={youtube} onChange={(e) => setYoutube(e.target.value)} />
                                                </div>
                                                <div className="relative">
                                                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5578]" size={15} />
                                                    <input type="text" className="input pl-10 h-10 text-xs" placeholder="LinkedIn Profile" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button onClick={handleBack} className="btn-secondary flex-1 py-4">
                                    <ChevronLeft size={20} /> Back
                                </button>
                                <button onClick={handleNext} className="btn-primary flex-[2] py-4">
                                    Continue <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: ACCOUNT SECURITY */}
                    {step === 3 && (
                        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-4">
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
                                            placeholder="Create a strong password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            minLength={6}
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a5578] hover:text-[#a8b8d8] transition-colors">
                                            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-[#a8b8d8]">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5578]" size={17} />
                                        <input
                                            type="password"
                                            className="input pl-11"
                                            placeholder="Repeat password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button type="button" onClick={handleBack} disabled={loading} className="btn-secondary flex-1 py-4">
                                    <ChevronLeft size={20} /> Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary flex-[2] py-4 text-lg shadow-[0_8px_32px_rgba(99,102,241,0.35)]"
                                >
                                    {loading
                                        ? <><Loader2 className="animate-spin" size={20} /> Sending Code...</>
                                        : <><UserPlus size={20} /> Create Account</>
                                    }
                                </button>
                            </div>
                        </form>
                    )}

                    {/* STEP 4: OTP VERIFICATION */}
                    {step === 4 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex justify-center gap-3">
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        id={`otp-${i}`}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-black bg-white/5 border border-white/10 rounded-2xl text-white focus:border-indigo-500 focus:bg-indigo-500/10 transition-all outline-none"
                                    />
                                ))}
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={loading}
                                    className="btn-primary w-full py-4 text-lg shadow-[0_8px_32px_rgba(99,102,241,0.35)]"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                    Verify & Complete
                                </button>
                                
                                <div className="text-center">
                                    <button
                                        onClick={handleResendOtp}
                                        disabled={resendTimer > 0}
                                        className={`text-sm font-semibold transition-colors ${resendTimer > 0 ? 'text-[#4a5578]' : 'text-indigo-400 hover:text-indigo-300'}`}
                                    >
                                        {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Verification Code'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="relative flex items-center gap-3">
                                <div className="flex-1 h-px bg-white/[0.07]" />
                                <span className="text-xs text-[#4a5578]">OR CONTINUING WITH</span>
                                <div className="flex-1 h-px bg-white/[0.07]" />
                            </div>

                            <div className="flex justify-center w-full">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => setError('Google Signup Failed')}
                                    theme="filled_black"
                                    width="100%"
                                    text="signup_with"
                                    shape="circle"
                                />
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <p className="text-center text-sm text-[#7e8fb5] flex flex-col gap-3">
                            <span>
                                Already have an account?{' '}
                                <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                                    Sign In
                                </Link>
                            </span>
                            <span className="text-xs opacity-50 pt-2 border-t border-white/5">
                                Administrative staff? <Link to="/admin/register" className="text-amber-400 hover:underline">Access Portal</Link>
                            </span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Signup;
