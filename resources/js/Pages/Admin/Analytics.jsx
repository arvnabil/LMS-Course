import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';

const COLORS = ['#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export default function Analytics({ stats, enrollmentTrend, revenueTrend, topCourses, categoryDistribution }) {
    
    // Prepare category data for PieChart
    const pieData = (categoryDistribution || []).map(item => ({
        name: item.category?.name || 'Unknown',
        value: item.count
    }));

    // Prepare trend data (Merge enrollment and revenue if possible or keep separate)
    // Here we use them separately for clarity in different sections
    
    return (
        <DashboardLayout header={<h1 className="text-xl font-bold text-foreground">Analytics Insights</h1>}>
            <Head title="Analytics" />

            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Growth</p>
                        <p className="text-2xl font-black text-foreground mt-1">{stats?.total_users || 0}</p>
                        <p className="text-[10px] text-gray-500 mt-2">Total platform users registered</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Inventory</p>
                        <p className="text-2xl font-black text-foreground mt-1">{stats?.total_courses || 0}</p>
                        <p className="text-[10px] text-green-600 font-bold mt-2">{stats?.published_courses || 0} active courses</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Volume</p>
                        <p className="text-2xl font-black text-foreground mt-1">{stats?.total_enrollments || 0}</p>
                        <p className="text-[10px] text-gray-500 mt-2">Active student enrollments</p>
                    </div>
                    <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-white shadow-lg shadow-primary/20">
                        <p className="text-xs font-bold uppercase tracking-widest opacity-80">Gross Revenue</p>
                        <p className="text-2xl font-black mt-1">Rp {Number(stats?.total_revenue || 0).toLocaleString('id-ID')}</p>
                        <p className="text-[10px] opacity-80 mt-2">Total successful transactions</p>
                    </div>
                </div>

                {/* Main Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue History */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-foreground mb-6">Revenue Performance (12 Months)</h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                        formatter={(val) => [`Rp ${Number(val).toLocaleString('id-ID')}`, 'Revenue']}
                                    />
                                    <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Enrollment Distribution */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-foreground mb-6">Student Activity Trend</h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={enrollmentTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                    />
                                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Courses */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-foreground mb-6">Course Leaderboard</h3>
                        <div className="space-y-4">
                            {(topCourses || []).map((course, i) => (
                                <div key={course.id} className="flex items-center gap-4">
                                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${
                                        i === 0 ? 'bg-yellow-100 text-yellow-700' :
                                        i === 1 ? 'bg-gray-100 text-gray-600' :
                                        i === 2 ? 'bg-orange-100 text-orange-700' :
                                        'bg-slate-50 text-slate-400'
                                    }`}>{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground truncate">{course.title}</p>
                                        <div className="w-full h-1.5 bg-gray-50 rounded-full mt-2 overflow-hidden">
                                            <div 
                                                className="h-full bg-primary" 
                                                style={{ width: `${(course.enrollments_count / topCourses[0].enrollments_count) * 100}%` }} 
                                            />
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 px-2 py-1 bg-gray-50 rounded-lg">{course.enrollments_count} Students</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Category Pie */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-foreground mb-2">Interest by Category</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold'}} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
