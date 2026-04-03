import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';

export default function MyCourses({ auth, enrollments = [] }) {
    return (
        <DashboardLayout user={auth.user}>
            <Head title="My Learning" />

            <div className="space-y-10">
                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">My Learning</h1>
                    <p className="text-gray-500 font-medium font-jakarta tracking-tight">Access your enrolled courses and track your progress.</p>
                </div>

                {enrollments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {enrollments.map((enrollment) => (
                            <div key={enrollment.id} className="bg-surface rounded-[40px] border border-border overflow-hidden shadow-2xl shadow-black/5 group">
                                <Link href={route('student.learn', enrollment.course.slug)} className="block aspect-video bg-muted relative overflow-hidden">
                                    {enrollment.course.thumbnail ? (
                                        <img src={enrollment.course.thumbnail} alt={enrollment.course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl grayscale opacity-20 text-foreground">
                                            🖼️
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors flex items-center justify-center">
                                        <div className="w-16 h-11 bg-primary rounded-[14px] flex items-center justify-center shadow-2xl translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="ml-1">
                                                <path d="M8 5v14l11-7z"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="absolute top-6 left-6">
                                        <span className="bg-surface/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-primary shadow-sm">
                                            {enrollment.course.category?.name || 'Course'}
                                        </span>
                                    </div>
                                </Link>
                                <div className="p-8 space-y-6">
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-extrabold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                            {enrollment.course.title}
                                        </h3>
                                        <p className="text-xs font-bold text-gray-400">By {enrollment.course.mentor?.full_name}</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest">
                                            <span className="text-gray-400">Progress</span>
                                            <span className="text-primary">{enrollment.progress_percentage}%</span>
                                        </div>
                                        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                            <div className="bg-primary h-full transition-all" style={{ width: `${enrollment.progress_percentage}%` }}></div>
                                        </div>
                                    </div>

                                    <Link
                                        href={route('student.learn', enrollment.course.slug)}
                                        className="w-full inline-flex items-center justify-center bg-muted text-foreground py-4 rounded-full font-extrabold text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                                    >
                                        Continue Learning
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-surface rounded-[40px] p-20 text-center space-y-6 border border-border shadow-2xl shadow-black/5">
                        <div className="text-7xl grayscale">🎓</div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-extrabold text-foreground">No courses enrolled yet</h3>
                            <p className="text-gray-500 font-medium">Explore our catalog and start your learning journey today.</p>
                        </div>
                        <Link
                            href="/dashboard/catalog"
                            className="inline-flex items-center justify-center bg-primary text-white px-10 py-5 rounded-full font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all"
                        >
                            Browse Catalog
                        </Link>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
