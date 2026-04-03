import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import InputError from '@/Components/InputError';

export default function SettingsIndex({ auth, settings }) {
    const [activeTab, setActiveTab] = useState('branding');
    const { global_settings } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        primary_color: settings.primary_color || global_settings.primary_color || '#ef3f09',
        sidebar_active_color: settings.sidebar_active_color || global_settings.sidebar_active_color || '#276874',
        platform_name: settings.platform_name || global_settings.platform_name || 'EduCore',
        platform_logo: null, // Files are null initially
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            preserveScroll: true,
            onSuccess: () => {
                location.reload(); 
            }
        });
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Platform Settings" />

            <div className="max-w-5xl mx-auto space-y-8 pb-20">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Setting</h1>
                        <p className="text-sm font-bold text-gray-400 mt-2">Manage colors, localization, and standard functionality.</p>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/20 border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                    
                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-64 bg-muted p-6 border-r border-gray-100 flex flex-col gap-2 shrink-0">
                        <button 
                            onClick={() => setActiveTab('general')}
                            className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-white hover:text-foreground cursor-pointer'}`}
                        >
                            General
                        </button>
                        <button 
                            onClick={() => setActiveTab('branding')}
                            className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'branding' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-white hover:text-foreground cursor-pointer'}`}
                        >
                            Branding
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-10 sm:p-14">
                        {activeTab === 'general' && (
                            <div className="space-y-8">
                                <h2 className="text-2xl font-extrabold text-foreground">General Settings</h2>
                                <p className="text-gray-400 text-sm font-medium">Coming soon. You can manage platform name, logo, and other basic info here.</p>
                            </div>
                        )}

                        {activeTab === 'branding' && (
                            <form onSubmit={submit} className="space-y-12">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Branding</h2>
                                    <p className="text-gray-400 text-sm font-medium mt-2">Manage your institution's name, logo, and theme colors.</p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* Platform Info */}
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Brand Name</label>
                                            <input 
                                                type="text" 
                                                value={data.platform_name}
                                                onChange={e => setData('platform_name', e.target.value)}
                                                className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all"
                                                placeholder="e.g. EduCore"
                                            />
                                            <InputError message={errors.platform_name} />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Brand Logo</label>
                                            <div className="flex flex-col gap-4">
                                                <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center overflow-hidden border border-dashed border-gray-300 group hover:border-primary transition-all relative">
                                                    {(data.platform_logo || settings.platform_logo) ? (
                                                        <img 
                                                            src={data.platform_logo instanceof File ? URL.createObjectURL(data.platform_logo) : settings.platform_logo} 
                                                            className="w-full h-full object-cover" 
                                                            alt="Logo preview"
                                                        />
                                                    ) : (
                                                        <span className="text-2xl opacity-20 group-hover:opacity-40 transition-opacity">Logo</span>
                                                    )}
                                                    <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        onChange={e => setData('platform_logo', e.target.files[0])}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tap to upload (Max 2MB)</p>
                                            </div>
                                            <InputError message={errors.platform_logo} />
                                        </div>
                                    </div>

                                    {/* Colors */}
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Global Primary Color</label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="color"
                                                    value={data.primary_color}
                                                    className="w-16 h-16 rounded-2xl cursor-pointer border-none p-0 outline-none"
                                                    onChange={(e) => setData('primary_color', e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    value={data.primary_color}
                                                    className="flex-1 bg-muted border-none rounded-2xl px-6 py-4 text-sm font-bold uppercase"
                                                    onChange={(e) => setData('primary_color', e.target.value)}
                                                />
                                            </div>
                                            <InputError message={errors.primary_color} />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Sidebar Active Color</label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="color"
                                                    value={data.sidebar_active_color}
                                                    className="w-16 h-16 rounded-2xl cursor-pointer border-none p-0 outline-none"
                                                    onChange={(e) => setData('sidebar_active_color', e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    value={data.sidebar_active_color}
                                                    className="flex-1 bg-muted border-none rounded-2xl px-6 py-4 text-sm font-bold uppercase"
                                                    onChange={(e) => setData('sidebar_active_color', e.target.value)}
                                                />
                                            </div>
                                            <InputError message={errors.sidebar_active_color} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-start pt-6 border-t border-gray-50">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-primary text-white px-12 py-4 rounded-full font-extrabold shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all translate-y-0 hover:-translate-y-1 cursor-pointer"
                                    >
                                        {processing ? 'Saving...' : 'Save Branding Assets'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
