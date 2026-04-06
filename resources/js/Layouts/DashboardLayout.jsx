import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import Toast from '@/Components/Toast';
import { ThemeToggle } from '@/Context/ThemeContext';
import ThemeStyleInjector from '@/Components/ThemeStyleInjector';

// Lucide-react icons (inline SVGs for now — will use lucide-react later)
const icons = {
    'layout-grid': (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
    ),
    'book-open': (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
    ),
    'library': (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>
    ),
    'award': (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
    ),
    'trophy': (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
    ),
    'pen-tool': (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
    ),
    'users': (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
    'dollar-sign': (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    ),
    'wallet': (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
    ),
    'bar-chart': (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>
    ),
    'layers': (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22.54 12.43-1.96-.9-8.58 3.91a2 2 0 0 1-1.66 0l-8.58-3.9-1.96.89a1 1 0 0 0 0 1.83l8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22.54 16.43-1.96-.89-8.58 3.9a2 2 0 0 1-1.66 0l-8.58-3.9-1.96.88a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.91a1 1 0 0 0 0-1.83Z"/></svg>
    ),
    'credit-card': (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
    ),
    'settings': (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
    ),
    'briefcase': (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
    ),
    'home': (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    ),
    'shield': (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    ),
    'log-out': (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
    ),
    'graduation-cap': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 10 3 12 0v-5"/></svg>
    ),
    'menu': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
    ),
    'x': (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    ),
    'search': (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    ),
    'bell': (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
    ),
    'chevron-down': (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    ),
    'user': (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    ),
    'clipboard-list': (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
    ),
};

const Icon = ({ name, className = '' }) => {
    const icon = icons[name];
    if (!icon) return null;
    return <span className={className}>{icon}</span>;
};

// Menu configuration — role-based
const menuConfig = [
    {
        group: 'Main',
        items: [
            { label: 'Overview', icon: 'layout-grid', href: '/dashboard', routeName: 'dashboard', roles: ['student', 'mentor', 'admin'] },
            { label: 'Activity Log', icon: 'clipboard-list', href: '/dashboard/activity-log', routeName: 'dashboard.activity-log', roles: ['student', 'mentor', 'admin'] },
        ],
    },
    {
        group: 'Learning',
        roles: ['student', 'mentor', 'admin'],
        items: [
            { label: 'My Courses', icon: 'book-open', href: '/dashboard/courses', routeName: 'student.courses.*', roles: ['student', 'mentor', 'admin'] },
            { label: 'Course Catalog', icon: 'library', href: '/dashboard/catalog', routeName: 'student.catalog.*', roles: ['student', 'mentor', 'admin'] },
            { label: 'Certificates', icon: 'award', href: '/dashboard/certificates', routeName: 'student.dashboard.certificates', roles: ['student', 'mentor', 'admin'] },
            { label: 'Achievements', icon: 'trophy', href: '/dashboard/achievements', routeName: 'student.dashboard.achievements', roles: ['student', 'mentor', 'admin'] },
        ],
    },
    {
        group: 'Mentor Area',
        roles: ['mentor', 'admin'],
        items: [
            { label: 'Course Builder', icon: 'pen-tool', href: '/dashboard/mentor/courses', routeName: 'mentor.courses.*', roles: ['mentor', 'admin'] },
            { label: 'My Students', icon: 'users', href: '/dashboard/mentor/students', routeName: 'mentor.students', roles: ['mentor', 'admin'] },
            { label: 'Submissions', icon: 'layers', href: '/dashboard/mentor/submissions', routeName: 'mentor.submissions.*', roles: ['mentor', 'admin'] },
            { label: 'Earnings', icon: 'dollar-sign', href: '/dashboard/mentor/earnings', routeName: 'mentor.earnings', roles: ['mentor'] },
            { label: 'Withdrawals', icon: 'wallet', href: '/dashboard/mentor/withdrawals', routeName: 'mentor.withdrawals', roles: ['mentor'] },
        ],
    },
    {
        group: 'Admin Area',
        roles: ['admin'],
        items: [
            { label: 'Analytics', icon: 'bar-chart', href: '/dashboard/admin/analytics', routeName: 'admin.analytics', roles: ['admin'] },
            { label: 'All Courses', icon: 'layers', href: '/dashboard/admin/courses', routeName: 'admin.courses.*', roles: ['admin'] },
            { label: 'Categories', icon: 'layers', href: '/dashboard/admin/categories', routeName: 'admin.categories.*', roles: ['admin'] },
            { label: 'Users', icon: 'users', href: '/dashboard/admin/users', routeName: 'admin.users.*', roles: ['admin'] },
            { label: 'Roles & Perms', icon: 'shield', href: '/dashboard/admin/roles', routeName: 'admin.roles.*', roles: ['admin'] },
            { label: 'Transactions', icon: 'credit-card', href: '/dashboard/admin/transactions', routeName: 'admin.transactions.*', roles: ['admin'] },
            { label: 'Organizations', icon: 'briefcase', href: '/dashboard/admin/organizations', routeName: 'admin.organizations.*', roles: ['admin'] },

            { label: 'Setting', icon: 'settings', href: '/dashboard/admin/settings', routeName: 'admin.settings.*', roles: ['admin'] },
        ],
    }
];

