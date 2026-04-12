import React from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Icon from '@/Components/Icon';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MentorStats({ stats, revenue_trends, recent_activity }) {
    const Header = () => (
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Mentor Overview</h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Business & Student Analytics</p>
        </div>
    );

    return (
        <DashboardLayout header={<Header />}>
            <Head title="Mentor Overview" />
            
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Metric Cards (Revenue, Students) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(stats).map(([key, data], idx) => {
                        const powerfulGradients = [
                            'bg-gradient-to-br from-emerald-500 to-teal-700 shadow-emerald-500/20',
                            'bg-gradient-to-br from-blue-600 to-indigo-800 shadow-blue-600/20',
                            'bg-gradient-to-br from-orange-500 to-rose-600 shadow-orange-500/20',
                            'bg-gradient-to-br from-violet-600 to-purple-900 shadow-violet-600/20'
                        ];
                        
                        return (
                            <div 
                                key={key} 
                                className={`${powerfulGradients[idx % 4]} p-8 rounded-[36px] shadow-2xl transition-all duration-300 hover:scale-[1.03] group relative overflow-hidden`}
                            >
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                                <div className="relative z-10 flex items-start justify-between mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-lg">
                                        <Icon name={['dollar-sign', 'users', 'award', 'layout-grid'][idx % 4]} />
                                    </div>
                                </div>
                                <div className="relative z-10">
                                    <h4 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-2">{key.replace('_', ' ')}</h4>
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black text-white tracking-tighter leading-none mb-3">{data.value}</span>
                                        <p className="text-[9px] font-black text-white/80 bg-black/10 px-3 py-2 rounded-full inline-block w-fit">
                                            {data.change}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Charts & Activity Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Revenue Trend Area Chart */}
                    <div className="lg:col-span-8 bg-surface p-10 rounded-[40px] shadow-xl shadow-primary/5 border border-border">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-foreground">Revenue Trends</h3>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Personal earnings history</p>
                            </div>
                        </div>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenue_trends}>
                                    <defs>
                                        <linearGradient id="colorRevMentor" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 800 }}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 800 }}
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="#4F46E5" 
                                        strokeWidth={5} 
                                        fillOpacity={1} 
                                        fill="url(#colorRevMentor)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Student Activity Sidebar */}
                    <div className="lg:col-span-4 bg-surface p-10 rounded-[40px] shadow-xl shadow-primary/5 border border-border">
                        <h3 className="text-xl font-black mb-8 text-foreground uppercase tracking-tight">Recent Activity</h3>
                        <div className="space-y-8">
                            {recent_activity && recent_activity.length > 0 ? recent_activity.map((activity) => (
                                <div key={activity.id} className="flex gap-5 group">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                        <Icon name="user" className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[13px] font-black text-foreground">
                                            {activity.user} <span className="text-gray-400 font-bold">{activity.action}</span>
                                        </p>
                                        <p className="text-[13px] font-black text-primary truncate mt-1">{activity.target}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{activity.time}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-20 text-center">
                                    <p className="text-gray-400 font-bold text-sm italic">No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
