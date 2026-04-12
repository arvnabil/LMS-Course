import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

const statusColors = {
    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400',
    approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400',
    rejected: 'bg-rose-500/10 text-rose-500 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400',
};

export default function Submissions({ auth, submissions, filters }) {
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewingSubmission, setReviewingSubmission] = useState(null);

    const form = useForm({
        status: '',
        score: '',
        mentor_feedback: ''
    });

    const applyFilters = (status) => {
        setStatusFilter(status);
        router.get(route('mentor.submissions.index'), {
            status: status || undefined,
        }, { preserveState: true, replace: true });
    };

    const openReview = (submission) => {
        setReviewingSubmission(submission);
        form.setData({
            status: submission.status === 'pending' ? 'approved' : submission.status,
            score: submission.score || '',
            mentor_feedback: submission.mentor_feedback || ''
        });
        setIsReviewModalOpen(true);
    };

    const handleReview = (e) => {
        e.preventDefault();
        form.patch(route('mentor.submissions.review', reviewingSubmission.id), {
            onSuccess: () => setIsReviewModalOpen(false),
        });
    };

    const data = submissions?.data || [];

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Submissions Management" />

            <div className="max-w-6xl mx-auto space-y-10 pb-20 text-jakarta">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Submissions</h1>
                        <p className="text-gray-500 font-medium tracking-tight">Review and grade student assignments across your courses.</p>
                    </div>

                    <div className="flex bg-muted p-1.5 rounded-[24px] gap-1 self-start md:self-auto shadow-inner">
                        {['', 'pending', 'approved', 'rejected'].map((status) => (
                            <button
                                key={status}
                                onClick={() => applyFilters(status)}
                                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-[18px] text-[10px] md:text-xs font-extrabold uppercase tracking-widest transition-all ${
                                    statusFilter === status 
                                        ? 'bg-white text-foreground shadow-sm' 
                                        : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {status || 'All'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submissions Grid/Table */}
                <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-primary/20 pb-4">
                        <table className="w-full text-left border-collapse min-w-[1000px] lg:min-w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                <th className="px-4 md:px-10 py-6 md:py-8 text-[10px] font-extrabold text-foreground/60 uppercase tracking-widest whitespace-nowrap">Student & Course Info</th>
                                <th className="px-4 md:px-10 py-6 md:py-8 text-[10px] font-extrabold text-foreground/60 uppercase tracking-widest whitespace-nowrap">Assignment Title</th>
                                <th className="px-4 md:px-10 py-6 md:py-8 text-[10px] font-extrabold text-foreground/60 uppercase tracking-widest text-center whitespace-nowrap">Submitted At</th>
                                <th className="px-4 md:px-10 py-6 md:py-8 text-[10px] font-extrabold text-foreground/60 uppercase tracking-widest text-center whitespace-nowrap">Current Status</th>
                                <th className="px-4 md:px-10 py-6 md:py-8 text-[10px] font-extrabold text-foreground/60 uppercase tracking-widest text-right whitespace-nowrap">Review Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {data.map((sub) => (
                                <tr key={sub.id} className="group hover:bg-primary/5 transition-colors">
                                    <td className="px-4 md:px-10 py-6 md:py-8 text-jakarta">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center text-[11px] md:text-sm font-black text-white shadow-lg shadow-primary/20 border border-white/10 uppercase">
                                                {(sub.enrollment?.student?.full_name || 'S')[0]}
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-bold text-foreground tracking-tight line-clamp-1">{sub.enrollment?.student?.full_name || 'Unknown Student'}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest line-clamp-1">{sub.enrollment?.course?.title || '-'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-10 py-6 md:py-8">
                                        <p className="text-xs md:text-sm font-bold text-gray-700 leading-tight line-clamp-2 tracking-tight">{sub.quiz?.title || 'Assignment'}</p>
                                    </td>
                                    <td className="px-4 md:px-10 py-6 md:py-8 text-center text-[11px] font-bold text-gray-400 uppercase tracking-tighter tabular-nums whitespace-nowrap">
                                        {new Date(sub.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-4 md:px-10 py-6 md:py-8 text-center">
                                        <div className={`mx-auto inline-flex px-3 md:px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-current opacity-80 ${statusColors[sub.status] || 'bg-gray-50 text-gray-500'}`}>
                                            {sub.status}
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-10 py-6 md:py-8 text-right">
                                        <button 
                                            onClick={() => openReview(sub)}
                                            className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
                                                sub.status === 'pending'
                                                    ? 'bg-primary text-white shadow-primary/20 hover:scale-105 active:scale-95'
                                                    : 'bg-muted text-gray-400 border border-border hover:bg-white hover:text-foreground'
                                            }`}
                                        >
                                            {sub.status === 'pending' ? 'Review' : 'View Result'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                                {data.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-10 py-32 text-center space-y-4">
                                            <div className="text-6xl items-center justify-center flex grayscale opacity-30">📥</div>
                                            <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">No submissions found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    {submissions?.links && submissions.links.length > 3 && (
                        <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-50 flex justify-center gap-2">
                            {submissions.links.map((link, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => link.url && router.get(link.url)} 
                                    disabled={!link.url}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-extrabold transition-all ${
                                        link.active 
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' 
                                            : 'text-gray-400 hover:bg-white hover:text-foreground'
                                    } ${!link.url ? 'opacity-30 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Review Modal */}
            <Modal show={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} maxWidth="2xl">
                {reviewingSubmission && (
                    <div className="p-10 text-jakarta">
                        <div className="flex items-center gap-4 mb-10 pb-8 border-b border-border">
                            <div className="w-16 h-16 rounded-[24px] bg-primary flex items-center justify-center text-2xl shadow-xl shadow-primary/20 border border-white/10">
                                📑
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Review Submission</h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    {reviewingSubmission.enrollment?.student?.full_name} • {reviewingSubmission.quiz?.title}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-10">
                            {/* Student's Content */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-8 col-span-2">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Response Content</label>
                                        <div className="bg-muted/50 rounded-[32px] p-8 min-h-[120px]">
                                            {reviewingSubmission.submission_text ? (
                                                <p className="text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">{reviewingSubmission.submission_text}</p>
                                            ) : (
                                                <p className="text-gray-400 italic text-sm font-bold">No text response provided.</p>
                                            )}
                                        </div>
                                    </div>

                                    {reviewingSubmission.file_url && (
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Attached Document</label>
                                            <a 
                                                href={reviewingSubmission.file_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-4 p-6 rounded-[24px] bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 transition-all group"
                                            >
                                                <span className="text-2xl group-hover:scale-110 transition-transform">📄</span>
                                                <div className="flex-1">
                                                    <p className="text-sm font-extrabold tracking-tight">View Student File</p>
                                                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Click to open in new tab</p>
                                                </div>
                                                <span className="text-xl">↗</span>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Mentor review form */}
                            {reviewingSubmission.status === 'pending' || true ? (
                                <form onSubmit={handleReview} className="space-y-10 pt-10 border-t border-gray-50 bg-gray-50/30 -mx-10 px-10 pb-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Decision</label>
                                            <div className="flex gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => form.setData('status', 'approved')}
                                                    className={`flex-1 py-2.5 md:py-4 rounded-full text-[10px] font-extrabold uppercase tracking-widest border-2 transition-all ${
                                                        form.data.status === 'approved'
                                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                                            : 'bg-white border-gray-100 text-gray-400 hover:border-emerald-200'
                                                    }`}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => form.setData('status', 'rejected')}
                                                    className={`flex-1 py-2.5 md:py-4 rounded-full text-[10px] font-extrabold uppercase tracking-widest border-2 transition-all ${
                                                        form.data.status === 'rejected'
                                                            ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/30'
                                                            : 'bg-white border-gray-100 text-gray-400 hover:border-rose-200'
                                                    }`}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Score (0-100)</label>
                                            <input 
                                                type="number" 
                                                min="0" max="100" 
                                                value={form.data.score} 
                                                onChange={(e) => form.setData('score', e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-[18px] px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all text-center"
                                                placeholder="Enter score"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Feedback to Student</label>
                                        <textarea 
                                            value={form.data.mentor_feedback} 
                                            onChange={(e) => form.setData('mentor_feedback', e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-[28px] px-8 py-6 text-sm font-bold min-h-[120px] focus:ring-4 focus:ring-primary/10 transition-all"
                                            placeholder="Write constructive feedback here..."
                                        />
                                    </div>

                                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                                        <button 
                                            type="button" 
                                            onClick={() => setIsReviewModalOpen(false)} 
                                            className="px-6 md:px-8 py-2.5 md:py-4 text-[10px] font-extrabold uppercase tracking-widest text-gray-400 hover:text-foreground transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={form.processing || !form.data.status} 
                                            className="bg-primary text-white px-8 md:px-14 py-3 md:py-5 rounded-full text-[10px] md:text-xs font-extrabold uppercase tracking-[0.1em] shadow-xl shadow-primary/20 hover:bg-primary-hover hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-30 disabled:hover:translate-y-0 flex items-center justify-center gap-3"
                                        >
                                            {form.processing ? 'Saving...' : 'Confirm Review'}
                                            {!form.processing && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>}
                                        </button>
                                    </div>
                                </form>
                            ) : null}
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
}
