import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

export default function Index({ auth, courses = [] }) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);

    const openDeleteModal = (course) => {
        setCourseToDelete(course);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setCourseToDelete(null);
    };

    const confirmDelete = () => {
        if (courseToDelete) {
            router.delete(route('mentor.courses.destroy', courseToDelete.id), {
                onSuccess: () => closeDeleteModal(),
            });
        }
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="My Courses (Mentor)" />

            <div className="space-y-10">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Management Courses</h1>
                        <p className="text-gray-500 font-medium font-jakarta tracking-tight">Create and manage your professional courses here.</p>
                    </div>
                    <Link
                        href={route('mentor.courses.create')}
                        className="inline-flex items-center justify-center bg-primary text-white px-8 py-4 rounded-full font-extrabold shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all translate-y-0 hover:-translate-y-1 text-sm uppercase tracking-widest"
                    >
                        <span className="mr-2 text-xl">+</span> Create New Course
                    </Link>
                </div>

                {/* Courses Table/Grid */}
                <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px] lg:min-w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Course Info</th>
                                    <th className="px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Pricing</th>
                                    <th className="px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.length > 0 ? (
                                    courses.map((course) => (
                                        <tr key={course.id} className="border-b border-border hover:bg-primary/10 transition-colors group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-20 h-20 rounded-3xl bg-muted flex-shrink-0 flex items-center justify-center text-3xl overflow-hidden">
                                                        {course.thumbnail ? (
                                                            <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                                                        ) : '🖼️'}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="font-extrabold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{course.title}</h3>
                                                        <p className="text-xs font-bold text-gray-400">Created: {new Date(course.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className="bg-accent-teal/10 text-sidebar-active px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                                                    {course.category?.name || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8">
                                                <p className="text-sm font-extrabold text-foreground tracking-tight">IDR {parseFloat(course.price).toLocaleString()}</p>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                                                    course.status === 'published' 
                                                        ? 'bg-accent-lime/20 text-foreground' 
                                                        : 'bg-yellow-100/50 text-yellow-700'
                                                }`}>
                                                    {course.status}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link
                                                        href={route('mentor.courses.edit', course.id)}
                                                        className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-primary hover:border-primary hover:text-white transition-all shadow-sm group/btn"
                                                        title="Edit Course"
                                                    >
                                                        ✏️
                                                    </Link>
                                                    <Link
                                                        href={route('mentor.courses.certificate-template', course.id)}
                                                        className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-sidebar-active hover:border-sidebar-active hover:text-white transition-all shadow-sm group/btn"
                                                        title="Edit Certificate Template"
                                                    >
                                                        📜
                                                    </Link>
                                                    <button 
                                                        onClick={() => openDeleteModal(course)}
                                                        className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:border-red-100 hover:text-red-500 transition-all shadow-sm cursor-pointer group/btn"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-10 py-20 text-center">
                                            <div className="space-y-4">
                                                <div className="text-7xl">📂</div>
                                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No courses found</p>
                                                <Link href={route('mentor.courses.create')} className="text-primary font-bold hover:underline">Start by creating your first course</Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Stats Summary for Mentor */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">💰</div>
                        <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Total Earnings</h4>
                        <p className="text-3xl font-extrabold text-foreground tracking-tight">IDR 0</p>
                    </div>
                    <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-4">
                        <div className="w-14 h-14 bg-accent-lime/20 rounded-2xl flex items-center justify-center text-2xl">👥</div>
                        <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Active Students</h4>
                        <p className="text-3xl font-extrabold text-foreground tracking-tight">0</p>
                    </div>
                    <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-4">
                        <div className="w-14 h-14 bg-accent-teal/20 rounded-2xl flex items-center justify-center text-2xl">⭐</div>
                        <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Average Rating</h4>
                        <p className="text-3xl font-extrabold text-foreground tracking-tight">0.0</p>
                    </div>
                </div>
            </div>

            <Modal show={deleteModalOpen} onClose={closeDeleteModal} maxWidth="sm">
                <div className="p-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-[32px] bg-red-50 flex items-center justify-center text-4xl mb-6 shadow-inner animate-bounce">
                        🗑️
                    </div>
                    <h2 className="text-2xl font-extrabold text-foreground mb-4 tracking-tight">Delete Course?</h2>
                    <p className="text-sm font-medium text-gray-500 mb-10 leading-relaxed px-4">
                        Are you sure you want to delete <span className="text-foreground font-bold italic">"{courseToDelete?.title}"</span>? This action <span className="text-red-500 font-bold underline">cannot be undone</span>.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <button 
                            type="button" 
                            onClick={closeDeleteModal} 
                            className="flex-1 px-8 py-4 rounded-full text-xs font-extrabold text-gray-400 uppercase tracking-widest hover:text-foreground hover:bg-muted transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            onClick={confirmDelete} 
                            className="flex-1 bg-red-500 text-white px-8 py-4 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-xl shadow-red-500/30 hover:bg-red-600 hover:scale-[1.05] active:scale-95 transition-all text-balance"
                        >
                            Confirm Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
