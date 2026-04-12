import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Roles({ roles, permissions }) {
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);

    // Bulk Actions State
    const [selectedIds, setSelectedIds] = useState([]);

    const deletableRoles = roles.filter(r => !['admin', 'mentor', 'student', 'org_admin'].includes(r.name));

    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(deletableRoles.map(r => r.id));
        } else {
            setSelectedIds([]);
        }
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const deleteSelected = () => {
        if (confirm(`Are you sure you want to delete ${selectedIds.length} roles?`)) {
            router.post(route('admin.roles.bulkDestroy'), {
                _method: 'delete',
                ids: selectedIds
            }, {
                onSuccess: () => setSelectedIds([])
            });
        }
    };

    const form = useForm({
        name: '',
        permissions: []
    });

    const openCreateModal = () => {
        setEditingRole(null);
        form.reset();
        setShowModal(true);
    };

    const openEditModal = (role) => {
        setEditingRole(role);
        form.setData({
            name: role.name,
            permissions: role.permissions.map(p => p.name)
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingRole) {
            form.put(route('admin.roles.update', editingRole.id), {
                onSuccess: () => setShowModal(false)
            });
        } else {
            form.post(route('admin.roles.store'), {
                onSuccess: () => setShowModal(false)
            });
        }
    };

    const handleDelete = (role) => {
        if (confirm(`Are you sure you want to delete role ${role.name}?`)) {
            router.delete(route('admin.roles.destroy', role.id));
        }
    };

    const togglePermission = (permissionName) => {
        const currentPermissions = form.data.permissions;
        if (currentPermissions.includes(permissionName)) {
            form.setData('permissions', currentPermissions.filter(p => p !== permissionName));
        } else {
            form.setData('permissions', [...currentPermissions, permissionName]);
        }
    };

    return (
        <DashboardLayout header={<h1 className="text-xl font-bold text-foreground">Roles & Permissions</h1>}>
            <Head title="Roles Management" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Manage granular access controls</p>
                    <button onClick={openCreateModal} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                        + Create Role
                    </button>
                </div>

                {/* Bulk Actions */}
                {selectedIds.length > 0 && (
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                        <span className="text-sm font-semibold text-primary">{selectedIds.length} roles selected</span>
                        <div className="flex gap-2">
                            <button onClick={() => setSelectedIds([])} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button onClick={deleteSelected} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
                                Delete Selected
                            </button>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-primary/20 pb-4">
                        <table className="w-full min-w-[1000px] lg:min-w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-4 md:px-6 py-4 w-12 text-center text-[10px] font-extrabold text-foreground/60 uppercase tracking-widest whitespace-nowrap">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                        checked={deletableRoles.length > 0 && selectedIds.length === deletableRoles.length}
                                        onChange={toggleSelectAll}
                                        disabled={deletableRoles.length === 0}
                                    />
                                </th>
                                <th className="text-left px-4 md:px-6 py-4 text-[10px] font-extrabold text-foreground/60 uppercase tracking-widest whitespace-nowrap">Role Name</th>
                                <th className="text-left px-4 md:px-6 py-4 text-[10px] font-extrabold text-foreground/60 uppercase tracking-widest whitespace-nowrap text-center">Permissions Count</th>
                                <th className="text-right px-4 md:px-6 py-4 text-[10px] font-extrabold text-foreground/60 uppercase tracking-widest whitespace-nowrap w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map(role => {
                                const isDeletable = !['admin', 'mentor', 'student', 'org_admin'].includes(role.name);
                                return (
                                <tr key={role.id} className={`border-b border-border hover:bg-primary/10 transition-colors ${selectedIds.includes(role.id) ? 'bg-primary/5' : ''}`}>
                                    <td className="px-4 md:px-6 py-4 text-center">
                                        {isDeletable && (
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                                checked={selectedIds.includes(role.id)}
                                                onChange={() => toggleSelect(role.id)}
                                            />
                                        )}
                                    </td>
                                    <td className="px-4 md:px-6 py-4">
                                        <div className="inline-flex px-3 py-1 bg-muted border border-border rounded-full text-[10px] font-extrabold uppercase tracking-widest text-foreground">
                                            {role.name}
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 text-[11px] font-bold text-gray-500 text-center uppercase tracking-tighter">
                                        {role.name === 'admin' ? 'All Permissions' : `${role.permissions?.length || 0} permissions`}
                                    </td>
                                    <td className="px-4 md:px-6 py-4">
                                        <div className="flex items-center justify-end gap-3 text-right">
                                            <button onClick={() => openEditModal(role)} className="px-3 py-1.5 text-[10px] font-extrabold text-primary border border-primary/20 rounded-lg hover:bg-primary hover:text-white transition-all uppercase tracking-widest">Edit</button>
                                            {!['admin', 'mentor', 'student', 'org_admin'].includes(role.name) && (
                                                <button onClick={() => handleDelete(role)} className="px-3 py-1.5 text-[10px] font-extrabold text-red-600 border border-red-100 rounded-lg hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest shadow-sm shadow-red-500/10 text-center">Delete</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                );
                            })}
                            {roles.length === 0 && (
                                <tr><td colSpan="4" className="px-4 md:px-6 py-12 text-center text-gray-400">No roles found.</td></tr>
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl my-8" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-foreground mb-4">{editingRole ? 'Edit Role' : 'Create Role'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                                <input type="text" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="e.g. Content Moderator" 
                                    disabled={editingRole && ['admin', 'mentor', 'student', 'org_admin'].includes(editingRole.name)}
                                />
                                {form.errors.name && <p className="text-red-500 text-xs mt-1">{form.errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Assign Permissions</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-2 border border-gray-100 rounded-xl bg-gray-50/30">
                                    {permissions.map(permission => (
                                        <label key={permission.id} className="flex items-start gap-2 cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                            <input 
                                                type="checkbox" 
                                                className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                                checked={form.data.permissions.includes(permission.name)}
                                                onChange={() => togglePermission(permission.name)}
                                            />
                                            <span className="text-xs font-medium text-gray-700 break-words">{permission.name}</span>
                                        </label>
                                    ))}
                                </div>
                                {form.errors.permissions && <p className="text-red-500 text-xs mt-1">{form.errors.permissions}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
                                <button type="submit" disabled={form.processing} className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                                    {form.processing ? 'Saving...' : 'Save Role'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
