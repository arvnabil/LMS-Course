import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const roleBadgeColors = {
    admin: 'bg-purple-50 text-purple-700',
    mentor: 'bg-teal-50 text-teal-700',
    student: 'bg-blue-50 text-blue-700',
};

export default function Users({ auth, users, availableRoles, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [roleFilter, setRoleFilter] = useState(filters?.role || '');
    
    // Role Edit Modal State
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [selectedRoles, setSelectedRoles] = useState([]);

    // Bulk Actions State
    const [selectedIds, setSelectedIds] = useState([]);

    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(userData.map(u => u.id));
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
        if (confirm(`Are you sure you want to delete ${selectedIds.length} users?`)) {
            router.post(route('admin.users.bulkDestroy'), {
                _method: 'delete',
                ids: selectedIds
            }, {
                onSuccess: () => setSelectedIds([])
            });
        }
    };

    const openRoleModal = (user) => {
        setEditingUser(user);
        setSelectedRoles(user.roles?.map(r => r.name) || (user.role ? [user.role] : []));
        setShowRoleModal(true);
    };

    const toggleRole = (roleName) => {
        if (selectedRoles.includes(roleName)) {
            setSelectedRoles(selectedRoles.filter(r => r !== roleName));
        } else {
            setSelectedRoles([...selectedRoles, roleName]);
        }
    };

    const saveRoles = (e) => {
        e.preventDefault();
        router.patch(route('admin.users.updateRole', editingUser.id), { roles: selectedRoles }, {
            onSuccess: () => setShowRoleModal(false)
        });
    };

    const applyFilters = () => {
        router.get(route('admin.users.index'), {
            search: search || undefined,
            role: roleFilter || undefined,
        }, { preserveState: true, replace: true });
    };

    const userData = users?.data || [];

    return (
        <DashboardLayout header={<h1 className="text-xl font-bold text-foreground">User Management</h1>}>
            <Head title="User Management" />

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
                                placeholder="Search by name or email..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                                <option value="">All Roles</option>
                                {availableRoles?.map(role => (
                                    <option key={role.id} value={role.name}>{role.name}</option>
                                ))}
                            </select>
                        </div>
                        <button onClick={applyFilters} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                            Filter
                        </button>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedIds.length > 0 && (
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                        <span className="text-sm font-semibold text-primary">{selectedIds.length} users selected</span>
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
                                <th className="px-4 md:px-6 py-5 w-12 text-center text-[10px] font-extrabold text-foreground/60 uppercase tracking-widest whitespace-nowrap">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                        checked={userData.length > 0 && selectedIds.length === userData.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="text-left px-4 md:px-6 py-5 text-[10px] font-extrabold text-foreground/60 uppercase tracking-widest whitespace-nowrap">User Info</th>
                                <th className="text-left px-4 md:px-6 py-5 text-[10px] font-extrabold text-foreground/60 uppercase tracking-widest whitespace-nowrap">Email Address</th>
                                <th className="text-left px-4 md:px-6 py-5 text-[10px] font-extrabold text-foreground/60 uppercase tracking-widest whitespace-nowrap">Assigned Roles</th>
                                <th className="text-left px-4 md:px-6 py-5 text-[10px] font-extrabold text-foreground/60 uppercase tracking-widest whitespace-nowrap text-center">Date Joined</th>
                                <th className="text-right px-4 md:px-6 py-5 text-[10px] font-extrabold text-foreground/60 uppercase tracking-widest whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userData.map((user, i) => (
                                <tr key={user.id} className={`border-b border-border hover:bg-primary/5 transition-colors ${selectedIds.includes(user.id) ? 'bg-primary/5' : ''}`}>
                                    <td className="px-4 md:px-6 py-4 text-center">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                            checked={selectedIds.includes(user.id)}
                                            onChange={() => toggleSelect(user.id)}
                                        />
                                    </td>
                                    <td className="px-4 md:px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-extrabold text-gray-500 border border-gray-300/30 shadow-sm">
                                                {user.full_name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <span className="text-sm font-semibold text-foreground tracking-tight">{user.full_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 text-sm text-gray-400 font-jakarta">{user.email}</td>
                                    <td className="px-4 md:px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles?.length > 0 ? user.roles.map(r => (
                                                <span key={r.id} className="inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest bg-muted text-foreground/80 border border-border">
                                                    {r.name}
                                                </span>
                                            )) : (
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest bg-gray-100 ${roleBadgeColors[user.role] || 'text-gray-600'}`}>
                                                    {user.role || 'None'}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 text-[11px] font-bold text-gray-400 text-center uppercase tracking-tighter">
                                        {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-4 md:px-6 py-4 text-right flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => openRoleModal(user)} 
                                            className="px-3 py-1.5 text-[10px] font-extrabold text-primary border border-primary/20 rounded-lg hover:bg-primary hover:text-white transition-all uppercase tracking-widest"
                                        >
                                            Edit Roles
                                        </button>
                                        {user.id !== auth.user.id && (
                                            <>
                                                <button 
                                                    onClick={() => router.patch(route('admin.users.toggleBan', user.id))}
                                                    title={user.is_banned ? 'Unban User' : 'Ban User'}
                                                    className={`p-1.5 rounded-lg border transition-all ${user.is_banned ? 'border-green-200 text-green-600 hover:bg-green-600 hover:text-white' : 'border-yellow-200 text-yellow-600 hover:bg-yellow-600 hover:text-white'}`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" x2="19.07" y1="4.93" y2="19.07"/></svg>
                                                </button>
                                                <button 
                                                    onClick={() => confirm('Are you sure you want to delete this user?') && router.delete(route('admin.users.destroy', user.id))}
                                                    title="Delete User"
                                                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm shadow-red-500/10"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {userData.length === 0 && (
                                <tr><td colSpan="6" className="px-4 md:px-6 py-12 text-center text-gray-400">No users found.</td></tr>
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>

                {/* Pagination */}
                {users?.links && (
                    <div className="flex justify-center gap-1">
                        {users.links.map((link, i) => (
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

            {/* Edit Role Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-foreground mb-1">Edit Roles for {editingUser?.full_name}</h3>
                        <p className="text-xs text-gray-500 mb-4">{editingUser?.email}</p>
                        
                        <form onSubmit={saveRoles}>
                            <div className="space-y-3 max-h-60 overflow-y-auto mb-6 p-2">
                                {availableRoles?.map(role => (
                                    <label key={role.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedRoles.includes(role.name)}
                                            onChange={() => toggleRole(role.name)}
                                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                        />
                                        <div>
                                            <span className="block text-sm font-bold text-foreground">{role.name}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setShowRoleModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90">
                                    Save User Roles
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
