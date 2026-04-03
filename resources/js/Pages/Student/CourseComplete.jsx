import { Head, Link } from '@inertiajs/react';
import { useTheme } from '@/Context/ThemeContext';
import ThemeStyleInjector from '@/Components/ThemeStyleInjector';

export default function CourseComplete({ course, enrollment }) {
    const { theme } = useTheme();

    return (
        <div className="min-h-screen bg-muted flex flex-col items-center justify-center p-6 relative overflow-hidden font-jakarta">
            <ThemeStyleInjector />
            <Head title={`Course Completed: ${course.title}`} />

            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-3xl w-full bg-surface rounded-[48px] shadow-2xl shadow-black/5 border border-border p-12 sm:p-20 text-center space-y-12 relative z-10 animate-in fade-in zoom-in duration-700">
                {/* Celebration Icon */}
                <div className="relative inline-block">
                    <div className="w-32 h-32 bg-primary/20 rounded-[40px] flex items-center justify-center mx-auto relative z-10 shadow-xl shadow-primary/5">
                        <span className="text-6xl animate-bounce drop-shadow-[0_10px_15px_rgba(0,0,0,0.15)] select-none">🎓</span>
                    </div>
                    {/* Floating icons around */}
                    <div className="absolute -top-4 -right-4 text-4xl animate-pulse drop-shadow-lg select-none">🎉</div>
                    <div className="absolute -bottom-4 -left-4 text-4xl animate-pulse drop-shadow-lg select-none" style={{ animationDelay: '500ms' }}>⭐</div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
                        Congratulations!
                    </h1>
                    <p className="text-lg text-gray-500 font-bold max-w-md mx-auto">
                        You have successfully completed the course <span className="text-primary">"{course.title}"</span>.
                    </p>
                </div>

                {/* Course Metadata Summary */}
                <div className="grid grid-cols-2 gap-4 py-8 border-y border-border/50">
                    <div className="text-center">
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                        <p className="text-sm font-black text-success uppercase">COMPLETED ✓</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Credits</p>
                        <p className="text-sm font-black text-foreground uppercase">{course.level || 'Expert'}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 pt-4">
                    <Link
                        href={route('student.courses.index')}
                        className="flex-1 bg-muted text-foreground py-5 rounded-full font-extrabold text-sm uppercase tracking-widest hover:bg-gray-200 transition-all border border-border"
                    >
                        Back to My Courses
                    </Link>
                    <Link
                        href={route('student.dashboard.certificates')}
                        className="flex-1 bg-primary text-white py-5 rounded-full font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all hover:-translate-y-1"
                    >
                        Claim Certificate 🏆
                    </Link>
                </div>

                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest pt-4">
                    Shared your achievement with the world
                </p>
            </div>
        </div>
    );
}
