import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard({ stats, revenue_trends, recent_activity }) {
    return (
        <DashboardLayout
            header={
                <div>
                    <h1 className="text-xl font-bold text-foreground">Dashboard Overview</h1>
                    <p className="text-xs text-gray-500">Welcome back, here's what's happening today.</p>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6 md:space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <StatCard title="Total Revenue" value={stats.total_revenue.value} change={stats.total_revenue.change} icon="dollar" color="lime" />
                    <StatCard title="Active Students" value={stats.active_students.value} change={stats.active_students.change} icon="users" color="teal" />
                    <StatCard title="Course Progress" value={stats.course_progress.value} change={stats.course_progress.change} icon="award" color="peach" />
                    <StatCard title="Active Courses" value={stats.active_courses.value} change={stats.active_courses.change} icon="book" color="lime" />
                </div>

                {/* Charts & Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-muted rounded-[20px] pt-5 px-3 pb-3">
                            <div className="flex items-center justify-between px-3 mb-4">
                                <h3 className="text-foreground text-lg font-bold">Revenue Trends</h3>
                            </div>
                            <div className="bg-white rounded-[20px] p-5 h-[360px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenue_trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#FB7185" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#FB7185" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                                            dy={10}
                                        />
                                        <YAxis hide />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="revenue" 
                                            stroke="#FB7185" 
                                            strokeWidth={3}
                                            fillOpacity={1} 
                                            fill="url(#colorRevenue)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-muted rounded-[20px] pt-5 px-3 pb-3 h-full">
                            <div className="flex items-center justify-between px-3 mb-4">
                                <h3 className="text-foreground text-lg font-bold">Recent Activity</h3>
                                <a href="#" className="text-primary text-sm font-medium hover:underline">View All</a>
                            </div>
                            <div className="bg-white rounded-[20px] p-4 h-[360px] overflow-y-auto scrollbar-hide">
                                <div className="space-y-6">
                                    {recent_activity.length > 0 ? recent_activity.map((activity) => (
                                        <div key={activity.id} className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <span className="text-primary text-sm">👤</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-foreground leading-tight">
                                                    {activity.user} <span className="font-medium text-gray-500">{activity.action}</span> {activity.target}
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{activity.time}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="h-full flex items-center justify-center">
                                            <p className="text-gray-400 text-sm">No recent activity</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function StatCard({ title, value, change, icon, color }) {
    const colorMap = {
        lime: 'bg-accent-lime',
        teal: 'bg-accent-teal',
        peach: 'bg-accent-peach',
    };

    return (
        <div className="bg-muted rounded-[20px] pt-5 px-3 pb-3">
            <h3 className="text-foreground text-base font-bold ml-3 mb-4">{title}</h3>
            <div className="bg-white rounded-[20px] p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-foreground text-3xl font-extrabold mb-1">{value}</p>
                        <p className="text-gray-500 text-xs font-medium">{change}</p>
                    </div>
                    <div className={`w-16 h-16 ${colorMap[color] || colorMap.lime} rounded-[22px] flex items-center justify-center`}>
                        <span className="text-foreground text-2xl">
                            {icon === 'dollar' && '💰'}
                            {icon === 'users' && '👥'}
                            {icon === 'award' && '🏆'}
                            {icon === 'book' && '📚'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
