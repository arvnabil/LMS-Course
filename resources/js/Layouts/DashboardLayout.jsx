import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import Toast from '@/Components/Toast';
import { ThemeToggle } from '@/Context/ThemeContext';
import ThemeStyleInjector from '@/Components/ThemeStyleInjector';

import Icon from '@/Components/Icon';

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
            { label: 'Learning Progress', icon: 'activity', href: '/dashboard/learning-progress', routeName: 'student.dashboard.learning-progress', roles: ['student', 'mentor', 'admin'] },
            { label: 'Course Catalog', icon: 'library', href: '/dashboard/catalog', routeName: 'student.catalog.*', roles: ['student', 'mentor', 'admin'] },
            { label: 'Certificates', icon: 'award', href: '/dashboard/certificates', routeName: 'student.dashboard.certificates', roles: ['student', 'mentor', 'admin'] },
            { label: 'Achievements', icon: 'trophy', href: '/dashboard/achievements', routeName: 'student.dashboard.achievements', roles: ['student', 'mentor', 'admin'] },
        ],
    },
    {
        group: 'Mentor Area',
        roles: ['student', 'mentor', 'admin'],
        items: [
            { label: 'Mentor Overview', icon: 'presentation', href: '/dashboard/mentor-overview', routeName: 'student.dashboard.mentor-overview', roles: ['student', 'mentor', 'admin'] },
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
                                        {user.full_name || user.name || 'User'}
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
                    <header className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-surface/80 backdrop-blur-md border-b border-border px-4 py-3 lg:px-8 lg:py-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <button onClick={toggleSidebar} className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg">
                                    <Icon name="menu" className="text-foreground" />
                                </button>
                                {header && (
                                    <div className="block">
                                        {header}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-3 md:gap-6 flex-1 justify-end max-w-2xl">
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
                    <div className="p-4 md:p-6 lg:p-8 flex-1 mt-[64px] lg:mt-[80px]">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
