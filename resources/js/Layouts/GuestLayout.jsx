import { Link, usePage } from '@inertiajs/react';
import { ThemeToggle } from '@/Context/ThemeContext';
import ThemeStyleInjector from '@/Components/ThemeStyleInjector';

export default function GuestLayout({ children }) {
    const { global_settings } = usePage().props;

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
                            <Link href="#" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors">Reviews</Link>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <Link href={route('login')} className="hidden sm:block text-sm font-bold text-foreground py-3 px-8 rounded-full hover:bg-muted transition-colors border border-border">
                                Sign In
                            </Link>
                            <Link href={route('register')} className="text-sm font-bold text-white bg-primary py-3 px-8 rounded-full shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all translate-y-0 hover:-translate-y-1">
                                Sign Up
                            </Link>
                        </div>
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
                                <li><Link href="#" className="hover:text-white transition-colors">Reviews</Link></li>
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
