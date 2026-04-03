import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';

export default function Achievements({ achievements, stats }) {
    const unlocked = (achievements || []).filter(a => a.unlocked);
    const locked = (achievements || []).filter(a => !a.unlocked);

    return (
        <DashboardLayout header={<h1 className="text-xl font-bold text-foreground">Achievements</h1>}>
            <Head title="Achievements" />

            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-surface rounded-2xl border border-border p-5 text-center shadow-sm">
                        <p className="text-2xl font-bold text-foreground">{stats?.courses_enrolled || 0}</p>
                        <p className="text-xs text-foreground/50 mt-1">Courses Enrolled</p>
                    </div>
                    <div className="bg-surface rounded-2xl border border-border p-5 text-center shadow-sm">
                        <p className="text-2xl font-bold text-foreground">{stats?.courses_completed || 0}</p>
                        <p className="text-xs text-foreground/50 mt-1">Completed</p>
                    </div>
                    <div className="bg-surface rounded-2xl border border-border p-5 text-center shadow-sm">
                        <p className="text-2xl font-bold text-foreground">{stats?.certificates_earned || 0}</p>
                        <p className="text-xs text-foreground/50 mt-1">Certificates</p>
                    </div>
                    <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-center text-white">
                        <p className="text-2xl font-bold">{stats?.achievements_unlocked || 0}/{stats?.total_achievements || 0}</p>
                        <p className="text-xs opacity-80 mt-1">Achievements</p>
                    </div>
                </div>

                {/* Unlocked Achievements */}
                {unlocked.length > 0 && (
                    <div>
                        <h2 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">🏆 Unlocked</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {unlocked.map(achievement => (
                                <div key={achievement.id} className="bg-surface rounded-2xl border-2 border-primary/20 p-5 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl border border-primary/20">
                                            {achievement.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">{achievement.title}</h3>
                                            <p className="text-xs text-foreground/50">{achievement.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Locked Achievements */}
                {locked.length > 0 && (
                    <div>
                        <h2 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">🔒 Locked</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {locked.map(achievement => (
                                <div key={achievement.id} className="bg-muted/40 rounded-2xl border border-border p-5 grayscale">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                                            {achievement.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground/40">{achievement.title}</h3>
                                            <p className="text-xs text-foreground/30">{achievement.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(!achievements || achievements.length === 0) && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <p className="text-gray-400">No achievements available.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
