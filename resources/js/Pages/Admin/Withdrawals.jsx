import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const statusColors = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    approved: 'bg-blue-50 text-blue-700 border-blue-100',
    completed: 'bg-green-50 text-green-700 border-green-100',
    rejected: 'bg-red-50 text-red-700 border-red-100',
};

export default function Withdrawals({ withdrawals, filters }) {
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [search, setSearch] = useState(filters?.search || '');
    
    const [processingId, setProcessingId] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [showProcessModal, setShowProcessModal] = useState(false);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

    const applyFilters = () => {
        router.get(route('admin.withdrawals.index'), {
            status: statusFilter || undefined,
            search: search || undefined,
        }, { preserveState: true });
    };

    const openProcessModal = (w) => {
        setSelectedWithdrawal(w);
        setAdminNotes(w.admin_notes || '');
        setShowProcessModal(true);
    };

    const updateStatus = (status) => {
        router.patch(route('admin.withdrawals.updateStatus', selectedWithdrawal.id), {
            status,
            admin_notes: adminNotes
        }, {
            onSuccess: () => setShowProcessModal(false)
        });
    };

    return (
        <DashboardLayout header={<h1 className="text-xl font-bold text-foreground">Withdrawal Requests (Payouts)</h1>}>
            <Head title="Manage Withdrawals" />

            <div className="space-y-6">
                {/* Filters */}
                <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[250px]">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Search Mentor</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                placeholder="Search by name or email..."
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                            <select 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="completed">Completed</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <button onClick={applyFilters} className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                            Filter
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Mentor</th>
                                <th className="px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Bank Account</th>
                                <th className="px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Requested At</th>
                                <th className="px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {withdrawals.data.map(w => (
                                <tr key={w.id} className="border-b border-border hover:bg-primary/10 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-sm text-foreground">{w.mentor?.full_name}</div>
                                        <div className="text-xs text-gray-400">{w.mentor?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-sm text-foreground">
                                        Rp {Number(w.amount).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-bold text-gray-700">{w.bank_name}</div>
                                        <div className="text-xs text-gray-500">{w.account_number}</div>
                                        <div className="text-xs text-gray-400 italic">{w.account_name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500">
                                        {new Date(w.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border uppercase ${statusColors[w.status]}`}>
                                            {w.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => openProcessModal(w)}
                                            className="px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors border border-primary/10"
                                        >
                                            Process
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {withdrawals.data.length === 0 && (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400">No withdrawal requests found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Process Modal */}
            {showProcessModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowProcessModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-foreground">Process Withdrawal</h3>
                        <p className="text-sm text-gray-500 mb-6">Updating request for {selectedWithdrawal?.mentor?.full_name}</p>

                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <div className="flex justify-between mb-2">
                                <span className="text-xs text-gray-500">Amount:</span>
                                <span className="text-sm font-bold text-foreground">Rp {Number(selectedWithdrawal?.amount).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-gray-500">Bank:</span>
                                <span className="text-sm font-semibold text-gray-700">{selectedWithdrawal?.bank_name} - {selectedWithdrawal?.account_number}</span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Admin Notes</label>
                            <textarea 
                                value={adminNotes}
                                onChange={e => setAdminNotes(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 h-24 resize-none"
                                placeholder="Add notes (e.g. Reference number, reason for rejection...)"
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <button 
                                onClick={() => updateStatus('rejected')}
                                className="px-4 py-2 border border-red-100 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50"
                            >
                                Reject
                            </button>
                            <button 
                                onClick={() => updateStatus('approved')}
                                className="px-4 py-2 border border-blue-100 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-50"
                            >
                                Approve
                            </button>
                            <button 
                                onClick={() => updateStatus('completed')}
                                className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 shadow-lg shadow-primary/20"
                            >
                                Mark Paid
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
