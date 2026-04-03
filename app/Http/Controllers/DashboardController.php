<?php

namespace App\Http\Controllers;

use Modules\Course\Models\Course;
use Modules\Course\Models\Enrollment;
use Modules\Payment\Models\Transaction;
use App\Models\User;
use Modules\Notification\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Stats Calculation
        $totalRevenue = Transaction::where('status', 'success')->sum('amount');
        $activeStudents = User::where('role', 'student')->whereHas('enrollments')->count();
        $activeCourses = Course::where('status', 'published')->count();
        $pendingReviews = Course::where('status', 'draft')->count(); // Mocking pending review as draft

        // Avg Completion Rate
        $enrollments = Enrollment::all();
        $completionRates = $enrollments->map(function ($enrollment) {
            $totalLessons = $enrollment->course->sections->flatMap->lessons->count();
            if ($totalLessons === 0) return 0;
            $completedLessons = $enrollment->lessonProgress()->where('is_completed', true)->count();
            return ($completedLessons / $totalLessons) * 100;
        });
        $avgCompletionRate = $completionRates->isEmpty() ? 0 : round($completionRates->avg());

        // Revenue Trends (Mocking last 7 days)
        $revenueTrends = collect(range(6, 0))->map(function ($daysAgo) {
            $date = now()->subDays($daysAgo)->format('M d');
            return [
                'name' => $date,
                'revenue' => rand(1000, 5000),
            ];
        });

        // Recent Activity
        $recentEnrollments = Enrollment::with(['student', 'course.category'])
            ->latest()
            ->take(5)
            ->get();

        $recentActivity = $recentEnrollments->map(function ($enrollment) {
            return [
                'id' => $enrollment->id,
                'user' => $enrollment->student->full_name,
                'action' => 'enrolled in',
                'target' => $enrollment->course->title,
                'time' => $enrollment->created_at->diffForHumans(),
                'type' => 'enrollment',
            ];
        });

        // Notifications
        $notifications = Notification::where('user_id', $user->id)
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_revenue' => [
                    'value' => 'IDR ' . number_format($totalRevenue, 0, ',', '.'),
                    'change' => '+12% vs last mo', // Static change for now
                ],
                'active_students' => [
                    'value' => number_format($activeStudents),
                    'change' => '+45 new today', // Static change for now
                ],
                'course_progress' => [
                    'value' => $avgCompletionRate . '%',
                    'change' => 'Avg. completion rate',
                ],
                'active_courses' => [
                    'value' => $activeCourses,
                    'change' => $pendingReviews . ' pending review',
                ],
            ],
            'revenue_trends' => $revenueTrends,
            'recent_activity' => $recentActivity,
            'initial_notifications' => $notifications,
        ]);
    }

    public function markAllRead()
    {
        Notification::where('user_id', auth()->id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return back();
    }

    public function activityLog(Request $request)
    {
        $user = auth()->user();

        $totalEvents = Notification::where('user_id', $user->id)->count();
        $userActions = Notification::where('user_id', $user->id)->whereIn('type', ['success', 'info'])->count();

        $activities = Notification::where('user_id', $user->id)
            ->latest()
            ->paginate(15);

        return Inertia::render('Dashboard/ActivityLog', [
            'activities' => $activities,
            'summary' => [
                'total_events' => $totalEvents,
                'user_actions' => $userActions,
                'security_alerts' => 0,
                'config_changes' => 0,
            ],
        ]);
    }
}
