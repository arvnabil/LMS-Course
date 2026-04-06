import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';

export default function OrganizationForm({ auth, organization = null }) {
    const isEditing = !!organization;

    const { data, setData, post, put, processing, errors } = useForm({
        name: organization?.name || '',
        description: organization?.description || '',
        logo: null,
        is_active: organization?.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            // Use POST with _method override for file uploads
            router.post(route('admin.organizations.update', organization.id), {
                ...data,
                _method: 'put',
            }, {
                preserveScroll: true,
                forceFormData: true,
            });
        } else {
            post(route('admin.organizations.store'));
        }
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title={isEditing ? 'Edit Organization' : 'New Organization'} />

            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                        {isEditing ? 'Edit Organization' : 'Create Organization'}
                    </h1>
                    <p className="text-sm font-bold text-gray-400 mt-2">
                        {isEditing ? 'Update the organization details.' : 'Set up a new organization to manage B2B course access.'}
                    </p>
                </div>

                <div className="bg-white rounded-[32px] p-8 sm:p-10 shadow-sm border border-gray-100">
                    <form onSubmit={submit} className="space-y-8">
                        {/* Name */}
                        <div className="space-y-3">
                            <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Organization Name</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all"
                                placeholder="e.g. Telkom Indonesia"
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Description</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm focus:ring-4 focus:ring-primary/10 transition-all min-h-[120px] resize-none"
                                placeholder="Brief description about the organization..."
                            />
                            <InputError message={errors.description} />
                        </div>

                        {/* Logo */}
                        <div className="space-y-3">
                            <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Logo</label>
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center overflow-hidden border border-dashed border-gray-300 relative">
                                    {(data.logo || organization?.logo) ? (
                                        <img
                                            src={data.logo instanceof File ? URL.createObjectURL(data.logo) : `/storage/${organization.logo}`}
                                            className="w-full h-full object-cover"
                                            alt="Logo preview"
                                        />
                                    ) : (
                                        <span className="text-xl opacity-20">Logo</span>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('logo', e.target.files[0])}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                    Tap to upload (Max 2MB)
                                </p>
                            </div>
                            <InputError message={errors.logo} />
                        </div>

                        {/* Active Toggle (Edit Only) */}
                        {isEditing && (
                            <div className="flex items-center justify-between bg-muted rounded-2xl px-6 py-4">
                                <div>
                                    <p className="text-sm font-bold text-foreground">Active Status</p>
                                    <p className="text-xs text-gray-400">Inactive organizations won't grant course access.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setData('is_active', !data.is_active)}
                                    className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer ${data.is_active ? 'bg-primary' : 'bg-gray-300'}`}
                                >
                                    <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${data.is_active ? 'left-5.5' : 'left-0.5'}`} />
                                </button>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex justify-start pt-4 border-t border-gray-50">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-primary text-white px-12 py-4 rounded-full font-extrabold shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all translate-y-0 hover:-translate-y-1 cursor-pointer disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : (isEditing ? 'Update Organization' : 'Create Organization')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
