import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const statusColors = {
    pending: 'bg-yellow-50 text-yellow-700',
    success: 'bg-green-50 text-green-700',
    failed: 'bg-red-50 text-red-700',
    expired: 'bg-gray-100 text-gray-600',
};

export default function Transactions({ transactions, stats, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');

    const applyFilters = () => {
        router.get(route('admin.transactions.index'), {
            search: search || undefined,
            status: status || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        }, { preserveState: true, replace: true });
    };

    const txData = transactions?.data || [];

    return (
        <DashboardLayout header={<h1 className="text-xl font-bold text-foreground">Transactions</h1>}>
            <Head title="Transactions" />

            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</p>
                        <p className="text-2xl font-bold text-foreground mt-1">Rp {Number(stats?.total_revenue || 0).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Successful</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">{stats?.success_count || 0}</p>
                    </div>
                    <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600 mt-1">{stats?.pending_count || 0}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-[180px]">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                placeholder="Order ID or student name..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                                <option value="">All</option>
                                <option value="pending">Pending</option>
                                <option value="success">Success</option>
                                <option value="failed">Failed</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
                            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
                            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <button onClick={applyFilters} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                            Filter
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Order ID</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Student</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Course</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Amount</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Payment</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {txData.map(tx => (
                                <tr key={tx.id} className="border-b border-border hover:bg-primary/10 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-foreground">{tx.order_id}</td>
                                    <td className="px-6 py-4 text-sm text-foreground font-medium">{tx.student?.full_name || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{tx.course?.title || '-'}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-foreground">Rp {Number(tx.amount).toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 capitalize">{tx.payment_type || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[tx.status]}`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                </tr>
                            ))}
                            {txData.length === 0 && (
                                <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-400">No transactions found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {transactions?.links && (
                    <div className="flex justify-center gap-1">
                        {transactions.links.map((link, i) => (
                            <button key={i} onClick={() => link.url && router.get(link.url)} disabled={!link.url}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${link.active ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'} ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
