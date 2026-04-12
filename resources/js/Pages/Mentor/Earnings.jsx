import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';

export default function Earnings({ earnings, stats }) {
    const data = earnings?.data || [];

    return (
        <DashboardLayout header={<h1 className="text-xl font-bold text-foreground">Earnings</h1>}>
            <Head title="Earnings" />

            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Earnings</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">Rp {Number(stats?.total_earnings || 0).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Platform Fee</p>
                        <p className="text-2xl font-bold text-yellow-600 mt-1">Rp {Number(stats?.total_platform_fee || 0).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Transactions</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{stats?.total_transactions || 0}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-primary/20 pb-4">
                        <table className="w-full min-w-[1000px] lg:min-w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left px-4 md:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="text-left px-4 md:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Course</th>
                                <th className="text-left px-4 md:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="text-left px-4 md:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="text-left px-4 md:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Platform Fee</th>
                                <th className="text-left px-4 md:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Net Earning</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(earning => (
                                <tr key={earning.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 md:px-6 py-4 text-sm text-gray-500">
                                        {new Date(earning.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-foreground font-medium">{earning.transaction?.course?.title || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{earning.transaction?.student?.full_name || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-foreground">Rp {Number(earning.amount).toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 text-sm text-red-500">-Rp {Number(earning.platform_fee).toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-green-600">Rp {Number(earning.net_earning).toLocaleString('id-ID')}</td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400">No earnings yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

                {/* Pagination */}
                {earnings?.links && (
                    <div className="flex justify-center gap-1">
                        {earnings.links.map((link, i) => (
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
