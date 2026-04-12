import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Icon from '@/Components/Icon';
import { 
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    Legend, BarChart, Bar
} from 'recharts';

export default function LearningProgress({ enrollments, topics_trends, watch_time_trends }) {
    const Header = () => (
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Learning Progress</h1>
            <p className="text-sm font-bold text-gray-500">Detailed track of your course advancements</p>
        </div>
    );

    return (
        <DashboardLayout header={<Header />}>
            <Head title="Learning Progress" />
            
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Left Column: Latest Progress Sidebar (Matching Image 2) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div>
                            <h2 className="text-xl font-black text-foreground tracking-tight">Latest Progress</h2>
                            <p className="text-xs font-bold text-gray-500">Last 7 days</p>
                        </div>
                        
                        <div className="space-y-4">
                            {enrollments.map((e, idx) => (
                                <Link 
                                    key={e.id} 
                                    href={`/dashboard/courses/${e.course_slug}/learn`}
                                    className="bg-surface rounded-3xl p-4 shadow-sm hover:shadow-md border border-border flex items-center gap-4 transition-all duration-300 group"
                                >
                                    {/* Small Minimalist Thumbnail */}
                                    <div className="w-20 h-12 rounded-xl overflow-hidden shrink-0 shadow-sm border border-border/50">
                                        <img src={e.thumbnail} alt={e.course_title} className="w-full h-full object-cover" />
                                    </div>

                                    {/* Minimalist Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[13px] font-black text-foreground leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                                            {e.course_title}
                                        </h3>
                                        
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                                                    style={{ width: `${e.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-gray-400 whitespace-nowrap">
                                                {e.completed_lessons} / {e.total_lessons}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}

                            {enrollments.length === 0 && (
                                <div className="bg-muted/10 border border-dashed border-border rounded-3xl p-10 text-center">
                                    <p className="text-xs font-bold text-gray-400 italic">No activity recorded</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Expanded Charts (Matching Image 2) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Most Topics (Expanded Wide) */}
                        <div className="bg-surface rounded-[40px] p-10 shadow-xl shadow-primary/5 border border-border">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-2xl font-black leading-none text-foreground">Most Topics</h3>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Last 7 days</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    {Object.keys(topics_trends[0] || {}).filter(k => k !== 'name').map((topic, idx) => (
                                        <div key={topic} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#6366F1', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6'][idx % 5] }}></div>
                                            <span className="text-[11px] font-black text-foreground uppercase tracking-widest">{topic}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="h-[380px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={topics_trends}>
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={true} 
                                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 800 }}
                                            dy={15}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 800 }}
                                            domain={[0, 'auto']}
                                        />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }}
                                            itemStyle={{ fontWeight: 900, fontSize: '13px' }}
                                        />
                                        {Object.keys(topics_trends[0] || {}).filter(k => k !== 'name').map((topic, idx) => (
                                            <Line 
                                                key={topic}
                                                type="monotone" 
                                                dataKey={topic} 
                                                stroke={['#6366F1', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6'][idx % 5]} 
                                                strokeWidth={5} 
                                                dot={{ r: 5, fill: '#fff', strokeWidth: 3 }}
                                                activeDot={{ r: 8, strokeWidth: 0 }}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Watch Time (Expanded Wide) */}
                        <div className="bg-surface rounded-[40px] p-10 shadow-xl shadow-primary/5 border border-border">
                            <div className="mb-10">
                                <h3 className="text-2xl font-black leading-none text-foreground">Watch Time</h3>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Last 7 days</p>
                            </div>
                            
                            <div className="h-[250px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={watch_time_trends}>
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={true} 
                                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 800 }}
                                            dy={10}
                                        />
                                        <YAxis axisLine={false} tickLine={false} hide />
                                        <Tooltip 
                                            cursor={{ fill: 'rgba(79, 70, 229, 0.05)', radius: 10 }}
                                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                                            itemStyle={{ fontWeight: 900, color: '#4F46E5' }}
                                        />
                                        <Bar dataKey="minutes" fill="#4F46E5" radius={[10, 10, 10, 10]} barSize={34} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
