import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users, Sparkles, Rocket, Star, Target, CheckCircle2,
  X, Mail, Phone, MapPin, ArrowLeft, ArrowRight, Zap,
  Twitter, Instagram, Linkedin, Github, ChevronRight, Globe, ShieldCheck,
  MessageSquare, Search, Layout as LayoutIcon
} from 'lucide-react';
import VideoHero from '../components/shared/VideoHero';

const LandingModal = ({ type, onClose, navigate }: { type: string, onClose: () => void, navigate: (path: string) => void }) => {
  const content: Record<string, any> = {
    contact: {
      title: "Get in Touch",
      subtitle: "Have a project in mind or need help? Reach out to our elite team.",
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Full Name" className="w-full bg-[#0d1425] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-indigo-500/50 outline-none transition-all" />
            <input type="email" placeholder="Email Address" className="w-full bg-[#0d1425] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-indigo-500/50 outline-none transition-all" />
          </div>
          <textarea placeholder="Tell us about your project..." rows={4} className="w-full bg-[#0d1425] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-indigo-500/50 outline-none transition-all resize-none"></textarea>
          <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all">Send Message</button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-3 text-slate-400 text-sm">
              <Mail size={16} className="text-indigo-400" /> hello@crewconnect.com
            </div>
            <div className="flex items-center gap-3 text-slate-400 text-sm">
              <Phone size={16} className="text-indigo-400" /> +1 (555) 000-0000
            </div>
            <div className="flex items-center gap-3 text-slate-400 text-sm">
              <MapPin size={16} className="text-indigo-400" /> Silicon Valley, CA
            </div>
          </div>
        </div>
      )
    },
    pricing: {
      title: "Transparent Pricing",
      subtitle: "Built for every stage of your creative workflow.",
      component: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-[#0d1425] border border-white/10 rounded-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-white font-black text-lg">Starter</h4>
                <p className="text-slate-500 text-xs">For solo creators</p>
              </div>
              <span className="text-2xl font-black text-white">$0<span className="text-xs text-slate-600">/mo</span></span>
            </div>
            <ul className="space-y-3">
              {['Basic Portfolio', 'Up to 3 Projects', 'Public Reviews'].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-400"><CheckCircle2 size={14} className="text-emerald-400" /> {f}</li>
              ))}
            </ul>
            <button onClick={() => navigate('/signup')} className="w-full py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg border border-white/10 transition-all text-xs">Choose Free</button>
          </div>
          <div className="p-6 bg-indigo-600/10 border border-indigo-500/50 rounded-2xl space-y-4 relative">
            <span className="absolute -top-3 right-4 bg-indigo-600 text-[10px] font-black uppercase px-2 py-1 rounded-full text-white tracking-widest">Popular</span>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-white font-black text-lg">Pro Crew</h4>
                <p className="text-slate-500 text-xs">For growing teams</p>
              </div>
              <span className="text-2xl font-black text-white">$29<span className="text-xs text-slate-600">/mo</span></span>
            </div>
            <ul className="space-y-3">
              {['Unlimited Projects', 'Custom Team Tools', 'Priority Support'].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-400"><Sparkles size={14} className="text-indigo-400" /> {f}</li>
              ))}
            </ul>
            <button onClick={() => navigate('/signup')} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all text-xs shadow-lg shadow-indigo-600/20">Go Pro</button>
          </div>
        </div>
      )
    },
    careers: {
      title: "Join the Core Crew",
      subtitle: "We're looking for the next wave of creative engineering talent.",
      component: (
        <div className="space-y-6">
          <div className="space-y-3">
            {[
              { role: "Product Designer", type: "Full-Time", location: "Remote" },
              { role: "Backend Architect", type: "Full-Time", location: "San Francisco" },
              { role: "Community Lead", type: "Contract", location: "Remote" }
            ].map((job, i) => (
              <div key={i} className="p-4 bg-[#0d1425] border border-white/10 rounded-xl flex justify-between items-center group hover:border-indigo-500/30 transition-all cursor-pointer">
                <div>
                  <h5 className="text-white font-bold text-sm tracking-tight">{job.role}</h5>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{job.type} • {job.location}</p>
                </div>
                <ChevronRight size={18} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs text-center italic">Don't see your role? Email us at careers@crewconnect.com</p>
        </div>
      )
    }
  };

  const current = content[type];
  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[#080d1a]/95 backdrop-blur-3xl animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-2xl glass-premium bg-[#080d1a] border border-white/10 rounded-[2.5rem] overflow-hidden animate-in zoom-in-95 duration-300 shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all z-50">
          <X size={18} />
        </button>
        
        {/* Accent Blobs */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-violet-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="p-8 md:p-12 relative z-10">
          <div className="space-y-2 mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">{current.title}</h2>
            <p className="text-slate-400 text-base">{current.subtitle}</p>
          </div>
          {current.component}
        </div>
      </div>
    </div>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [activeModal, setActiveModal] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    { 
      title: 'Creators', 
      icon: <Sparkles className="text-violet-400" />, 
      desc: 'Video creators, influencers, and visual storytellers.', 
      cta: 'Explore Creators',
      image: "/photos/creators.png"
    },
    { 
      title: 'Writers', 
      icon: <MessageSquare className="text-sky-400" />, 
      desc: 'Scriptwriters, copywriters, and content strategists.', 
      cta: 'Find Writers',
      image: "/photos/writers.png"
    },
    { 
      title: 'Editors', 
      icon: <LayoutIcon className="text-emerald-400" />, 
      desc: 'Video editors, motion designers, and sound engineers.', 
      cta: 'Hire Editors',
      image: "/photos/editors.png"
    },
    { 
      title: 'Brands', 
      icon: <Globe className="text-amber-400" />, 
      desc: 'Startups and enterprises looking to scale their content.', 
      cta: 'Post a Project',
      image: "/photos/brands.png"
    },
  ];

  const steps = [
    { title: 'Post a Project', desc: 'Brands launch polished briefs with clear goals and budgets.', icon: <Target /> },
    { title: 'Discover Talent', desc: 'Vetted creatives apply with their best portfolios and ideas.', icon: <Search /> },
    { title: 'Form Your Team', desc: 'Writers, editors, and creators join forces in one workspace.', icon: <Users /> },
    { title: 'Deliver Excellence', desc: 'Collaborate seamlessly and ship world-class content.', icon: <Rocket /> },
  ];


  const brandLogos = [
    { name: 'Meta', url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg' },
    { name: 'Google', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
    { name: 'Netflix', url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
    { name: 'P&G', url: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Procter_%26_Gamble_logo.svg' },
    { name: 'PayPal', url: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg' },
    { name: 'Payoneer', url: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Payoneer_logo.svg' }
  ];

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const scrollInterval = React.useRef<any>(null);

  const startAutoScroll = (direction: 'left' | 'right') => {
    if (scrollInterval.current) return;
    scrollInterval.current = setInterval(() => {
      if (scrollRef.current) {
        const amount = direction === 'right' ? 8 : -8;
        scrollRef.current.scrollLeft += amount;
      }
    }, 10);
  };

  const stopAutoScroll = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = null;
    }
  };

  const updatedQuickCategories = [
    { title: 'Vibe Coding', image: '/photos/vibe_coding.png', color: 'bg-[#002b1b]', desc: 'Build apps at the speed of thought with AI-first workflows.' },
    { title: 'Graphics & Design', image: '/photos/graphics_design.png', color: 'bg-[#1e3a1e]', desc: 'High-end visual identities for next-gen startups.' },
    { title: 'Video Editing', image: '/photos/video_editing.png', color: 'bg-[#2b1a1a]', desc: 'Cinematic post-production and high-impact social content.' },
    { title: 'Digital Marketing', image: '/photos/digital_marketing.png', color: 'bg-[#1a2b3a]', desc: 'Data-driven growth strategies to scale your brand.' },
    { title: 'Writing & Translation', image: '/photos/writing.png', color: 'bg-[#2b2b1a]', desc: 'World-class copywriting for maximum global impact.' },
    { title: 'AI Development', image: '/photos/ai_services.png', color: 'bg-[#0a1a2b]', desc: 'Custom AI solutions for intelligent enterprise systems.' },
    { title: 'Music & Audio', image: '/photos/music.png', color: 'bg-[#1a0a1a]', desc: 'Professional sound design for immersive experiences.' },
    { title: 'Business Strategy', image: '/photos/business.png', color: 'bg-[#2b2505]', desc: 'Strategic consulting for high-growth firms.' },
  ];

  const features = [
    { title: 'Team Formation', desc: 'Easily assemble specialized roles for complex projects.', icon: <Users /> },
    { title: 'Easier Collaboration', desc: 'Unified workspace for feedback, files, and milestones.', icon: <MessageSquare /> },
    { title: 'Faster Execution', desc: 'Streamlined workflows mean you ship 2x faster.', icon: <Zap /> },
    { title: 'Better Matching', desc: 'Our AI finds the perfect talent for your specific niche.', icon: <Target /> },
    { title: 'High Quality Work', desc: 'Vetted professionals ensure every deliverable shines.', icon: <Star /> },
  ];

  return (
    <div className="min-h-screen bg-[#080d1a] selection:bg-indigo-500/30">
      {/* 1. Navbar */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#080d1a]/80 backdrop-blur-xl border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-sky-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Rocket className="text-white fill-white/20" size={24} />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">CrewConnect</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              <a href="#vision" className="hover:text-indigo-400 transition-colors drop-shadow-[0_2px_12px_rgba(0,0,0,1)]">About</a>
              <a href="#features" className="hover:text-indigo-400 transition-colors drop-shadow-[0_2px_12px_rgba(0,0,0,1)]">Features</a>
              <a href="#how-it-works" className="hover:text-indigo-400 transition-colors drop-shadow-[0_2px_12px_rgba(0,0,0,1)]">How It Works</a>
              <a href="#categories" className="hover:text-indigo-400 transition-colors drop-shadow-[0_2px_12px_rgba(0,0,0,1)]">Categories</a>
              <a href="#trust" className="hover:text-indigo-400 transition-colors drop-shadow-[0_2px_12px_rgba(0,0,0,1)]">Trust</a>
              <a href="#resources" className="hover:text-indigo-400 transition-colors drop-shadow-[0_2px_12px_rgba(0,0,0,1)]">Resources</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <button 
                onClick={() => navigate('/dashboard')} 
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2"
              >
                Go to Dashboard <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="text-sm font-bold text-white px-6 py-2 hover:opacity-80 transition-opacity">Login</button>
                <button onClick={() => navigate('/signup')} className="btn-primary text-sm px-6 py-2.5">Sign Up</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden">
        <VideoHero 
          videoSrc="/assets/videos/Cinematic_Startup_Hero_Background_Video.mp4"
          fullScreen={true}
          title={
            <div className="space-y-2 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black tracking-[0.3em] uppercase mb-2 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <Sparkles size={12} className="animate-pulse" /> The Elite Creator Ecosystem
              </div>
              <h1 className="text-6xl md:text-8xl lg:text-[6rem] xl:text-[6.5rem] font-black tracking-tighter leading-[0.8] text-white">
                Best <br className="hidden md:block" />
                <span className="gradient-text-vivid">Creative Crews.</span>
              </h1>
            </div>
          }
          subtitle="CrewConnect is an elite ecosystem designed to bridge the gap between visionary brands and world-class creative talent. Form specialized project teams and deliver extraordinary content at the speed of light."
          action={
            <div className="space-y-6 w-full flex flex-col items-center">
              <div className="flex flex-wrap gap-4 justify-center">
                <button onClick={() => navigate('/signup')} className="btn-primary text-base md:text-lg px-8 md:px-10 py-3.5 md:py-4 shadow-[0_20px_50px_rgba(79,70,229,0.3)] group">
                  Start Your Crew <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </button>
                <button 
                  onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="btn-secondary text-base md:text-lg px-8 md:px-10 py-3.5 md:py-4 bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-md"
                >
                  Explore Talent
                </button>
              </div>
              

            </div>
          }
        />
        
        {/* Floating Background Glows */}
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[120px] pointer-events-none" />
      </section>

      {/* 3. Trusted Section */}
      <section id="trust" className="section-padding bg-[#0a1124]/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-16">
          <div className="flex flex-col items-center gap-4">
             <div className="h-px w-12 bg-indigo-500/50 mb-2" />
             <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">Trusted by the next generation</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
            {brandLogos.map(logo => (
              <img 
                key={logo.name} 
                src={logo.url} 
                alt={logo.name} 
                className="h-8 md:h-10 w-auto object-contain brightness-0 invert opacity-80 group-hover:opacity-100 transition-all"
              />
            ))}
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 text-[11px] text-slate-500 font-black uppercase tracking-widest">
            <div className="flex items-center gap-3">
              <ShieldCheck size={14} className="text-indigo-500" /> Enterprise-Grade Vetting
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 size={14} className="text-indigo-500" /> Secure Escrow Payments
            </div>
            <div className="flex items-center gap-3">
              <Users size={14} className="text-indigo-500" /> Global Talent Integration
            </div>
          </div>
        </div>
      </section>

      {/* 3.5 Popular Services Carousel - Gen-Z Refined */}
      <section className="py-16 bg-[#080d1a] relative overflow-hidden">
        {/* Glow Accents */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-screen-2xl mx-auto px-6 relative z-10">
          <div className="flex justify-between items-end mb-12">
            <div>
               <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">Popular services</h2>
               <p className="text-slate-400 text-lg">Make it all happen with elite freelancers</p>
            </div>
            <div className="hidden md:flex flex-col items-end gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 opacity-60">Interaction</span>
              <span className="text-slate-500 text-xs font-medium">Hover right edge to explore</span>
            </div>
          </div>

          <div className="relative group/carousel">
            <div 
              ref={scrollRef}
              className="flex gap-8 overflow-x-auto no-scrollbar pb-12 scroll-smooth px-4"
            >
              {updatedQuickCategories.map((cat, i) => (
                <div 
                  key={i} 
                  onClick={() => navigate('/signup')}
                  className="group flex-shrink-0 w-[280px] md:w-[320px] h-[450px] rounded-3xl overflow-hidden relative cursor-pointer border border-white/10 hover:border-indigo-500/50 shadow-2xl transition-all duration-700 hover:-translate-y-2 bg-slate-900"
                >
                  {/* Background Image */}
                  <img 
                    src={cat.image} 
                    alt={cat.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 brightness-75 group-hover:brightness-90"
                  />

                  {/* Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#080d1a] opacity-80 group-hover:opacity-60 transition-opacity duration-700" />
                  <div className="absolute inset-0 bg-indigo-900/10 group-hover:bg-transparent transition-colors duration-700" />

                  {/* Content */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                    <div className="space-y-4">
                      <div className="flex flex-col items-start gap-3">
                        <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
                          Popular
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-none group-hover:text-indigo-400 transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                          {cat.title}
                        </h3>
                      </div>
                      
                      {/* Description - Reveals on Hover */}
                      <p className="text-slate-200 text-sm leading-relaxed opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 delay-100 font-medium drop-shadow-md max-w-[240px]">
                        {cat.desc}
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <div key={star} className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                        ))}
                      </div>
                      
                      <button className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 pb-1 border-b-2 border-indigo-500">
                        Discover <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hover Slide Trigger - Right */}
            <div 
              onMouseEnter={() => startAutoScroll('right')}
              onMouseLeave={stopAutoScroll}
              className="absolute top-0 right-0 bottom-12 w-48 z-20 flex items-center justify-end pr-8 bg-gradient-to-l from-[#080d1a] via-[#080d1a]/40 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-all duration-500 cursor-pointer pointer-events-auto"
            >
              <div className="w-16 h-16 rounded-full bg-indigo-600/20 backdrop-blur-xl border border-indigo-500/30 flex items-center justify-center text-white shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:scale-110 hover:bg-indigo-600 hover:border-white/50 transition-all">
                <ChevronRight size={32} strokeWidth={3} />
              </div>
            </div>

            {/* Hover Slide Trigger - Left */}
            <div 
              onMouseEnter={() => startAutoScroll('left')}
              onMouseLeave={stopAutoScroll}
              className="absolute top-0 left-0 bottom-12 w-24 z-20 flex items-center justify-start pl-8 bg-gradient-to-r from-[#080d1a] to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-500 cursor-pointer pointer-events-auto"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
                <ArrowLeft size={20} />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Strategic Vision Section */}
      <section id="vision" className="section-padding bg-[#080d1a] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-indigo-500/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-6">
            <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] animate-in fade-in duration-1000">The Crew Architecture</h2>
            <p className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] text-balance">
              Redefining the Future of <br className="hidden md:block" />
              <span className="text-indigo-500">Collaborative Content.</span>
            </p>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              CrewConnect is a specialized infrastructure for the next generation of high-output creative teams.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { 
                title: "The Motive", 
                icon: <Target />, 
                color: "indigo",
                desc: "Fragmented freelancing is inefficient. We facilitate autonomous 'crews' that operate as elite, high-performance agencies."
              },
              { 
                title: "The Impact", 
                icon: <Sparkles />, 
                color: "sky",
                desc: "By uniting specialists into cohesive units, we eliminate overhead, allowing brands to scale and creators to master their craft."
              },
              { 
                title: "The Strategy", 
                icon: <Zap />, 
                color: "violet",
                desc: "Intelligent matching and integrated workspaces ensure total transparency and world-class delivery across every ecosystem."
              }
            ].map((item, i) => (
              <div key={i} className="glass-premium p-10 space-y-8 border-t-2 border-indigo-500/50 hover:bg-white/5 transition-all group">
                <div className={`w-14 h-14 bg-${item.color}-500/10 rounded-2xl flex items-center justify-center text-${item.color}-400 group-hover:scale-110 transition-transform`}>
                  {React.cloneElement(item.icon as React.ReactElement<{ size: number }>, { size: 28 })}
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white tracking-tight">{item.title}</h3>
                  <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="relative section-padding overflow-hidden">
        {/* Background Video */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/assets/videos/Animated_Workflow_Video_For_CrewConnect.mp4" type="video/mp4" />
        </video>
        {/* Overlay for Readability */}
        <div className="absolute inset-0 bg-[#080d1a]/85 backdrop-blur-[2px] z-10" />

        <div className="max-w-7xl mx-auto px-6 relative z-20">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">How it works</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">From a simple spark of an idea to a fully realized production team.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="glass-premium p-8 space-y-6 hover-lift glow-card bg-[#0d1425]/40 backdrop-blur-md">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  {React.cloneElement(step.icon as React.ReactElement<{ size?: number }>, { size: 28 })}
                </div>
                <div className="space-y-3">
                  <div className="text-indigo-500 font-black text-xs uppercase tracking-widest">Step 0{idx + 1}</div>
                  <h3 className="text-xl font-black text-white">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Talent Categories Section */}
      <section id="categories" className="section-padding bg-[#0a1124]/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-12">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none">Find your match.</h2>
              <p className="text-slate-400 text-lg md:text-xl max-w-xl leading-relaxed">Curated talent categories designed for modern content ecosystems.</p>
            </div>
            <button onClick={() => navigate('/signup')} className="btn-secondary text-xs uppercase tracking-widest font-black px-8 py-4 bg-white/5 hover:bg-white/10 border-white/10">View All Talent <ChevronRight size={14} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat, idx) => (
              <div 
                key={idx} 
                onClick={() => navigate('/signup')}
                className="group relative h-[500px] glass-premium overflow-hidden hover:border-indigo-500/50 transition-all duration-700 cursor-pointer"
              >
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0 bg-slate-900 border-none">
                  <img 
                    src={cat.image} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800";
                    }}
                    alt={cat.title} 
                    className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080d1a] via-[#080d1a]/10 to-transparent z-10" />
                </div>

                {/* Content Section */}
                <div className="relative z-20 h-full p-8 flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-500">
                      {React.cloneElement(cat.icon as React.ReactElement<{ size?: number }>, { size: 28 })}
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-black text-white tracking-tight">{cat.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed max-w-[200px] group-hover:text-slate-200 transition-colors">{cat.desc}</p>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/signup');
                    }}
                    className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all duration-500"
                  >
                    {cat.cta} <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Why CrewConnect Section */}
      <section id="features" className="section-padding relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em]">Integrated Infrastructure</p>
                <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">Why <br /> CrewConnect?</h2>
                <p className="text-slate-400 text-lg leading-relaxed max-w-lg">Most platforms focus on solo freelancers. We focus on **Crews**. Because the best work happens when specialists collaborate as one.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((feat, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                    <div className="text-indigo-400 p-2 h-fit bg-indigo-500/10 rounded-lg">
                    {React.cloneElement(feat.icon as React.ReactElement<{ size?: number }>, { size: 20 })}
                  </div>
                    <div>
                      <h4 className="font-bold text-white text-base">{feat.title}</h4>
                      <p className="text-slate-500 text-xs leading-relaxed mt-1">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-premium p-4 md:p-8 aspect-square relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-sky-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative w-full h-full bg-[#080d1a] rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center p-12">
                 <div className="space-y-8 text-center">
                    <div className="flex -space-x-4 justify-center">
                       {[...Array(5)].map((_, i) => (
                         <div key={i} className="w-16 h-16 rounded-full border-4 border-[#080d1a] bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-indigo-600/20 animate-float" style={{ animationDelay: `${i * 0.2}s` }}>
                            {String.fromCharCode(65 + i)}
                         </div>
                       ))}
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-2xl font-black text-white">The Power of Choice</h3>
                       <p className="text-slate-500 text-sm">Don't just hire a person. Assemble an elite squad.</p>
                    </div>
                    <div className="flex justify-center gap-12">
                       <div className="text-center">
                          <div className="text-2xl font-black text-emerald-400">40%</div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Faster Shipping</div>
                       </div>
                       <div className="text-center">
                          <div className="text-2xl font-black text-sky-400">98%</div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Client Satisfaction</div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Trust & Quality Section */}
      <section id="trust" className="section-padding bg-[#080d1a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="glass-premium mesh-gradient-vivid p-12 md:p-20 relative overflow-hidden group">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-10">
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[0.9]">Your vision is <br /> <span className="text-emerald-400">protected.</span></h2>
                <div className="space-y-8">
                  {[
                    { title: 'Verified Profiles', desc: 'Every creator passes a rigorous manual vetting process before joining.' },
                    { title: 'Smooth Communication', desc: 'Built-in tools for real-time collaboration and secure file sharing.' },
                    { title: 'Organized Workflow', desc: 'Milestones and deliverables managed in one unified dashboard.' },
                    { title: 'Reliable Delivery', desc: 'Escrow protection and structured projects for absolute peace of mind.' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-6 items-start group">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mt-1 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-white text-lg tracking-tight">{item.title}</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] animate-pulse" />
                <div className="relative glass-card p-8 space-y-8 border-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Quality Score</span>
                    <Star className="text-amber-400 fill-amber-400" size={16} />
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full w-[94%] bg-gradient-to-r from-emerald-500 to-sky-400 rounded-full" />
                    </div>
                    <div className="flex justify-between text-[10px] font-black italic text-slate-500">
                       <span>TRANSPARENCY</span>
                       <span>9.8 / 10</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full w-[88%] bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full" />
                    </div>
                    <div className="flex justify-between text-[10px] font-black italic text-slate-500">
                       <span>RELIABILITY</span>
                       <span>9.2 / 10</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 italic">"CrewConnect has fundamentally changed how we handle our video production pipeline. Zero friction, total clarity."</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Knowledge Hub - Resources Section */}
      <section id="resources" className="section-padding">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-6 mb-16 text-center">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black tracking-[0.3em] uppercase mb-4">
                Knowledge Hub
             </div>
            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">Resources for Scale</h2>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">Master the art of creator-brand collaboration with our latest industry insights.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { 
                title: "Scale Your Video Production", 
                desc: "Scaling your post-production pipeline from pre-visualization to world-class delivery.",
                img: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800",
                tag: "Strategy"
              },
              { 
                title: "High-Output Creative Frameworks", 
                desc: "Building sustainable brand-creator partnerships for long-term growth and consistency.",
                img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
                tag: "Guide"
              },
              { 
                title: "The Future of Team-Based Crews", 
                desc: "Why specialized creative teams are outperforming the traditional solo freelancer.",
                img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
                tag: "Insight"
              }
            ].map((resource, i) => (
              <div 
                key={i} 
                onClick={() => navigate('/signup')}
                className="group cursor-pointer glass-premium p-4 hover:border-indigo-500/40 transition-all duration-500"
              >
                <div className="aspect-[16/10] rounded-2xl mb-8 overflow-hidden border border-white/10 relative">
                  <img 
                    src={resource.img} 
                    alt={resource.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080d1a] to-transparent opacity-80" />
                </div>
                <div className="space-y-4 px-2 pb-4">
                  <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] font-mono">{resource.tag}</span>
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors leading-tight">{resource.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{resource.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Final Conversion CTA Section */}
      <section className="section-padding pt-0 px-6 overflow-hidden relative">
        <div className="max-w-7xl mx-auto">
          <div className="p-10 md:p-20 text-center space-y-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[3rem] border border-white/10 relative overflow-hidden shadow-[0_50px_100px_rgba(79,70,229,0.3)] group transition-all duration-500 hover:shadow-[0_60px_120px_rgba(79,70,229,0.4)]">
            {/* Background Video */}
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-1000"
            >
              <source src="/assets/videos/Startup_Landing_Page_Background_Video.mp4" type="video/mp4" />
            </video>
            
            <div className="absolute inset-0 bg-[#080d1a]/20 backdrop-blur-[1px] z-10" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none z-10" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent z-10" />
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/5 blur-[120px] rounded-full pointer-events-none animate-pulse z-10" />
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-indigo-400/10 blur-[120px] rounded-full pointer-events-none animate-pulse z-10" />
            
            <div className="relative space-y-8 z-20">
               <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.8] drop-shadow-2xl">Ready to build <br className="hidden md:block" /> your elite crew?</h2>
               <p className="text-indigo-100 text-lg md:text-2xl max-w-2xl mx-auto font-medium opacity-80">Join the next wave of high-performance creative collaboration.</p>
            </div>

            <div className="relative flex flex-col sm:flex-row gap-6 justify-center items-center z-20">
               <button onClick={() => navigate('/signup')} className="bg-white text-indigo-700 hover:scale-105 active:scale-95 px-12 py-5 rounded-3xl font-black text-lg transition-all shadow-2xl shadow-black/20">Join as Talent</button>
               <button onClick={() => navigate('/signup')} className="bg-[#080d1a] text-white px-12 py-5 rounded-3xl font-black text-lg hover:scale-105 active:scale-95 transition-all hover:bg-opacity-90 border border-white/20 backdrop-blur-md">Hire a Team</button>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Footer Section */}
      <footer className="border-t border-white/5 py-20 bg-[#060a14]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 space-y-6">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <Rocket className="text-white fill-white/20" size={18} />
                  </div>
                  <span className="text-xl font-black tracking-tighter text-white">CrewConnect</span>
               </div>
               <p className="text-slate-500 text-sm max-w-xs leading-relaxed">Connecting world-class creators with top-tier brands for extraordinary results.</p>
                <div className="flex gap-4">
                  {[
                    { Icon: Twitter, url: "https://twitter.com" },
                    { Icon: Instagram, url: "https://instagram.com" },
                    { Icon: Linkedin, url: "https://linkedin.com" },
                    { Icon: Github, url: "https://github.com" }
                  ].map(({ Icon, url }, i) => (
                    <a 
                      key={i} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all"
                    >
                      <Icon size={18} />
                    </a>
                  ))}
               </div>
            </div>
            <div>
               <h5 className="text-white font-black text-[10px] uppercase tracking-[0.4em] mb-8 whitespace-nowrap opacity-50">Platform</h5>
               <ul className="space-y-6 text-sm text-slate-500 font-bold">
                  <li><a href="#categories" className="hover:text-white transition-colors">Talent Discovery</a></li>
                  <li><button onClick={() => navigate('/signup')} className="hover:text-white transition-colors text-left uppercase text-[10px] tracking-[0.2em]">Project Board</button></li>
                  <li><button onClick={() => navigate('/signup')} className="hover:text-white transition-colors text-left uppercase text-[10px] tracking-[0.2em]">Verified Crews</button></li>
                  <li><button onClick={() => setActiveModal('pricing')} className="hover:text-white transition-colors text-left uppercase text-[10px] tracking-[0.2em]">Pricing</button></li>
               </ul>
            </div>
            <div>
               <h5 className="text-white font-black text-[10px] uppercase tracking-[0.4em] mb-8 whitespace-nowrap opacity-50">Company</h5>
               <ul className="space-y-6 text-sm text-slate-500 font-bold">
                  <li><a href="#vision" className="hover:text-white transition-colors">About Us</a></li>
                  <li><button onClick={() => setActiveModal('careers')} className="hover:text-white transition-colors text-left uppercase text-[10px] tracking-[0.2em]">Careers</button></li>
                  <li><a href="#trust" className="hover:text-white transition-colors">Trust & Safety</a></li>
                  <li><button onClick={() => setActiveModal('contact')} className="hover:text-white transition-colors text-left uppercase text-[10px] tracking-[0.2em]">Contact</button></li>
               </ul>
            </div>
            <div>
               <h5 className="text-white font-black text-[10px] uppercase tracking-[0.4em] mb-8 whitespace-nowrap opacity-50">Resources</h5>
               <ul className="space-y-6 text-sm text-slate-500 font-bold">
                  <li><a href="#resources" className="hover:text-white transition-colors">Insights</a></li>
                  <li><a href="#resources" className="hover:text-white transition-colors">Guides</a></li>
                  <li><button onClick={() => navigate('/signup')} className="hover:text-white transition-colors text-left">Case Studies</button></li>
               </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-white/5 text-xs text-slate-600 font-bold uppercase tracking-widest">
             <p>© 2026 CrewConnect Platform Inc. All rights reserved.</p>
             <div className="flex gap-8">
                <button onClick={() => navigate('/signup')} className="hover:text-white transition-colors">Privacy Policy</button>
                <button onClick={() => navigate('/signup')} className="hover:text-white transition-colors">Terms of Service</button>
                <button onClick={() => navigate('/signup')} className="hover:text-white transition-colors">Cookie Settings</button>
             </div>
          </div>
        </div>
      </footer>

      {/* 12. Contextual Modals */}
      {activeModal && (
        <LandingModal 
          type={activeModal} 
          onClose={() => setActiveModal(null)} 
          navigate={navigate}
        />
      )}
    </div>
  );
};

export default Landing;
