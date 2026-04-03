import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function CertificateTemplates({ templates }) {
    const handleDelete = (id) => {
        if (confirm('Delete this template?')) {
            router.delete(route('admin.certificate-templates.destroy', id));
        }
    };

    const toggleActive = (id) => {
        router.patch(route('admin.certificate-templates.toggleActive', id));
    };

    return (
        <DashboardLayout header={<h1 className="text-xl font-bold text-foreground">Certificate Templates</h1>}>
            <Head title="Certificate Templates" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Manage certificate designs for your courses.</p>
                    <Link href={route('admin.certificate-templates.create')} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 shadow-sm transition-colors">
                        + New Template
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.data.map(t => (
                        <div key={t.id} className="bg-white border text-foreground border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                            <div className="h-48 bg-gray-100 relative group flex-shrink-0">
                                {t.background_image ? (
                                    <img src={t.background_image} alt={t.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                )}
                                {t.is_active && (
                                    <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow">
                                        ACTIVE
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Link href={route('admin.certificate-templates.edit', t.id)} className="px-3 py-1.5 bg-white text-foreground text-xs font-bold rounded-lg shadow-sm hover:bg-gray-50">
                                        Edit Design
                                    </Link>
                                </div>
                            </div>
                            <div className="p-5 flex flex-col justify-between flex-1">
                                <div>
                                    <h3 className="font-bold text-sm mb-1">{t.name}</h3>
                                    <p className="text-xs text-gray-400">Created: {new Date(t.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</p>
                                </div>
                                <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
                                    <button 
                                        onClick={() => toggleActive(t.id)} 
                                        disabled={t.is_active}
                                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${t.is_active ? 'bg-green-50 text-green-700 cursor-not-allowed' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                                    >
                                        {t.is_active ? 'Currently Active' : 'Set as Active'}
                                    </button>
                                    <button onClick={() => handleDelete(t.id)} disabled={t.is_active} className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {templates.data.length === 0 && (
                        <div className="col-span-full py-16 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <p className="text-sm font-semibold text-gray-600">No templates found</p>
                            <p className="text-xs mt-1">Create your first certificate template to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
