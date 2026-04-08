import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu, X, Shapes } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = React.useCallback(async () => {
        if (!user) return;
        try {
            const res = await axios.get('/api/projects/applications/me/notifications-count').catch(() => ({ data: { count: 0 } }));
            // Note: fallback to basic application fetch if notification endpoint doesn't exist
            let count = 0;
            if (res.data && typeof res.data.count === 'number') {
                count = res.data.count;
            } else {
                const apps = await axios.get('/api/projects/applications/me');
                count = apps.data.filter((a: any) => a.type === 'INVITATION' && a.status === 'PENDING').length;
            }
            setUnreadCount(count);
        } catch (err) {
            console.error('Failed to fetch nav notifications', err);
        }
    }, [user]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        
        let timer: any;
        if (user) {
            timer = setTimeout(() => {
                fetchNotifications();
            }, 0);
            const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
            return () => {
                window.removeEventListener('scroll', onScroll);
                clearTimeout(timer);
                clearInterval(interval);
            };
        }
        
        return () => window.removeEventListener('scroll', onScroll);
    }, [user, fetchNotifications]);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileOpen(false);
    };

    const isActive = (path: string) => location.pathname === path;

    const navLink = (to: string, label: string) => (
        <Link
            to={to}
            onClick={() => setMobileOpen(false)}
            className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-200 relative pb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,1)] ${isActive(to)
                ? 'text-[#818cf8]'
                : 'text-white/90 hover:text-white hover:tracking-[0.25em]'
                }`}
        >
            {label}
            {isActive(to) && (
                <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-primary to-accent rounded-full" />
            )}
        </Link>
    );

    return (
        <header className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'py-2 bg-[#080d1a]/40 backdrop-blur-md' : 'py-3 bg-transparent'}`}>
            <nav className={`mx-4 md:mx-8 px-4 md:px-6 rounded-2xl flex items-center justify-between transition-all duration-300 ${scrolled
                ? 'backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
                : ''
                }`}
                style={{
                    background: scrolled
                        ? 'rgba(8,13,30,0.85)'
                        : 'transparent',
                    padding: '12px 24px'
                }}
            >
                {/* Logo */}
                <div className="flex-1 flex justify-start">
                    <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-[0_0_16px_rgba(99,102,241,0.4)]" style={{ background: 'linear-gradient(135deg, #6366f1, #38bdf8)' }}>
                            <Shapes size={18} className="text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-lg font-black gradient-text">CrewConnect</span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8 justify-center">
                    {user?.role === 'ADMIN' && navLink('/dashboard', 'Admin')}
                </div>

                {/* Desktop Right */}
                <div className="flex-1 hidden md:flex items-center justify-end gap-4">
                    {user ? (
                        <>
                            <div className="flex items-center gap-3 pl-4 border-l border-white/10 ml-1">
                                <Link to="/profile/me" className="flex flex-col items-end hover:opacity-80 transition-opacity">
                                    <span className="text-[11px] font-bold text-white leading-[1.1]">{user.displayName || user.email.split('@')[0]}</span>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400/80">{user.role}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    title="Sign out"
                                    className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/[0.05] hover:border-red-500/20"
                                >
                                    <LogOut size={14} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium text-[#7e8fb5] hover:text-[#f0f4ff] transition-colors px-3 py-2">
                                Sign In
                            </Link>
                            <Link to="/signup" className="btn-primary text-sm px-5 py-2.5">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile toggle */}
                <div className="md:hidden flex-1 flex justify-end">
                    <button onClick={() => setMobileOpen(o => !o)} className="p-2 text-[#7e8fb5] hover:text-[#f0f4ff]">
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </nav>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden mx-4 mt-2 rounded-2xl p-5 space-y-3 border border-white/10"
                    style={{ background: 'rgba(10,16,40,0.97)', backdropFilter: 'blur(24px)' }}>
                    {user?.role === 'ADMIN' && navLink('/dashboard', 'Admin Panel')}
                    <div className="border-t border-white/[0.07] pt-3">
                        {user ? (
                            <div className="flex flex-col gap-3">
                                <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-400 font-medium">
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary py-2.5 text-sm">Sign In</Link>
                                <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary py-2.5 text-sm">Get Started</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
