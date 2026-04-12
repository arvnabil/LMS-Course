import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Students({ enrollments, courses, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [courseId, setCourseId] = useState(filters?.course_id || '');

    const applyFilters = () => {
        router.get(route('mentor.students'), {
            search: search || undefined,
            course_id: courseId || undefined,
        }, { preserveState: true, replace: true });
    };

    const data = enrollments?.data || [];

    return (
        <DashboardLayout header={<h1 className="text-xl font-bold text-foreground">My Students</h1>}>
            <Head title="My Students" />

            <div className="space-y-6">
                {/* Filters */}
                <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                placeholder="Search by student name..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Course</label>
                            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                                <option value="">All Courses</option>
                                {courses?.map(c => (<option key={c.id} value={c.id}>{c.title}</option>))}
                            </select>
                        </div>
                        <button onClick={applyFilters} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                            Filter
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-primary/20 pb-4">
                        <table className="w-full min-w-[1000px] lg:min-w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="text-left px-4 md:px-6 py-4 text-[10px] font-extrabold text-foreground/60 uppercase tracking-widest whitespace-nowrap">Student Info</th>
                                <th className="text-left px-4 md:px-6 py-4 text-[10px] font-extrabold text-foreground/60 uppercase tracking-widest whitespace-nowrap">Course Title</th>
                                <th className="text-left px-4 md:px-6 py-4 text-[10px] font-extrabold text-foreground/60 uppercase tracking-widest whitespace-nowrap">Progress Status</th>
                                <th className="text-left px-4 md:px-6 py-4 text-[10px] font-extrabold text-foreground/60 uppercase tracking-widest whitespace-nowrap text-center">Active Status</th>
                                <th className="text-center px-4 md:px-6 py-4 text-[10px] font-extrabold text-foreground/60 uppercase tracking-widest whitespace-nowrap">Enrolled At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(enrollment => (
                                <tr key={enrollment.id} className="border-b border-border hover:bg-primary/5 transition-colors">
                                    <td className="px-4 md:px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-extrabold text-gray-500 border border-gray-300/30 shadow-sm">
                                                {enrollment.student?.full_name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground tracking-tight">{enrollment.student?.full_name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{enrollment.student?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 text-sm font-bold text-foreground/80 tracking-tight">{enrollment.course?.title}</td>
                                    <td className="px-4 md:px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[100px] border border-gray-200/50">
                                                <div className="h-full bg-primary rounded-full transition-all shadow-sm shadow-primary/20" style={{ width: `${enrollment.progress || 0}%` }} />
                                            </div>
                                            <span className="text-[10px] font-black text-foreground/70 tracking-tighter">{enrollment.progress || 0}%</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{enrollment.completed_lessons} / {enrollment.total_lessons} LESSONS</p>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 text-center">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-current opacity-80 ${
                                            enrollment.status === 'completed' ? 'bg-green-50 text-green-700' :
                                            enrollment.status === 'active' ? 'bg-blue-50 text-blue-700' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                            {enrollment.status}
                                        </span>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 text-[11px] font-bold text-gray-400 text-center uppercase tracking-tighter">
                                        {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr><td colSpan="5" className="px-4 md:px-6 py-12 text-center text-gray-400">No students enrolled yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

                {/* Pagination */}
                {enrollments?.links && (
                    <div className="flex justify-center gap-1">
                        {enrollments.links.map((link, i) => (
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