const isActiveRoute = (item, currentUrl) => {
    const href = typeof item === 'string' ? item : item.href;
    
    // Priority 1: Use routeName with Ziggy if available (most precise)
    try {
        if (item.routeName && typeof route !== 'undefined') {
            if (route().current(item.routeName)) return true;
        }
    } catch (e) {
        // Ziggy wildcard error, ignore and fallback
    }

    // Priority 2: Fallback to URL matching
    if (href === '/dashboard') return currentUrl === '/dashboard';
    
    // Ensure exact match or it's a sub-directory match
    return currentUrl === href || currentUrl.startsWith(href + '/');
};

export default function DashboardLayout({ header, children }) {
    const { auth, url, notifications: initialNotifications, flash, global_settings } = usePage().props;
    const user = auth.user;
    const currentUrl = url || window.location.pathname;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileDropdown, setProfileDropdown] = useState(false);
    const [notificationDropdown, setNotificationDropdown] = useState(false);
    const [toast, setToast] = useState(null);
    const navRef = useRef(null);

    // Persist sidebar scroll position across navigations
    useEffect(() => {
        if (navRef.current) {
            const savedScroll = sessionStorage.getItem('sidebarScrollPosition');
            if (savedScroll) {
                navRef.current.scrollTop = parseInt(savedScroll, 10);
            }
        }
    }, [currentUrl]);

    const handleSidebarScroll = (e) => {
        sessionStorage.setItem('sidebarScrollPosition', e.target.scrollTop);
    };

    useEffect(() => {
        if (flash?.success) setToast({ message: flash.success, type: 'success' });
        if (flash?.error) setToast({ message: flash.error, type: 'error' });
    }, [flash]);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    
    const markAllAsRead = () => {
        import('@inertiajs/react').then(({ router }) => {
            router.post(route('notifications.markAllRead'), {}, {
                preserveScroll: true,
                onSuccess: () => setNotificationDropdown(false),
            });
        });
    };

    const unreadCount = initialNotifications.filter(n => !n.is_read).length;

    // Filter menu items by user role
    const filteredMenu = menuConfig
        .filter(group => !group.roles || group.roles.includes(user.role))
        .map(group => ({
            ...group,
            items: group.items.filter(item => item.roles.includes(user.role)),
        }))
        .filter(group => group.items.length > 0);

    const roleBadgeColors = {
        admin: 'bg-primary text-white',
        mentor: 'bg-sidebar-active text-white shadow-sm',
        student: 'bg-accent-lime text-black shadow-sm',
    };

    return (
        <div className="font-sans bg-body min-h-screen overflow-x-hidden text-foreground">
            <ThemeStyleInjector />
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <div className="flex min-h-screen">
                {/* SIDEBAR */}
                <aside
                    className={`w-64 bg-muted fixed inset-y-0 left-0 flex flex-col z-50 transform transition-transform duration-300 ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0`}
                >
                    {/* Logo */}
                    <div className="px-6 py-4 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-primary/20">
                                {global_settings?.platform_logo ? (
                                    <img src={global_settings.platform_logo} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <Icon name="graduation-cap" className="text-white" />
                                )}
                            </div>
                            <span className="text-foreground text-xl font-extrabold tracking-tight">
                                {global_settings?.platform_name || 'LMS'}
                            </span>
                        </Link>
                        <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-gray-200 rounded-lg">
                            <Icon name="x" className="text-gray-600" />
                        </button>
                    </div>

                    {/* Nav */}
                    <nav 
                        ref={navRef}
                        onScroll={handleSidebarScroll}
                        className="flex-1 px-4 py-4 space-y-6 overflow-y-auto scrollbar-hide"
                    >
                        {filteredMenu.map((group) => (
                            <div key={group.group}>
                                <h3 className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    {group.group}
                                </h3>
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const active = isActiveRoute(item, currentUrl);
                                        return (
                                            <Link key={item.href} href={item.href} preserveScroll className="block group">
                                                <div
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-[20px] transition-all shadow-sm ${
                                                        active
                                                            ? 'bg-sidebar-active text-white'
                                                            : 'hover:bg-gray-100 dark:hover:bg-white/5'
                                                    }`}
                                                >
                                                    <span className={active ? 'text-white' : 'text-gray-500 group-hover:text-primary'}>
                                                        <Icon name={item.icon} />
                                                    </span>
                                                    <span
                                                        className={`font-bold ${
                                                            active ? 'text-white' : 'text-foreground group-hover:text-primary'
                                                        }`}
                                                    >
                                                        {item.label}
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* User Profile Card (Bottom) */}
                    <div className="p-4 mt-auto">
                        <div className="bg-surface rounded-2xl p-4 shadow-md border border-border">
                            <div className="flex items-center gap-3">
                                <div className="min-w-0 flex-1 flex flex-col justify-center">
                                    <h3 className="text-sm font-extrabold text-foreground truncate leading-tight">
                                        {user.name || 'User'}
                                    </h3>
                                    <p className="text-xs font-semibold text-foreground/60 truncate mb-1">
                                        {user.email || 'user@example.com'}
                                    </p>
                                    <div className="flex items-center">
                                        <span className={`inline-flex py-0.5 px-2 rounded-md text-[10px] font-black uppercase tracking-wider ${roleBadgeColors[user.role] || 'bg-muted text-foreground'}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors shrink-0"
                                    title="Log Out"
                                >
                                    <Icon name="log-out" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 lg:ml-64 bg-body min-h-screen flex flex-col">
                    {/* Top Navbar */}
                    <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-border px-4 py-3 lg:px-8 lg:py-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <button onClick={toggleSidebar} className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg">
                                    <Icon name="menu" className="text-foreground" />
                                </button>
                                {header && (
                                    <div className="hidden md:block">
                                        {header}
                                    </div>
                                )}
                            </div>                            <div className="flex items-center gap-3 md:gap-6 flex-1 justify-end max-w-2xl">
                                {/* Quick Actions */}
                                <div className="flex items-center gap-2">
                                    {/* Notifications Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setNotificationDropdown(!notificationDropdown)}
                                            className="p-2.5 hover:bg-gray-100 rounded-full relative transition-all"
                                        >
                                            <Icon name="bell" className={`${notificationDropdown ? 'text-primary' : 'text-foreground'}`} />
                                            {unreadCount > 0 && (
                                                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-white text-[8px] flex items-center justify-center rounded-full border-2 border-surface font-black shadow-sm ring-1 ring-primary/20">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </button>

                                        {notificationDropdown && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setNotificationDropdown(false)} />
                                                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-surface rounded-[32px] shadow-2xl border border-border py-6 z-20 flex flex-col max-h-[520px]">
                                                    {/* Arrow */}
                                                    <div className="absolute -top-2 right-4 w-4 h-4 bg-surface border-t border-l border-border rotate-45 z-0"></div>
                                                    
                                                    <div className="px-6 mb-6 flex items-center justify-between relative z-10">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-lg font-extrabold text-foreground">Notifications</h3>
                                                            {unreadCount > 0 && (
                                                                <span className="bg-primary text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                                    {unreadCount} New
                                                                </span>
                                                            )}
                                                        </div>
                                                        <button 
                                                            onClick={markAllAsRead}
                                                            className="text-[10px] font-extrabold text-sidebar-active uppercase tracking-widest flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                                                        >
                                                            <span className="text-xs">✓</span> MARK ALL AS READ
                                                        </button>
                                                    </div>

                                                    <div className="flex-1 overflow-y-auto px-2 relative z-10 scrollbar-hide">
                                                        <div className="space-y-1">
                                                            {initialNotifications.length > 0 ? initialNotifications.map((notif) => (
                                                                <div 
                                                                    key={notif.id} 
                                                                    className={`p-4 rounded-3xl transition-all cursor-pointer group ${!notif.is_read ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
                                                                >
                                                                    <div className="flex gap-4">
                                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'success' ? 'bg-accent-lime/20 text-accent-lime' : 'bg-primary/10 text-primary'}`}>
                                                                            {notif.type === 'success' ? <span className="text-sm">✓</span> : <span className="text-sm">ℹ️</span>}
                                                                        </div>
                                                                        <div className="space-y-1 flex-1 min-w-0">
                                                                            <div className="flex items-start justify-between gap-2">
                                                                                <h4 className="text-sm font-extrabold text-foreground leading-tight">{notif.title}</h4>
                                                                                <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">{notif.time}</span>
                                                                            </div>
                                                                            <p className="text-xs font-medium text-gray-500 leading-relaxed line-clamp-2">
                                                                                {notif.message}
                                                                            </p>
                                                                            {!notif.is_read && (
                                                                                <div className="w-2 h-2 bg-primary rounded-full absolute right-6 top-1/2 -translate-y-1/2"></div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )) : (
                                                                <div className="p-10 text-center">
                                                                    <p className="text-gray-400 text-sm">No new notifications</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="px-6 mt-6 border-t border-gray-100 pt-4 text-center relative z-10">
                                                        <Link href={route('dashboard.activity-log')} className="text-xs font-extrabold text-primary uppercase tracking-widest hover:underline">
                                                            View All Activity
                                                        </Link>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="h-8 w-px bg-gray-200 mx-1"></div>
                                    <ThemeToggle />
                                    <div className="h-8 w-px bg-gray-200 mx-1"></div>

                                    {/* Profile Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setProfileDropdown(!profileDropdown)}
                                            className="flex items-center gap-2 hover:bg-gray-50 pr-2 pl-1 py-1 rounded-full transition-all"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-200">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.full_name || user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Icon name="user" className="text-gray-500" />
                                                )}
                                            </div>
                                            <Icon name="chevron-down" className="text-gray-400 w-4 h-4" />
                                        </button>

                                        {profileDropdown && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setProfileDropdown(false)} />
                                                <div className="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-lg border border-border py-2 z-20">
                                                    <Link
                                                        href={route('profile.edit')}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <Icon name="user" className="text-gray-400" />
                                                            Profile
                                                        </span>
                                                    </Link>
                                                    <Link
                                                        href={user.role === 'admin' ? '/dashboard/admin/settings' : route('profile.edit')}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <Icon name="settings" className="text-gray-400" />
                                                            Settings
                                                        </span>
                                                    </Link>
                                                    <hr className="my-1 border-gray-100" />
                                                    <Link
                                                        href={route('logout')}
                                                        method="post"
                                                        as="button"
                                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <Icon name="log-out" className="text-red-400" />
                                                            Log Out
                                                        </span>
                                                    </Link>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <div className="p-4 md:p-6 lg:p-8 flex-1">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
