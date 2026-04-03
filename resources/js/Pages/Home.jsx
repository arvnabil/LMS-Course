import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Home({ auth }) {
    const { global_settings } = usePage().props;
    const platformName = global_settings?.platform_name || 'EduCore';

    return (
        <GuestLayout>
            <Head title={`Welcome to ${platformName}`} />

            {/* Hero Section */}
            <section className="relative pt-10 sm:pt-20 pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto space-y-8">
                        <div className="inline-flex items-center gap-2 bg-accent-lime/20 border border-accent-lime/30 px-6 py-2 rounded-full">
                            <span className="w-2 h-2 bg-accent-lime rounded-full"></span>
                            <span className="text-foreground text-xs font-bold uppercase tracking-wider">Most Awarded Learning System</span>
                        </div>

                        <h1 className="text-5xl sm:text-7xl font-extrabold text-foreground leading-[1.1] tracking-tight">
                            Unlock Your <span className="text-primary italic">Potential</span> with Professional Skills
                        </h1>

                        <p className="text-gray-500 text-lg sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                            Access high-quality courses curated by world-class industry leaders. Start your journey toward mastery today.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                            <Link href="/dashboard/catalog" className="w-full sm:w-auto text-base font-extrabold text-white bg-primary py-5 px-12 rounded-full shadow-2xl shadow-primary/30 hover:bg-primary-hover transition-all translate-y-0 hover:-translate-y-2">
                                Explore All Courses
                            </Link>
                            <Link href="#" className="w-full sm:w-auto text-base font-extrabold text-foreground py-5 px-12 rounded-full border border-gray-200 hover:bg-muted transition-all">
                                How it Works
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Abstract Background Elements */}
                <div className="absolute top-20 -left-20 w-80 h-80 bg-accent-teal/10 rounded-full blur-[100px] -z-0"></div>
                <div className="absolute bottom-10 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-0"></div>
            </section>

            {/* Features Stats */}
            <section className="bg-surface py-20 border-y border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center lg:text-left">
                        <div className="space-y-2">
                            <h3 className="text-4xl font-extrabold text-foreground tracking-tight">100K+</h3>
                            <p className="text-gray-500 font-bold text-sm">Active Students</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-4xl font-extrabold text-foreground tracking-tight">500+</h3>
                            <p className="text-gray-500 font-bold text-sm">Professional Courses</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-4xl font-extrabold text-foreground tracking-tight">4.9</h3>
                            <p className="text-gray-500 font-bold text-sm">Average Ratings</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-4xl font-extrabold text-foreground tracking-tight"> indonesia</h3>
                            <p className="text-gray-500 font-bold text-sm">Best Platform 2024</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-[#0c1c3c] dark:bg-surface-secondary rounded-[40px] p-10 sm:p-20 relative overflow-hidden group">
                        <div className="relative z-10 max-w-2xl space-y-8">
                            <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
                                Ready to advance your career? Get started today.
                            </h2>
                            <p className="text-gray-400 text-lg font-medium">
                                Join our community of 100k+ students and learn the skills you need to build the life you want.
                            </p>
                            <Link href={route('register')} className="inline-block text-base font-extrabold text-[#0c1c3c] dark:text-white bg-accent-lime py-5 px-12 rounded-full hover:bg-white dark:hover:bg-primary transition-all">
                                Create My Account
                            </Link>
                        </div>

                        {/* Decoration */}
                        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
