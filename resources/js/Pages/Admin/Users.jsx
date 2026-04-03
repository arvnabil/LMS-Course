import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const roleBadgeColors = {
    admin: 'bg-purple-50 text-purple-700',
    mentor: 'bg-teal-50 text-teal-700',
    student: 'bg-blue-50 text-blue-700',
};

export default function Users({ users, availableRoles, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [roleFilter, setRoleFilter] = useState(filters?.role || '');
    
    // Role Edit Modal State
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [selectedRoles, setSelectedRoles] = useState([]);

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

                {/* Table */}
                <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">#</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Name</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Email</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Role</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Joined</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-foreground/60 uppercase tracking-wider">Change Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userData.map((user, i) => (
                                <tr key={user.id} className="border-b border-border hover:bg-primary/10 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-500">{(users?.current_page - 1) * users?.per_page + i + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                                {user.full_name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <span className="text-sm font-semibold text-foreground">{user.full_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles?.length > 0 ? user.roles.map(r => (
                                                <span key={r.id} className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-muted text-foreground/80 border border-border">
                                                    {r.name}
                                                </span>
                                            )) : (
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold capitalize ${roleBadgeColors[user.role] || 'bg-gray-100'}`}>
                                                    {user.role || 'None'}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => openRoleModal(user)} 
                                            className="px-3 py-1.5 text-xs font-semibold text-primary border border-primary/20 rounded-lg hover:bg-primary hover:text-white transition-colors"
                                        >
                                            Edit Roles
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {userData.length === 0 && (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400">No users found.</td></tr>
                            )}
                        </tbody>
                    </table>
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
