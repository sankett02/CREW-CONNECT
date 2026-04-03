import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to process request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full glass-card p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center">
                    <h2 className="text-3xl font-black text-white text-shadow-glow">Forgot Password</h2>
                    <p className="mt-2 text-sm text-text-muted">
                        Enter your email address and we'll send you a link to securely reset your password.
                    </p>
                </div>

                {success ? (
                    <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-2xl flex flex-col items-center gap-4 text-center">
                        <CheckCircle2 size={48} className="text-green-400" />
                        <div>
                            <p className="text-green-400 font-bold text-lg mb-1">Check Your Email</p>
                            <p className="text-sm text-text-muted">If an account exists for {email}, a recovery link has been sent.</p>
                        </div>
                        <Link to="/login" className="mt-2 w-full btn-primary py-3 flex justify-center text-sm">
                            Return to Login
                        </Link>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-muted mb-2 ml-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="input pl-10"
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full btn-primary py-3 flex justify-center items-center gap-2"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
                        </button>

                        <div className="text-center mt-4 text-sm text-text-muted">
                            Remember your password?{' '}
                            <Link to="/login" className="font-bold text-primary hover:text-accent transition-colors">
                                Sign In
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
