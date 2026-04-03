import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';

const typeConfig = {
    success: { label: 'SUCCESS', color: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
    info: { label: 'INFO', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
    warning: { label: 'WARNING', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    error: { label: 'ERROR', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
};

const actionTypeFromTitle = (title) => {
    if (title.includes('Enrollment')) return 'Enrollment';
    if (title.includes('Lesson')) return 'Lesson Progress';
    if (title.includes('Quiz')) return 'Quiz';
    if (title.includes('Course Completed')) return 'Course Completion';
    if (title.includes('Profile')) return 'Profile Update';
    if (title.includes('Certificate')) return 'Certificate';
    return 'System';
};

export default function ActivityLog({ activities, summary }) {
    const summaryCards = [
        { label: 'Total Events', value: summary.total_events, sub: 'All time', icon: '📊', color: 'bg-primary/5' },
        { label: 'Security Alerts', value: summary.security_alerts, sub: 'Failed / Errors', icon: '🛡️', color: 'bg-red-50' },
        { label: 'Config Changes', value: summary.config_changes, sub: 'Settings & Tokens', icon: '⚙️', color: 'bg-amber-50' },
        { label: 'User Actions', value: summary.user_actions, sub: 'Manual Activity', icon: '👤', color: 'bg-blue-50' },
    ];

    return (
        <DashboardLayout
            header={
                <div>
                    <h1 className="text-xl font-bold text-foreground">Activity Log</h1>
                    <p className="text-xs text-gray-500">Track all your platform activities in one place.</p>
                </div>
            }
        >
            <Head title="Activity Log" />

            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {summaryCards.map((card) => (
                        <div key={card.label} className={`${card.color} rounded-[20px] p-5 flex items-center justify-between`}>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{card.label}</p>
                                <p className="text-3xl font-extrabold text-foreground mt-1">{card.value}</p>
                                <p className="text-xs font-medium text-gray-400 mt-1">{card.sub}</p>
                            </div>
                            <span className="text-3xl opacity-60">{card.icon}</span>
                        </div>
                    ))}
                </div>

                {/* Activity Table */}
                <div className="bg-surface rounded-2xl border border-border p-3 shadow-sm">
                    <div className="bg-surface rounded-2xl overflow-hidden">
                        {/* Table Header */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-border bg-muted/50 text-[10px] font-extrabold text-foreground/60 uppercase tracking-widest">
                            <div className="col-span-2">Timestamp</div>
                            <div className="col-span-2">Action Type</div>
                            <div className="col-span-5">Details</div>
                            <div className="col-span-2">Result</div>
                            <div className="col-span-1">Action</div>
                        </div>

                        {/* Table Body */}
                        {activities.data && activities.data.length > 0 ? (
                            activities.data.map((activity) => {
                                const cfg = typeConfig[activity.type] || typeConfig.info;
                                const actionType = actionTypeFromTitle(activity.title);
                                const createdAt = new Date(activity.created_at);

                                return (
                                    <div
                                        key={activity.id}
                                        className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-5 border-b border-border hover:bg-primary/10 transition-colors items-center"
                                    >
                                        {/* Timestamp */}
                                        <div className="col-span-2 text-xs font-bold text-foreground">
                                            <span className="block">{createdAt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            <span className="block text-[10px] text-gray-400 font-medium">
                                                {createdAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        {/* Action Type */}
                                        <div className="col-span-2">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold border ${cfg.color}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                                                {actionType}
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <div className="col-span-5">
                                            <p className="text-sm font-bold text-foreground leading-tight">{activity.title}</p>
                                            <p className="text-xs text-gray-400 font-medium mt-0.5 line-clamp-1">{activity.message}</p>
                                        </div>

                                        {/* Result */}
                                        <div className="col-span-2">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold border ${cfg.color}`}>
                                                {activity.type === 'success' && '✓'} {cfg.label}
                                            </span>
                                        </div>

                                        {/* Action */}
                                        <div className="col-span-1 text-center">
                                            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-foreground" title="View details">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                                                    <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="px-6 py-16 text-center">
                                <span className="text-5xl block mb-3">📋</span>
                                <p className="text-gray-400 text-sm font-medium">No activity logs yet. Start using the platform to generate activity!</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {activities.last_page > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-4 pb-2">
                            {activities.links && activities.links.map((link, idx) => (
                                <a
                                    key={idx}
                                    href={link.url || '#'}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                                        link.active
                                            ? 'bg-primary text-white shadow-sm'
                                            : link.url
                                                ? 'bg-surface text-foreground/60 hover:bg-muted border border-border'
                                                : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
