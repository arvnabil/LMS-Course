import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const statusColors = {
    draft: 'bg-yellow-50 text-yellow-700',
    published: 'bg-green-50 text-green-700',
    archived: 'bg-gray-100 text-gray-600',
};

export default function Courses({ courses, categories, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [categoryId, setCategoryId] = useState(filters?.category_id || '');

    const applyFilters = () => {
        router.get(route('admin.courses.index'), {
            search: search || undefined,
            status: status || undefined,
            category_id: categoryId || undefined,
        }, { preserveState: true, replace: true });
    };

    const updateStatus = (courseId, newStatus) => {
        router.patch(route('admin.courses.updateStatus', courseId), { status: newStatus });
    };

    const courseData = courses?.data || [];

    return (
        <DashboardLayout header={<h1 className="text-xl font-bold text-foreground">All Courses</h1>}>
            <Head title="All Courses" />

            <div className="space-y-6">
                {/* Filters */}
                <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                placeholder="Search by title..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                                <option value="">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                                <option value="">All Categories</option>
                                {categories?.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
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
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Course</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Mentor</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Category</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Price</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Students</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Status</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courseData.map(course => (
                                <tr key={course.id} className="border-b border-border hover:bg-primary/10 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold text-foreground">{course.title}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{course.slug}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{course.mentor?.full_name || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{course.category?.name || '-'}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                                        {Number(course.price) === 0 ? <span className="text-green-600 dark:text-green-400">Free</span> : `Rp ${Number(course.price).toLocaleString('id-ID')}`}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{course.enrollments_count}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[course.status]}`}>
                                            {course.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <select
                                            value={course.status}
                                            onChange={(e) => updateStatus(course.id, e.target.value)}
                                            className="px-2 py-1 text-xs border border-border rounded-lg bg-surface focus:outline-none"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {courseData.length === 0 && (
                                <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-400">No courses found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {courses?.links && (
                    <div className="flex justify-center gap-1">
                        {courses.links.map((link, i) => (
                            <button
                                key={i}
                                onClick={() => link.url && router.get(link.url)}
                                disabled={!link.url}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    link.active ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                                } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
