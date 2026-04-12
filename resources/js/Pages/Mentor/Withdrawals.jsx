import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

const statusColors = {
    pending: 'bg-yellow-50 text-yellow-700',
    approved: 'bg-blue-50 text-blue-700',
    rejected: 'bg-red-50 text-red-700',
    completed: 'bg-green-50 text-green-700',
};

export default function Withdrawals({ withdrawals, balance, totalEarnings, totalWithdrawn }) {
    const [showModal, setShowModal] = useState(false);
    const form = useForm({ amount: '', bank_name: '', account_number: '', account_name: '', notes: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post(route('mentor.withdrawals.store'), {
            onSuccess: () => { setShowModal(false); form.reset(); },
        });
    };

    const data = withdrawals?.data || [];

    return (
        <DashboardLayout header={<h1 className="text-xl font-bold text-foreground">Withdrawals</h1>}>
            <Head title="Withdrawals" />

            <div className="space-y-6">
                {/* Balance Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-white">
                        <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Available Balance</p>
                        <p className="text-2xl font-bold mt-1">Rp {Number(balance || 0).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Earnings</p>
                        <p className="text-2xl font-bold text-foreground mt-1">Rp {Number(totalEarnings || 0).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Withdrawn</p>
                        <p className="text-2xl font-bold text-foreground mt-1">Rp {Number(totalWithdrawn || 0).toLocaleString('id-ID')}</p>
                    </div>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <p className="text-gray-500 text-sm">Withdrawal History</p>
                    <button onClick={() => setShowModal(true)} className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                        + Request Withdrawal
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] lg:min-w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bank</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(w => (
                                <tr key={w.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(w.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-foreground">Rp {Number(w.amount).toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{w.bank_name}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-foreground">{w.account_name}</p>
                                        <p className="text-xs text-gray-400">{w.account_number}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[w.status]}`}>
                                            {w.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">{w.notes || '-'}</td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400">No withdrawal history.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

                {/* Pagination */}
                {withdrawals?.links && (
                    <div className="flex justify-center gap-1">
                        {withdrawals.links.map((link, i) => (
                            <button key={i} onClick={() => link.url && router.get(link.url)} disabled={!link.url}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${link.active ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'} ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}
            </div>

            {/* Withdrawal Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-foreground mb-4">Request Withdrawal</h3>
                        <p className="text-sm text-gray-500 mb-4">Available balance: <strong className="text-foreground">Rp {Number(balance || 0).toLocaleString('id-ID')}</strong></p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (min Rp 50.000)</label>
                                <input type="number" value={form.data.amount} onChange={(e) => form.setData('amount', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="50000" min="50000" />
                                {form.errors.amount && <p className="text-red-500 text-xs mt-1">{form.errors.amount}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                <input type="text" value={form.data.bank_name} onChange={(e) => form.setData('bank_name', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="e.g. BCA, Mandiri, BNI" />
                                {form.errors.bank_name && <p className="text-red-500 text-xs mt-1">{form.errors.bank_name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                <input type="text" value={form.data.account_number} onChange={(e) => form.setData('account_number', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="1234567890" />
                                {form.errors.account_number && <p className="text-red-500 text-xs mt-1">{form.errors.account_number}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                                <input type="text" value={form.data.account_name} onChange={(e) => form.setData('account_name', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="John Doe" />
                                {form.errors.account_name && <p className="text-red-500 text-xs mt-1">{form.errors.account_name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                                <textarea value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    rows="2" placeholder="Additional notes..." />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">Cancel</button>
                                <button type="submit" disabled={form.processing} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                                    {form.processing ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
