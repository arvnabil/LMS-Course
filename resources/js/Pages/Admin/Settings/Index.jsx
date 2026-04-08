import { useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import Toast from '@/Components/Toast';
import OneDriveFolderPicker from '@/Components/OneDriveFolderPicker';

export default function SettingsIndex({ auth, settings, onedriveConnected }) {
    const { flash, global_settings } = usePage().props;
    const [activeTab, setActiveTab] = useState('branding');
    const [showToast, setShowToast] = useState(false);
    
    const [activeIntegration, setActiveIntegration] = useState(null);
    const [showFolderPicker, setShowFolderPicker] = useState(false);
    const [mentors, setMentors] = useState([]);
    const [isLoadingMentors, setIsLoadingMentors] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        primary_color: settings.primary_color || global_settings.primary_color || '#ef3f09',
        sidebar_active_color: settings.sidebar_active_color || global_settings.sidebar_active_color || '#276874',
        platform_name: settings.platform_name || global_settings.platform_name || 'LMS',
        platform_logo: null,
        onedrive_client_id: settings.onedrive_client_id || '',
        onedrive_client_secret: settings.onedrive_client_secret || '',
        onedrive_tenant_id: settings.onedrive_tenant_id || 'common',
        onedrive_redirect_uri: settings.onedrive_redirect_uri || '',
        onedrive_base_path: settings.onedrive_base_path || 'LMS-Course',
    });

    useEffect(() => {
        if (flash.success) {
            setShowToast(true);
        }
    }, [flash]);

    const fetchMentors = async () => {
        setIsLoadingMentors(true);
        try {
            const response = await axios.get(route('admin.settings.onedrive.permissions.index'));
            setMentors(response.data.mentors);
        } catch (err) {
            console.error('Failed to fetch mentors', err);
        } finally {
            setIsLoadingMentors(false);
        }
    };

    const updatePermission = async (userId, field, value) => {
        const mentor = mentors.find(m => m.id === userId);
        const newPermissions = { ...mentor.permissions, [field]: value };
        
        try {
            await axios.post(route('admin.settings.onedrive.permissions.update'), {
                user_id: userId,
                ...newPermissions
            });
            // Update local state
            setMentors(mentors.map(m => m.id === userId ? { ...m, permissions: newPermissions } : m));
        } catch (err) {
            console.error('Failed to update permission', err);
        }
    };

    useEffect(() => {
        if (activeIntegration === 'onedrive') {
            fetchMentors();
        }
    }, [activeIntegration]);

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            preserveScroll: true,
            onSuccess: () => {
                // No reload needed, Inertia updates props automatically
                reset('platform_logo');
            }
        });
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Platform Settings" />

            {showToast && (
                <Toast 
                    message={flash.success} 
                    type="success" 
                    onClose={() => setShowToast(false)} 
                />
            )}

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
                        <button 
                            onClick={() => setActiveTab('integrations')}
                            className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'integrations' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-white hover:text-foreground cursor-pointer'}`}
                        >
                            Integrations
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
                                                placeholder="Enter Brand Name"
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
                                        className="bg-primary text-white px-12 py-4 rounded-2xl font-extrabold shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all translate-y-0 hover:-translate-y-1 cursor-pointer"
                                    >
                                        {processing ? 'Saving...' : 'Save Branding Assets'}
                                    </button>
                                </div>
                            </form>
                        )}
                        
                        {activeTab === 'integrations' && (
                            <div>
                                {!activeIntegration ? (
                                    <div className="space-y-8">
                                        <div>
                                            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Integrations</h2>
                                            <p className="text-gray-400 text-sm font-medium mt-2">Manage third-party services and external connections.</p>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* OneDrive Card */}
                                            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all group">
                                                <div className="flex items-start gap-4 mb-6">
                                                    <div className="w-14 h-14 bg-[#0078D4]/10 rounded-2xl flex items-center justify-center text-[#0078D4] shrink-0 group-hover:scale-110 transition-transform">
                                                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M17.65 11.23a4.7 4.7 0 0 0-6.9-3.08 5.75 5.75 0 0 0-10.4 2.8 4.25 4.25 0 0 0 1.25 8.3h16a3.75 3.75 0 0 0 .05-7.5l-.2-.02H18z"/></svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-extrabold text-lg text-foreground">Microsoft OneDrive</h3>
                                                        <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">Connect to OneDrive for storing and streaming large course videos efficiently.</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-gray-50 pt-5">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${onedriveConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        {onedriveConnected ? 'Connected' : 'Not Configured'}
                                                    </span>
                                                    <button onClick={() => setActiveIntegration('onedrive')} className="text-sm font-bold text-primary hover:text-primary-hover transition-colors">
                                                        Configure &rarr;
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Google Drive Card (Mock) */}
                                            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm opacity-50 grayscale cursor-not-allowed">
                                                <div className="flex items-start gap-4 mb-6">
                                                    <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600 shrink-0">
                                                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M7.71 3.5L1.15 15l3.43 6L11.14 9.5M9.73 15L6.3 21h13.12l3.43-6M12.86 3.5h-6.85l6.57 11.5h6.85"/></svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-extrabold text-lg text-foreground">Google Drive</h3>
                                                        <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">Store documents and files in Google Workspace. (Coming Soon)</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-gray-50 pt-5">
                                                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gray-100 text-gray-400">
                                                        Coming Soon
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* AWS S3 Card (Mock) */}
                                            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm opacity-50 grayscale cursor-not-allowed">
                                                <div className="flex items-start gap-4 mb-6">
                                                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shrink-0">
                                                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-extrabold text-lg text-foreground">AWS S3 Storage</h3>
                                                        <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">Enterprise object storage for massive scale. (Coming Soon)</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-gray-50 pt-5">
                                                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gray-100 text-gray-400">
                                                        Coming Soon
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : activeIntegration === 'onedrive' ? (
                                    <form onSubmit={submit} className="space-y-8">
                                        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                                            <button 
                                                type="button" 
                                                onClick={() => setActiveIntegration(null)} 
                                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-muted text-gray-500 hover:bg-gray-200 hover:text-foreground transition-all"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                                            </button>
                                            <div>
                                                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Microsoft OneDrive Settings</h2>
                                                <p className="text-gray-400 text-sm font-medium mt-1">Configure your Microsoft Graph API parameters.</p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#0078D4]/5 border border-[#0078D4]/20 p-6 rounded-3xl gap-4">
                                                <div>
                                                    <h3 className="font-bold text-lg text-[#0078D4] flex items-center gap-2">
                                                        Connection Status
                                                    </h3>
                                                    <p className="text-sm text-[#0078D4]/70 font-medium mt-1">You must save your settings before connecting.</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider ${onedriveConnected ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                                        {onedriveConnected ? 'Active' : 'Disconnected'}
                                                    </span>
                                                    {onedriveConnected ? (
                                                        <a href={route('onedrive.auth')} className="text-sm font-bold text-primary hover:text-primary-hover underline underline-offset-4 bg-white px-4 py-2 rounded-2xl shadow-sm whitespace-nowrap">Reconnect</a>
                                                    ) : (
                                                        <a href={route('onedrive.auth')} className="text-sm font-bold text-white bg-[#0078D4] px-6 py-2.5 rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 whitespace-nowrap">Connect Now</a>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                                <div className="space-y-3">
                                                    <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Client ID</label>
                                                    <input 
                                                        type="text" 
                                                        value={data.onedrive_client_id}
                                                        onChange={e => setData('onedrive_client_id', e.target.value)}
                                                        className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-[#0078D4]/20 transition-all outline-none"
                                                        placeholder="Enter Microsoft Client ID"
                                                    />
                                                    <InputError message={errors.onedrive_client_id} />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Client Secret</label>
                                                    <input 
                                                        type="password" 
                                                        value={data.onedrive_client_secret}
                                                        onChange={e => setData('onedrive_client_secret', e.target.value)}
                                                        className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-[#0078D4]/20 transition-all outline-none"
                                                        placeholder="Enter Microsoft Client Secret"
                                                    />
                                                    <InputError message={errors.onedrive_client_secret} />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Tenant ID</label>
                                                    <input 
                                                        type="text" 
                                                        value={data.onedrive_tenant_id}
                                                        onChange={e => setData('onedrive_tenant_id', e.target.value)}
                                                        className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-[#0078D4]/20 transition-all outline-none"
                                                        placeholder="e.g. common or specific tenant ID"
                                                    />
                                                    <InputError message={errors.onedrive_tenant_id} />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Redirect URI</label>
                                                    <input 
                                                        type="text" 
                                                        value={data.onedrive_redirect_uri}
                                                        onChange={e => setData('onedrive_redirect_uri', e.target.value)}
                                                        className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-[#0078D4]/20 transition-all outline-none"
                                                        placeholder="https://.../onedrive/callback"
                                                    />
                                                    <InputError message={errors.onedrive_redirect_uri} />
                                                </div>
                                                 <div className="space-y-3 md:col-span-2">
                                                    <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Base Path (Root Folder)</label>
                                                    
                                                    <div className="flex items-stretch gap-3">
                                                        <div className="flex-1 bg-muted rounded-2xl px-6 py-4 flex items-center min-h-[56px]">
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                <div className="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center text-[#0078D4] shrink-0">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                                                                </div>
                                                                <span className="text-sm font-bold text-foreground truncate">
                                                                    {data.onedrive_base_path || 'OneDrive Root'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            type="button"
                                                            onClick={() => setShowFolderPicker(true)}
                                                            className="px-6 rounded-2xl bg-[#0078D4] text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all whitespace-nowrap"
                                                        >
                                                            Browse Folder
                                                        </button>
                                                    </div>

                                                    <p className="text-[11px] text-gray-500 font-bold px-2 mt-2">
                                                        This is the root directory where all course materials and videos will be managed.
                                                    </p>
                                                    <InputError message={errors.onedrive_base_path} />

                                                    <OneDriveFolderPicker 
                                                        show={showFolderPicker} 
                                                        onClose={() => setShowFolderPicker(false)}
                                                        onSelect={(path) => setData('onedrive_base_path', path)}
                                                        currentPath={data.onedrive_base_path}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mentor Access Control Section */}
                                        <div className="pt-10 border-t border-gray-100 space-y-6">
                                            <div>
                                                <h3 className="text-xl font-extrabold text-foreground tracking-tight">Grant Mentor for OneDrive Access</h3>
                                                <p className="text-gray-400 text-sm font-medium mt-1">Select which OneDrive features each mentor can access in the lesson editor.</p>
                                            </div>

                                            <div className="bg-muted/30 rounded-3xl border border-gray-100 overflow-hidden">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="border-b border-gray-100">
                                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Mentor</th>
                                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Shared Link</th>
                                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Direct Upload</th>
                                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">OneDrive Library</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {isLoadingMentors ? (
                                                            <tr>
                                                                <td colSpan="4" className="px-6 py-10 text-center text-xs font-bold text-gray-400">Loading mentors...</td>
                                                            </tr>
                                                        ) : mentors.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="4" className="px-6 py-10 text-center text-xs font-bold text-gray-400">No mentors found.</td>
                                                            </tr>
                                                        ) : mentors.map((mentor) => (
                                                            <tr key={mentor.id} className="hover:bg-white transition-colors">
                                                                <td className="px-6 py-4">
                                                                    <p className="text-sm font-bold text-foreground">{mentor.full_name}</p>
                                                                    <p className="text-[10px] text-gray-400 font-medium">{mentor.email}</p>
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        className="w-5 h-5 rounded-lg border-gray-200 text-primary focus:ring-primary/20 cursor-pointer"
                                                                        checked={mentor.permissions.can_use_shared_link}
                                                                        onChange={(e) => updatePermission(mentor.id, 'can_use_shared_link', e.target.checked)}
                                                                    />
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        className="w-5 h-5 rounded-lg border-gray-200 text-primary focus:ring-primary/20 cursor-pointer"
                                                                        checked={mentor.permissions.can_upload}
                                                                        onChange={(e) => updatePermission(mentor.id, 'can_upload', e.target.checked)}
                                                                    />
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        className="w-5 h-5 rounded-lg border-gray-200 text-primary focus:ring-primary/20 cursor-pointer"
                                                                        checked={mentor.permissions.can_use_library}
                                                                        onChange={(e) => updatePermission(mentor.id, 'can_use_library', e.target.checked)}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="flex justify-start pt-6 border-t border-gray-50">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="bg-primary text-white px-12 py-4 rounded-2xl font-extrabold shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all translate-y-0 hover:-translate-y-1 cursor-pointer"
                                            >
                                                {processing ? 'Saving...' : 'Save Settings'}
                                            </button>
                                        </div>
                                    </form>
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
