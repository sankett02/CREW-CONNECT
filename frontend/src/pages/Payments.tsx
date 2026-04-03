import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { DollarSign, Loader2, CheckCircle2, ArrowLeft, Download, Lock, X, ShieldCheck, PieChart, Users } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PaymentRecord {
    id: string;
    amount: string;
    status: string;
    milestoneId?: string;
    projectId: string;
    createdAt?: string;
    payer?: {
        email?: string;
        profile?: {
            displayName?: string;
        };
    };
    milestone?: {
        title: string;
    };
}

interface MilestoneRecord {
    id: string;
    title: string;
    status: string;
    escrowFunded?: boolean;
}

interface ProjectRecord {
    id: string;
    title: string;
    budget: string;
    brandId?: string;
    isGlobal?: boolean;
    projectMap?: Record<string, any>;
    team?: {
        userId: string;
        role: string;
        user?: {
            email: string;
            profile?: {
                displayName: string;
            };
        };
    }[];
}

const Payments: React.FC = () => {
    const { id: projectId } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [project, setProject] = useState<ProjectRecord | null>(null);
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [milestones, setMilestones] = useState<MilestoneRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [markingPaid, setMarkingPaid] = useState<string | null>(null);

    // Checkout State
    const [showCheckout, setShowCheckout] = useState(false);
    const [selectedMilestone, setSelectedMilestone] = useState<{ id: string, title: string, amount: number } | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'BANK'>('CARD');

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (projectId) {
                    const [projRes, payRes, msRes] = await Promise.all([
                        axios.get(`/api/projects/${projectId}`),
                        axios.get(`/api/projects/${projectId}/payments`),
                        axios.get(`/api/projects/${projectId}/milestones`),
                    ]);
                    setProject(projRes.data);
                    setPayments(payRes.data);
                    setMilestones(msRes.data);
                } else {
                    // Global Payments View
                    const [payRes, projRes] = await Promise.all([
                        axios.get('/api/payments'),
                        axios.get('/api/projects') // To get project titles for the payment list
                    ]);
                    setPayments(payRes.data);
                    // Filter or map projects for titles
                    const projectMap = projRes.data.reduce((acc: Record<string, any>, p: any) => ({ ...acc, [p.id]: p }), {});
                    setProject({ title: 'Global Overview', id: 'ALL', isGlobal: true, projectMap, budget: '0' });
                }
            } catch (err) {
                console.error('Payments fetch error', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [projectId]);

    const activeTeam = project?.team?.filter((m: any) => m.role !== 'BRAND') || [];

    // Default split logic: even split among team members.
    // In a full implementation, the Brand/CreatorLead could set custom % splits.
    const calculateSplit = (amount: number) => {
        if (!activeTeam.length) return [];
        const splitAmount = amount / activeTeam.length;
        return activeTeam.map((m) => ({
            userId: m.userId,
            role: m.role,
            name: m.user?.profile?.displayName ?? m.user?.email,
            amount: splitAmount
        }));
    };

    const processPayment = async () => {
        if (!selectedMilestone) return;
        setMarkingPaid(selectedMilestone.id);

        // Simulate real-world payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const splits = calculateSplit(selectedMilestone.amount);

        try {
            const res = await axios.post(`/api/projects/${projectId}/payments`, {
                amount: selectedMilestone.amount,
                milestoneId: selectedMilestone.id,
                payoutSplit: { method: paymentMethod, splits },
            });
            setPayments(prev => [...prev, res.data]);
            setShowCheckout(false);
        } catch (err) {
            console.error('Payment record failed', err);
        } finally {
            setMarkingPaid(null);
            setSelectedMilestone(null);
        }
    };

    const handleDownloadReceipt = (payment: any) => {
        const doc = new jsPDF();
        
        // --- Header Section ---
        // Brand Name (Primary App Color Style)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(28);
        doc.setTextColor(59, 130, 246); // A nice blue representative of Primary
        doc.text('CrewConnect', 14, 25);
        
        // Receipt Title
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('PAYMENT RECEIPT', 196, 20, { align: 'right' });
        
        // Receipt Meta Data
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text(`Receipt ID: #${payment.id.split('-')[0].toUpperCase()}`, 196, 28, { align: 'right' });
        
        // Line break
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 35, 196, 35);
        
        // --- Details Section ---
        doc.setFontSize(10);
        
        // Left Column (Bill To)
        doc.setFont('helvetica', 'bold');
        doc.text('BILLED TO:', 14, 45);
        doc.setFont('helvetica', 'normal');
        doc.text(payment.payer?.profile?.displayName || payment.payer?.email || 'Brand Account', 14, 52);
        
        // Right Column (Details)
        doc.setFont('helvetica', 'bold');
        doc.text('Date:', 120, 45);
        doc.text('Project:', 120, 52);
        doc.text('Status:', 120, 59);
        
        doc.setFont('helvetica', 'normal');
        doc.text(new Date(payment.createdAt || Date.now()).toLocaleDateString(), 150, 45);
        doc.text(project?.title || 'N/A', 150, 52);
        doc.setTextColor(34, 197, 94); // Green for PAID
        doc.text(payment.status || 'PAID', 150, 59);
        doc.setTextColor(40, 40, 40);

        // --- Transaction Table ---
        // Prepare table data
        const tableColumn = ["Description", "Quantity", "Amount"];
        const tableRows = [];
        
        // Milestone or manual details
        const description = payment.milestone?.title ? `Milestone Funding: ${payment.milestone.title}` : 'Manual Project Funding';
        tableRows.push([
            description,
            "1",
            `$${parseFloat(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        ]);

        autoTable(doc, {
            startY: 70,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }, // Primary Blue
            alternateRowStyles: { fillColor: [248, 250, 252] }, // Slate 50
            margin: { top: 70, left: 14, right: 14 }
        });

        // --- Totals Section ---
        const finalY = (doc as any).lastAutoTable.finalY + 15;
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('TOTAL PAID:', 140, finalY);
        
        doc.setTextColor(34, 197, 94); // Green text
        doc.text(`$${parseFloat(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 196, (doc as any).lastAutoTable.finalY + 15, { align: 'right' });
        
        // --- Footer ---
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text('Thank you for using CrewConnect - The Creative Marketplace.', 105, 280, { align: 'center' });
        
        // Save PDF
        doc.save(`CrewConnect_Receipt_${payment.id.slice(0, 8)}.pdf`);
    };

    const isBrand = project?.brandId === user?.id;

    if (loading) {
        return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-primary" size={48} /></div>;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center gap-3">
                <Link to="/dashboard" className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors text-sm">
                    <ArrowLeft size={16} /> Dashboard
                </Link>
                <span className="text-border">/</span>
                <h1 className="text-2xl font-bold">
                    {project?.isGlobal ? 'All Payments & Earnings' : `Payments & Escrow — ${project?.title}`}
                </h1>
            </div>

            {/* Escrow Status Summary - Only for project specific view */}
            {!project?.isGlobal && (
                <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 p-6 rounded-2xl flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                            <ShieldCheck size={20} /> Total Funds Secured in Escrow
                        </h3>
                        <p className="text-sm text-text-muted">Funds are securely locked until deliverables are approved.</p>
                    </div>
                    <div className="text-3xl font-black text-white text-shadow-glow">
                        ${milestones.filter((m) => m.escrowFunded && m.status !== 'APPROVED')
                            .reduce((acc) => acc + (parseFloat(project?.budget || "0") / (milestones.length || 1)), 0)
                            .toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                </div>
            )}

            {/* Milestones - Only for project specific view */}
            {!project?.isGlobal && (
                <div className="glass-card p-6 space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <DollarSign size={20} className="text-green-400" /> Milestone Payments
                    </h2>
                    {milestones.length === 0 ? (
                        <p className="text-text-muted italic">No milestones set for this project.</p>
                    ) : (
                        <div className="space-y-3">
                            {milestones.map((m: any) => {
                                const paid = payments.some(p => p.milestoneId === m.id && p.status === 'PAID');
                                return (
                                    <div key={m.id} className={`flex items-center justify-between p-4 rounded-xl border ${paid ? 'border-green-500/30 bg-green-500/5' : 'border-border bg-glass-bg'}`}>
                                        <div>
                                            <p className="font-semibold">{m.title}</p>
                                            <p className="text-xs text-text-muted">{m.status}</p>
                                        </div>
                                        {paid ? (
                                            <span className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
                                                <CheckCircle2 size={16} /> {m.status === 'APPROVED' ? 'Released to Creator' : 'Funded in Escrow'}
                                            </span>
                                        ) : isBrand ? (
                                            <button
                                                onClick={() => {
                                                    if (project) {
                                                        setSelectedMilestone({
                                                            id: m.id,
                                                            title: m.title,
                                                            amount: parseFloat(project.budget) / (milestones.length || 1)
                                                        });
                                                        setShowCheckout(true);
                                                    }
                                                }}
                                                className="btn-primary px-4 py-2 text-sm shadow-md shadow-primary/20"
                                            >
                                                <Lock size={14} className="mr-1" /> Fund Escrow
                                            </button>
                                        ) : (
                                            <span className="text-yellow-400 text-sm flex items-center gap-1">
                                                <Lock size={14} /> Awaiting Brand Funding
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Payment history */}
            <div className="glass-card p-6 space-y-4">
                <h2 className="text-xl font-bold">Payment History</h2>
                {payments.length === 0 ? (
                    <p className="text-text-muted italic">No payments recorded yet.</p>
                ) : (
                    <div className="divide-y divide-border">
                        {payments.map(p => (
                            <div key={p.id} className="flex justify-between py-3 text-sm">
                                <div>
                                    <p className="font-medium">
                                        {p.milestone?.title ?? (p.projectId && project?.projectMap?.[p.projectId]?.title) ?? 'Manual Payment'}
                                    </p>
                                    <p className="text-xs text-text-muted mb-1">
                                        {project?.isGlobal ? `Project: ${p.projectId && project?.projectMap?.[p.projectId]?.title || 'Unknown'}` : `Paid by: ${p.payer?.profile?.displayName ?? '—'}`}
                                    </p>
                                    {isBrand && p.status === 'PAID' && (
                                        <button
                                            onClick={() => handleDownloadReceipt(p)}
                                            className="text-xs flex items-center gap-1 text-primary hover:text-accent transition-colors"
                                        >
                                            <Download size={14} /> Download Receipt
                                        </button>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-400">${parseFloat(p.amount).toLocaleString()}</p>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">{p.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── CHECKOUT MODAL ── */}
            {showCheckout && selectedMilestone && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="bg-glass-bg border-b border-border p-5 flex justify-between items-center">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Lock size={18} className="text-primary" /> Secure Checkout
                            </h3>
                            <button onClick={() => setShowCheckout(false)} className="text-text-muted hover:text-text-main transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            {/* Summary */}
                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                                <div className="flex justify-between text-sm text-text-muted">
                                    <span>Milestone</span>
                                    <span className="text-text-main font-medium">{selectedMilestone.title}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t border-primary/10 pt-2 mt-2">
                                    <span>Total Escrow Funding</span>
                                    <span className="text-green-400">${selectedMilestone.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            {/* Payout Split Breakdown */}
                            {activeTeam.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-text-muted flex items-center gap-2">
                                        <PieChart size={14} /> Payout Split Breakdown
                                    </h4>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                        {calculateSplit(selectedMilestone.amount).map((split: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center bg-glass-bg p-3 rounded-lg border border-border text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Users size={14} className="text-accent" />
                                                    <span className="font-medium text-text-main">{split.name}</span>
                                                    <span className="text-[10px] uppercase font-bold text-text-muted px-1.5 py-0.5 rounded-full border border-border bg-black/20">
                                                        {split.role}
                                                    </span>
                                                </div>
                                                <span className="font-bold text-green-400">${split.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-text-muted italic flex items-center gap-1">
                                        <Lock size={10} /> Funds will be automatically released to their wallets upon final approval.
                                    </p>
                                </div>
                            )}

                            {/* Payment Methods */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-text-muted">Payment Method</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        className={`py-3 rounded-xl border flex justify-center items-center gap-2 text-sm font-medium transition-all ${paymentMethod === 'CARD' ? 'bg-primary/10 border-primary text-primary' : 'bg-glass-bg border-border text-text-muted hover:border-text-muted'}`}
                                        onClick={() => setPaymentMethod('CARD')}
                                    >
                                        💳 Credit Card
                                    </button>
                                    <button
                                        className={`py-3 rounded-xl border flex justify-center items-center gap-2 text-sm font-medium transition-all ${paymentMethod === 'BANK' ? 'bg-primary/10 border-primary text-primary' : 'bg-glass-bg border-border text-text-muted hover:border-text-muted'}`}
                                        onClick={() => setPaymentMethod('BANK')}
                                    >
                                        🏦 Bank Transfer
                                    </button>
                                </div>
                            </div>

                            {/* Simulated Inputs */}
                            {paymentMethod === 'CARD' ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-text-muted ml-1">Card Number</label>
                                        <input type="text" placeholder="0000 0000 0000 0000" className="input mt-1 font-mono text-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-text-muted ml-1">Expiry</label>
                                            <input type="text" placeholder="MM/YY" className="input mt-1 font-mono text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-text-muted ml-1">CVC</label>
                                            <input type="text" placeholder="123" className="input mt-1 font-mono text-sm" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-text-muted ml-1">Routing Number</label>
                                        <input type="text" placeholder="XXXXXXXXX" className="input mt-1 font-mono text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-text-muted ml-1">Account Number</label>
                                        <input type="text" placeholder="000000000000" className="input mt-1 font-mono text-sm" />
                                    </div>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                onClick={processPayment}
                                disabled={markingPaid !== null}
                                className="btn-primary w-full py-4 text-base shadow-lg shadow-primary/30 flex justify-center"
                            >
                                {markingPaid !== null ? (
                                    <><Loader2 size={20} className="animate-spin" /> Processing Securely...</>
                                ) : (
                                    <><Lock size={18} /> Pay ${selectedMilestone.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
                                )}
                            </button>
                            <p className="text-xs text-center text-text-muted flex items-center justify-center gap-1 mt-2">
                                <Lock size={10} /> Secured by CrewConnect Payments
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payments;
