import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Categories({ categories }) {
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const form = useForm({ name: '', icon: '' });

    const openCreate = () => {
        setEditingCategory(null);
        form.reset();
        setShowModal(true);
    };

    const openEdit = (cat) => {
        setEditingCategory(cat);
        form.setData({ name: cat.name, icon: cat.icon || '' });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            form.put(route('admin.categories.update', editingCategory.id), {
                onSuccess: () => { setShowModal(false); form.reset(); },
            });
        } else {
            form.post(route('admin.categories.store'), {
                onSuccess: () => { setShowModal(false); form.reset(); },
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this category?')) {
            router.delete(route('admin.categories.destroy', id));
        }
    };

    return (
        <DashboardLayout header={<h1 className="text-xl font-bold text-foreground">Categories</h1>}>
            <Head title="Categories" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <p className="text-gray-500 text-sm">{categories.length} categories total</p>
                    <button onClick={openCreate} className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                        + Add Category
                    </button>
                </div>

                {/* Table */}
                <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">#</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Name</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Slug</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Courses</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat, i) => (
                                <tr key={cat.id} className="border-b border-border hover:bg-primary/10 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-500">{i + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {cat.icon && <span className="text-lg">{cat.icon}</span>}
                                            <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{cat.slug}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold">
                                            {cat.courses_count} courses
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEdit(cat)} className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(cat.id)} className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">No categories yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-foreground mb-4">
                            {editingCategory ? 'Edit Category' : 'Create Category'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="e.g. Web Development"
                                />
                                {form.errors.name && <p className="text-red-500 text-xs mt-1">{form.errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji or text)</label>
                                <input
                                    type="text"
                                    value={form.data.icon}
                                    onChange={(e) => form.setData('icon', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="e.g. 💻"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
                                    Cancel
                                </button>
                                <button type="submit" disabled={form.processing} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                                    {form.processing ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
