import React, { useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ShieldCheck, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentSuccess: React.FC = () => {
    const { id: projectId } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        // You could verify session here if needed
    }, [sessionId]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card max-w-lg w-full p-10 text-center space-y-8 relative overflow-hidden"
            >
                {/* Decorative background orbs */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

                <div className="relative">
                    <div className="w-20 h-20 bg-green-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                        <CheckCircle2 size={40} className="text-green-400" />
                    </div>

                    <h1 className="text-3xl font-black text-[#f0f4ff] tracking-tight">Escrow Funded!</h1>
                    <p className="text-[#7e8fb5] mt-2">The payment has been secured and is now held in escrow. The team has been notified to proceed.</p>
                </div>

                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-4 text-left">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-[#4a5578] font-bold uppercase tracking-widest">Status</span>
                        <span className="text-green-400 font-bold flex items-center gap-1.5">
                            <ShieldCheck size={14} /> SECURED
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-[#4a5578] font-bold uppercase tracking-widest">Transaction ID</span>
                        <span className="text-[#7e8fb5] font-mono">{sessionId?.slice(0, 12)}...</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-4 border-t border-white/5">
                        <span className="text-[#f0f4ff] font-bold">Funds Released On</span>
                        <span className="text-[#7e8fb5]">Milestone Approval</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Link
                        to={`/workspace/${projectId}`}
                        className="btn-primary w-full py-4 flex items-center justify-center gap-2 group"
                    >
                        Return to Workspace <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <div className="flex gap-3">
                        <button className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#7e8fb5] hover:text-white transition-all flex items-center justify-center gap-2">
                            Download Receipt
                        </button>
                        <a
                            href="https://stripe.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#7e8fb5] hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
                        >
                            <ExternalLink size={14} /> Stripe Receipt
                        </a>
                    </div>
                </div>

                <p className="text-[10px] text-[#4a5578] font-bold uppercase tracking-[0.2em]">Verified by CrewConnect Fintech Layer</p>
            </motion.div>
        </div>
    );
};

export default PaymentSuccess;
