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
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Student</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Course</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Progress</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Enrolled At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(enrollment => (
                                <tr key={enrollment.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                                {enrollment.student?.full_name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">{enrollment.student?.full_name}</p>
                                                <p className="text-xs text-gray-400">{enrollment.student?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{enrollment.course?.title}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[120px]">
                                                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${enrollment.progress || 0}%` }} />
                                            </div>
                                            <span className="text-xs font-semibold text-gray-600">{enrollment.progress || 0}%</span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-0.5">{enrollment.completed_lessons}/{enrollment.total_lessons} lessons</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                                            enrollment.status === 'completed' ? 'bg-green-50 text-green-700' :
                                            enrollment.status === 'active' ? 'bg-blue-50 text-blue-700' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                            {enrollment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">No students enrolled yet.</td></tr>
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
