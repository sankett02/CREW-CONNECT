import React from 'react';
import { Shield, Zap, CheckCircle2, ArrowRight, Clock, Lock } from 'lucide-react';

const MilestoneGuide: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#080d1a] text-white pt-24 pb-20 px-6">
            <div className="max-w-4xl mx-auto space-y-16">
                {/* Hero Header */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-black uppercase tracking-widest animate-pulse">
                        <Shield size={14} /> Creator Protection System
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                        The CrewConnect <span className="text-indigo-500">Milestone</span> Workflow
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                        A transparent, secure, and professional way to manage your creative projects and get paid for every step of the journey.
                    </p>
                </div>

                {/* The Core System */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass-premium p-10 space-y-6 border-indigo-500/30 bg-indigo-500/[0.02]">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <Lock size={28} />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight">Escrow Security</h3>
                        <p className="text-slate-400 leading-relaxed font-medium">
                            Before you even start working, the Brand deposits the funds into our secure Escrow system. This ensures that the money is guaranteed and ready for you upon milestone approval.
                        </p>
                    </div>

                    <div className="glass-premium p-10 space-y-6 border-emerald-500/30 bg-emerald-500/[0.02]">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Zap size={28} />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight">Instant Payouts</h3>
                        <p className="text-slate-400 leading-relaxed font-medium">
                            As soon as a milestone is approved by the brand, the funds are released from Escrow directly to your account. No more chasing invoices or waiting weeks for payment.
                        </p>
                    </div>
                </div>

                {/* Step-by-Step Workflow */}
                <div className="space-y-10">
                    <h2 className="text-3xl font-black tracking-tight border-b border-white/10 pb-6 uppercase tracking-widest text-[14px] text-indigo-400">Your Project Journey</h2>
                    
                    <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-white/5 before:to-transparent">
                        
                        {/* Step 1 */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-[#080d1a] group-[.is-active]:bg-indigo-500 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-500">
                                <span className="font-black text-xs">01</span>
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-premium p-8 group-hover:border-indigo-500/50 transition-all duration-500">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xl font-black">Milestone Selection</h4>
                                    <Clock size={16} className="text-indigo-400" />
                                </div>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                    Define the deliverables for each stage of the project. A typical project might have: Script, Draft, and Final Delivery.
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-[#080d1a] group-[.is-active]:bg-indigo-500 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-500">
                                <span className="font-black text-xs">02</span>
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-premium p-8 group-hover:border-indigo-500/50 transition-all duration-500">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xl font-black">Escrow Funding</h4>
                                    <Lock size={16} className="text-indigo-400" />
                                </div>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                    The brand funds the current active milestone. You should wait for the "Funded" status before starting work to ensure payment security.
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-[#080d1a] group-[.is-active]:bg-indigo-500 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-500">
                                <span className="font-black text-xs">03</span>
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-premium p-8 group-hover:border-indigo-500/50 transition-all duration-500">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xl font-black">Submission & Review</h4>
                                    <CheckCircle2 size={16} className="text-indigo-400" />
                                </div>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                    Submit your work directly through the workspace. The brand receives a notification to review and approve the delivery.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Final CTA */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-12 text-center space-y-8 shadow-2xl shadow-indigo-500/20">
                    <h2 className="text-4xl font-black tracking-tight">Ready to start collaborating?</h2>
                    <p className="text-white/80 font-medium max-w-xl mx-auto">
                        Your professional workspace is equipped with all the tools you need to manage these steps seamlessly.
                    </p>
                    <button onClick={() => window.history.back()} className="inline-flex items-center gap-3 bg-white text-indigo-600 px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                        Go To Workspace <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MilestoneGuide;
