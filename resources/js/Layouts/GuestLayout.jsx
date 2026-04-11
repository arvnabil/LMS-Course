import { Link, usePage } from '@inertiajs/react';
import { ThemeToggle } from '@/Context/ThemeContext';
import ThemeStyleInjector from '@/Components/ThemeStyleInjector';
import { useState } from 'react';
import Dropdown from '@/Components/Dropdown';

export default function GuestLayout({ children }) {
    const { global_settings, auth } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-body font-sans text-foreground overflow-x-hidden selection:bg-primary/30 selection:text-foreground transition-colors duration-300">
            <ThemeStyleInjector />
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {global_settings?.platform_logo ? (
                                    <img src={global_settings.platform_logo} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 10 3 12 0v-5"/></svg>
                                )}
                            </div>
                            <span className="text-foreground text-2xl font-extrabold tracking-tight">
                                {global_settings?.platform_name || 'LMS'}
                            </span>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-10">
                            <Link href="/" className="text-sm font-bold text-foreground hover:text-primary transition-colors">Home</Link>
                            <Link href="/catalog" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors">Course</Link>
                            <Link href="#" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors">Mentors</Link>
                            <Link href={route('certificate.verify')} className="text-sm font-bold text-gray-500 hover:text-primary transition-colors">Verify Certificate</Link>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            
                            {auth.user ? (
                                <div className="hidden md:block">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button className="flex items-center gap-2 p-1 rounded-full hover:bg-muted transition-colors border border-border">
                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10">
                                                    {auth.user.avatar_url ? (
                                                        <img src={auth.user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-primary">
                                                            {auth.user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mr-1"><path d="m6 9 6 6 6-6"/></svg>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content width="48" contentClasses="py-2 bg-surface border border-border shadow-xl rounded-2xl">
                                            <div className="px-4 py-2 border-b border-border mb-1">
                                                <p className="text-xs font-bold text-foreground truncate">{auth.user.name}</p>
                                                <p className="text-[10px] font-medium text-gray-500 truncate">{auth.user.email}</p>
                                            </div>
                                            <Dropdown.Link href={route('dashboard')} className="text-xs font-bold text-foreground hover:bg-primary/5 hover:text-primary transition-all rounded-lg mx-1">
                                                Dashboard
                                            </Dropdown.Link>
                                            <Dropdown.Link href={route('profile.edit')} className="text-xs font-bold text-foreground hover:bg-primary/5 hover:text-primary transition-all rounded-lg mx-1">
                                                Profile Settings
                                            </Dropdown.Link>
                                            <div className="h-px bg-border my-1 mx-2"></div>
                                            <Dropdown.Link 
                                                href={route('logout')} 
                                                method="post" 
                                                as="button" 
                                                className="text-xs font-bold text-red-500 hover:bg-red-50/10 transition-all rounded-lg mx-1 w-full text-left"
                                            >
                                                Log Out
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center gap-3">
                                    <Link href={route('login')} className="text-xs font-bold text-foreground py-2.5 px-6 rounded-full hover:bg-muted transition-colors border border-border">
                                        Sign In
                                    </Link>
                                    <Link href={route('register')} className="text-xs font-bold text-white bg-primary py-2.5 px-6 rounded-full shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">
                                        Sign Up
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Hamburger Button */}
                            <button 
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50 border border-border text-foreground transition-all active:scale-95"
                            >
                                {mobileMenuOpen ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Drawer */}
                <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-surface border-t border-border ${mobileMenuOpen ? 'max-h-[500px] py-6 opacity-100' : 'max-h-0 py-0 opacity-0'}`}>
                    <div className="px-4 space-y-2">
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-6 py-4 rounded-2xl text-sm font-bold text-foreground hover:bg-primary/5 hover:text-primary transition-all">Home</Link>
                        <Link href="/catalog" onClick={() => setMobileMenuOpen(false)} className="block px-6 py-4 rounded-2xl text-sm font-bold text-gray-500 hover:bg-primary/5 hover:text-primary transition-all">Course</Link>
                        <Link href="#" onClick={() => setMobileMenuOpen(false)} className="block px-6 py-4 rounded-2xl text-sm font-bold text-gray-500 hover:bg-primary/5 hover:text-primary transition-all">Mentors</Link>
                        <Link href={route('certificate.verify')} onClick={() => setMobileMenuOpen(false)} className="block px-6 py-4 rounded-2xl text-sm font-bold text-gray-500 hover:bg-primary/5 hover:text-primary transition-all">Verify Certificate</Link>
                        
                        <div className="h-px bg-border my-4 mx-6"></div>
                        
                        {auth.user ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 px-6 py-4 bg-muted/30 rounded-2xl mb-2">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10">
                                        {auth.user.avatar_url ? (
                                            <img src={auth.user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-primary">
                                                {auth.user.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">{auth.user.name}</p>
                                        <p className="text-[10px] text-gray-500">{auth.user.email}</p>
                                    </div>
                                </div>
                                <Link href={route('dashboard')} className="block px-6 py-4 rounded-2xl text-sm font-bold text-primary bg-primary/5 transition-all">
                                    Go to Dashboard
                                </Link>
                                <Link 
                                    href={route('logout')} 
                                    method="post" 
                                    as="button" 
                                    className="w-full text-left px-6 py-4 rounded-2xl text-sm font-bold text-red-500 transition-all"
                                >
                                    Log Out
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 px-4">
                                <Link href={route('login')} className="flex items-center justify-center py-4 rounded-2xl text-sm font-bold border border-border hover:bg-muted transition-all">
                                    Sign In
                                </Link>
                                <Link href={route('register')} className="flex items-center justify-center py-4 rounded-2xl text-sm font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-20">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-[#0c1c3c] dark:bg-[#06060a] text-white pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center overflow-hidden">
                                    {global_settings?.platform_logo ? (
                                        <img src={global_settings.platform_logo} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 10 3 12 0v-5"/></svg>
                                    )}
                                </div>
                                <span className="text-white text-2xl font-bold">
                                    {global_settings?.platform_name || 'LMS'}
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm leading-loose">
                                Build your future with the most professional online learning platform in Indonesia.
                            </p>
                            <div className="flex gap-4">
                                {/* Instagram */}
                                <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-primary hover:border-primary transition-all text-gray-400 hover:text-white cursor-pointer group">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                                </a>
                                {/* LinkedIn */}
                                <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-primary hover:border-primary transition-all text-gray-400 hover:text-white cursor-pointer group">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                                </a>
                                {/* YouTube */}
                                <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-primary hover:border-primary transition-all text-gray-400 hover:text-white cursor-pointer group">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 2-2 68.4 68.4 0 0 1 15 0 2 2 0 0 1 2 2 24.12 24.12 0 0 1 0 10 2 2 0 0 1-2 2 68.4 68.4 0 0 1-15 0 2 2 0 0 1-2-2z"/><path d="m10 15 5-3-5-3z"/></svg>
                                </a>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-lg font-bold">Quick Links</h4>
                            <ul className="space-y-4 text-gray-400 text-sm">
                                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                                <li><Link href="/catalog" className="hover:text-white transition-colors">Courses</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Mentors</Link></li>
                                <li><Link href={route('certificate.verify')} className="hover:text-white transition-colors">Verify Certificate</Link></li>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-lg font-bold">Company</h4>
                            <ul className="space-y-4 text-gray-400 text-sm">
                                <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-lg font-bold">Newsletter</h4>
                            <p className="text-gray-400 text-sm">Stay updated with the latest courses and news.</p>
                            <div className="flex gap-2">
                                <input type="email" placeholder="Email" className="bg-gray-100 dark:bg-gray-800 border-none rounded-full px-4 text-xs w-full focus:ring-1 focus:ring-primary" />
                                <button className="bg-primary hover:bg-primary-hover p-2 rounded-full text-white">→</button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-gray-800 text-center text-gray-500 text-xs font-medium">
                        © {new Date().getFullYear()} {global_settings?.platform_name || 'LMS'}. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
