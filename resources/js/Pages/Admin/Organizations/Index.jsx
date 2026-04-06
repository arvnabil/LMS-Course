import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function OrganizationsIndex({ auth, organizations }) {
    const handleDelete = (org) => {
        if (confirm(`Delete "${org.name}"? This cannot be undone.`)) {
            router.delete(route('admin.organizations.destroy', org.id));
        }
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Organizations" />

            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Organizations</h1>
                        <p className="text-sm font-bold text-gray-400 mt-2">Manage B2B organizations and their course access.</p>
                    </div>
                    <Link
                        href={route('admin.organizations.create')}
                        className="bg-primary text-white px-8 py-3 rounded-full font-extrabold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all translate-y-0 hover:-translate-y-1 text-sm"
                    >
                        + New Organization
                    </Link>
                </div>

                {organizations.data.length === 0 ? (
                    <div className="bg-white rounded-[32px] p-16 text-center shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                        </div>
                        <h3 className="text-lg font-extrabold text-foreground">No organizations yet</h3>
                        <p className="text-gray-400 text-sm mt-2">Create your first organization to start assigning courses.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {organizations.data.map((org) => (
                            <div key={org.id} className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all group">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                                        {org.logo ? (
                                            <img src={`/storage/${org.logo}`} alt={org.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-extrabold text-foreground text-lg truncate">{org.name}</h3>
                                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mt-1 ${org.is_active ? 'bg-accent-lime/20 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                            {org.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 mb-6">
                                    <div>
                                        <p className="text-2xl font-extrabold text-foreground">{org.member_records_count}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Members</p>
                                    </div>
                                    <div className="w-px h-8 bg-gray-100"></div>
                                    <div>
                                        <p className="text-2xl font-extrabold text-foreground">{org.course_records_count}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Courses</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link
                                        href={route('admin.organizations.show', org.id)}
                                        className="flex-1 text-center bg-muted text-foreground py-3 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-colors"
                                    >
                                        Manage
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(org)}
                                        className="px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
