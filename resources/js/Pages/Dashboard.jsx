import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Icon from '@/Components/Icon';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line, Legend, BarChart, Bar,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

export default function Dashboard({ 
    role, 
    stats, 
    strengths,
    unlocked_badges,
    initial_notifications
}) {
    // Shared Header Component
    const DashboardHeader = () => (
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">Overview</h1>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Personal Learning Analytics</p>
        </div>
    );

    return (
        <DashboardLayout header={<DashboardHeader />}>
            <Head title="Dashboard" />
            
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Object.entries(stats).map(([key, value], idx) => {
                        const gradients = [
                            'bg-gradient-to-br from-indigo-500 to-blue-700 shadow-indigo-500/20',
                            'bg-gradient-to-br from-teal-500 to-emerald-700 shadow-teal-500/20',
                            'bg-gradient-to-br from-orange-400 to-red-600 shadow-orange-500/20',
                            'bg-gradient-to-br from-lime-500 to-green-600 shadow-lime-500/20',
                            'bg-gradient-to-br from-purple-500 to-violet-700 shadow-purple-500/20',
                            'bg-gradient-to-br from-pink-500 to-rose-600 shadow-pink-500/20'
                        ];

                        return (
                            <div 
                                key={key} 
                                className={`${gradients[idx % 6]} p-10 rounded-[40px] shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden`}
                            >
                                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                                
                                <div className="relative z-10 flex items-center gap-8">
                                    <div className="w-20 h-20 rounded-[28px] bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-lg">
                                        <Icon name={['book-open', 'clipboard-list', 'layout-grid', 'award', 'layers', 'shield'][idx % 6]} />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-4xl font-black text-white block mb-1 tracking-tight">
                                            {typeof value === 'object' ? value.value : value}
                                        </span>
                                        <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] leading-none">
                                            {key.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Main Content Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    {/* Strengths Radar Chart */}
                    <div className="lg:col-span-8 bg-surface p-12 rounded-[50px] shadow-2xl shadow-primary/5 border border-border flex flex-col items-center justify-center">
                        <div className="mb-12 text-center w-full">
                            <h3 className="text-3xl font-black text-foreground tracking-tight">Learning Expertise</h3>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">Skill alignment based on focus</p>
                        </div>
                        <div className="h-[450px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={strengths}>
                                    <PolarGrid stroke="#E2E8F0" strokeWidth={1} />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 13, fontWeight: 900 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Progress"
                                        dataKey="A"
                                        stroke="#4F46E5"
                                        strokeWidth={6}
                                        fill="#4F46E5"
                                        fillOpacity={0.15}
                                        dot={{ r: 6, fill: '#4F46E5', strokeWidth: 0 }}
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Secondary Insights Column */}
                    <div className="lg:col-span-4 flex flex-col gap-8">
                        <div className="flex-1 bg-primary p-10 rounded-[50px] shadow-2xl shadow-primary/20 border border-white/10 flex flex-col justify-end group overflow-hidden relative">
                            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
                            <div className="relative z-10">
                                <Icon name="zap" className="text-white w-12 h-12 mb-6" />
                                <h4 className="text-2xl font-black text-white leading-tight mb-4">Master Your <br/>Skills Faster</h4>
                                <p className="text-white/60 font-bold text-sm leading-relaxed mb-8">Detailed course tracking helps you focus on what matters most.</p>
                                <Link 
                                    href="/dashboard/learning-progress"
                                    className="block w-full py-4 px-6 bg-white text-primary rounded-2xl text-center font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform"
                                >
                                    Deep Dive Metrics
                                </Link>
                            </div>
                        </div>

                        <div className="bg-surface p-10 rounded-[50px] shadow-xl shadow-primary/5 border border-border">
                            <h4 className="text-lg font-black mb-6">Recent Badges</h4>
                            <div className="flex gap-4">
                                {unlocked_badges && unlocked_badges.length > 0 ? (
                                    <>
                                        {unlocked_badges.slice(0, 3).map((badge) => (
                                            <div 
                                                key={badge.id} 
                                                className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-primary/20 hover:scale-110 transition-transform cursor-help"
                                                title={badge.title}
                                            >
                                                {badge.icon}
                                            </div>
                                        ))}
                                        {/* Fill remaining with placeholders if less than 3 */}
                                        {unlocked_badges.length < 3 && [...Array(3 - unlocked_badges.length)].map((_, i) => (
                                            <div key={i} className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-gray-300 border border-border border-dashed">
                                                <Icon name="award" className="w-6 h-6" />
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-gray-300 border border-border border-dashed">
                                            <Icon name="award" className="w-6 h-6" />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
