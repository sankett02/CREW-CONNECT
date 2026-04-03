import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, DollarSign, Calendar, Tag, AlignLeft, Loader2, ArrowRight, Zap, Users } from 'lucide-react';
import DatePicker from '../components/shared/DatePicker';
import { parseISO, format } from 'date-fns';

const niches = ['All', 'YouTube', 'Instagram', 'TikTok', 'Shorts/Reels', 'UGC', 'Podcast', 'Branding', 'Photography', 'Animation', 'Software', 'Web Development', 'Writing', 'Other'];
const AVAILABLE_ROLES = ['CREATOR', 'WRITER', 'EDITOR'];

const ProjectCreation: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        title: '',
        description: '',
        niche: 'YouTube',
        budget: '',
        deadline: '',
        openSlots: ['CREATOR'] as string[],
    });
    const [customNiche, setCustomNiche] = useState('');

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [key]: e.target.value }));

    const toggleRole = (role: string) => {
        setForm(prev => {
            const current = prev.openSlots;
            if (current.includes(role)) {
                if (current.length === 1) return prev; // Must have at least one role
                return { ...prev, openSlots: current.filter(r => r !== role) };
            }
            return { ...prev, openSlots: [...current, role] };
        });
    };

    const handleAiGenerate = async () => {
        if (!form.title && !form.description) {
            setError('Please provide a basic title or topic first.');
            return;
        }

        setAiLoading(true);
        setError('');
        try {
            const response = await axios.post('/api/ai/generate-brief', { 
                topic: form.title || form.description 
            });
            const { title, description, niche } = response.data;
            
            // Map AI niche to available frontend niches
            let mappedNiche = 'Other';
            if (niche && niches.includes(niche)) {
                mappedNiche = niche;
            } else if (niche === 'Video Creators' || niche === 'Editors') {
                mappedNiche = 'YouTube'; // Popular default mapping
            }

            setForm(prev => ({
                ...prev,
                title: title || prev.title,
                description: description || prev.description,
                niche: mappedNiche
            }));
            
            if (mappedNiche === 'Other' && niche) {
                setCustomNiche(niche);
            }
        } catch (err: any) {
            const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to generate brief';
            setError(`AI Assistant: ${msg}`);
            console.error('Generation Error:', err);
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const finalNiche = form.niche === 'Other' ? customNiche : form.niche;
            await axios.post('/api/projects', {
                ...form,
                niche: finalNiche,
                openSlots: JSON.stringify(form.openSlots)
            });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold">
                    <Zap size={15} /> New Project
                </div>
                <h1 className="text-3xl font-black text-[#f0f4ff]">Post a Project Brief</h1>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-[#7e8fb5]">Fill in the details below to attract the right creators for your project.</p>
                    <button
                        type="button"
                        onClick={handleAiGenerate}
                        disabled={aiLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                    >
                        {aiLoading ? (
                            <><Loader2 className="animate-spin" size={16} /> Generating...</>
                        ) : (
                            <><Zap size={16} className="text-yellow-400" /> Generate with AI</>
                        )}
                    </button>
                </div>
            </div>

            {/* Form Card */}
            <div className="glass-card p-8">
                {error && (
                    <div className="mb-6 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                        <span>⚠</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-[#a8b8d8] flex items-center gap-2">
                            <Briefcase size={14} /> Project Title
                        </label>
                        <input
                            className="input"
                            placeholder="e.g. YouTube Series — 10 Episodes on Climate Tech"
                            value={form.title}
                            onChange={set('title')}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-[#a8b8d8] flex items-center gap-2">
                            <AlignLeft size={14} /> Project Brief
                        </label>
                        <textarea
                            className="input h-32 resize-none"
                            placeholder="Describe the project goals, deliverables, style, and anything creators should know..."
                            value={form.description}
                            onChange={set('description')}
                            required
                        />
                    </div>

                    {/* Niche + Budget row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-[#a8b8d8] flex items-center gap-2">
                                <Tag size={14} /> Content Niche
                            </label>
                            <select
                                className="input appearance-none cursor-pointer"
                                value={form.niche}
                                onChange={set('niche')}
                                style={{ background: 'rgba(8,13,30,0.8)' }}
                            >
                                {niches.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>

                        {form.niche === 'Other' && (
                            <div className="space-y-1.5 animate-in fade-in slide-in-from-left-2 duration-300">
                                <label className="text-sm font-semibold text-[#a8b8d8] flex items-center gap-2">
                                    <Tag size={14} className="text-indigo-400" /> Specify Niche
                                </label>
                                <input
                                    className="input"
                                    placeholder="e.g. Web3 Gaming, AI Art"
                                    value={customNiche}
                                    onChange={(e) => setCustomNiche(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-[#a8b8d8] flex items-center gap-2">
                                <DollarSign size={14} /> Total Budget (USD)
                            </label>
                            <input
                                type="number"
                                min="0"
                                className="input"
                                placeholder="e.g. 5000"
                                value={form.budget}
                                onChange={set('budget')}
                                required
                            />
                            {form.budget && (
                                <p className="text-[10px] text-[#7e8fb5] px-1 italic">
                                    + 3% processing fee: <span className="text-indigo-400 font-bold">${(Number(form.budget) * 0.03).toFixed(2)}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Team Formation Slots */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-[#a8b8d8] flex items-center gap-2">
                                <Users size={14} /> Required Team Roles
                            </label>
                            <p className="text-xs text-[#7e8fb5]">Select the types of freelancers you need for this project.</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {AVAILABLE_ROLES.map(role => {
                                const isSelected = form.openSlots.includes(role);
                                return (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => toggleRole(role)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${isSelected
                                            ? 'bg-accent/20 border-accent text-accent shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                            : 'bg-glass-bg border-border text-text-muted hover:border-text-muted/50'
                                            }`}
                                    >
                                        {role}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Deadline */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-[#a8b8d8] flex items-center gap-2">
                            <Calendar size={14} /> Deadline
                        </label>
                        <DatePicker
                            date={form.deadline ? parseISO(form.deadline) : undefined}
                            onChange={(date) => setForm(prev => ({ 
                                ...prev, 
                                deadline: date ? format(date, "yyyy-MM-dd") : '' 
                            }))}
                            placeholder="Select a deadline"
                        />
                    </div>

                    {/* Info banner / Price Summary */}
                    <div className="rounded-xl p-4 text-sm space-y-2" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                        <div className="flex justify-between items-center text-[#f0f4ff]">
                            <span className="font-semibold text-xs uppercase tracking-wider text-[#7e8fb5]">Total Brand Cost</span>
                            <span className="text-xl font-black">${(Number(form.budget || 0) * 1.03).toFixed(2)}</span>
                        </div>
                        <p className="text-[11px] text-[#818cf8]">
                            💡 <strong>Tip:</strong> Projects with detailed briefs receive 3× more qualified applicants. 3% fee covers platform security & escrow.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-4 text-base shadow-[0_8px_32px_rgba(99,102,241,0.35)]"
                    >
                        {loading
                            ? <><Loader2 className="animate-spin" size={20} /> Publishing...</>
                            : <>Publish Project Brief <ArrowRight size={20} /></>
                        }
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProjectCreation;
