<?php

namespace App\Http\Controllers;

use Modules\Course\Models\Course;
use Modules\Course\Models\Enrollment;
use Modules\Course\Models\LessonProgress;
use Modules\Quiz\Models\QuizAttempt;
use Modules\Payment\Models\Transaction;
use App\Models\User;
use Modules\Notification\Models\Notification;
use Modules\Certificate\Models\Certificate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        return $this->studentDashboard();
    }

    private function adminDashboard()
    {
        $user = auth()->user();

        // Stats Calculation
        $totalRevenue = Transaction::where('status', 'success')->sum('amount');
        $activeStudents = User::role('student')->whereHas('enrollments')->count();
        $activeCourses = Course::where('status', 'published')->count();
        $pendingReviews = Course::where('status', 'draft')->count();

        // Revenue change logic
        $thisMonthRevenue = Transaction::where('status', 'success')->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->sum('amount');
        $lastMonthRevenue = Transaction::where('status', 'success')->whereMonth('created_at', now()->subMonth()->month)->whereYear('created_at', now()->subMonth()->year)->sum('amount');
        $revenueChange = $lastMonthRevenue == 0 ? ($thisMonthRevenue > 0 ? 100 : 0) : round((($thisMonthRevenue / $lastMonthRevenue) - 1) * 100);

        $newStudentsToday = User::role('student')->whereDate('created_at', today())->count();

        // Avg Completion Rate
        $enrollments = Enrollment::with('course.sections.lessons')->get();
        $completionRates = $enrollments->map(function ($enrollment) {
            $course = $enrollment->course;
            if (!$course) return 0;
            $totalLessons = $course->sections->flatMap->lessons->count();
            if ($totalLessons === 0) return 0;
            $completedLessons = $enrollment->lessonProgress()->where('is_completed', true)->count();
            return ($completedLessons / $totalLessons) * 100;
        });
        $avgCompletionRate = $completionRates->isEmpty() ? 0 : round($completionRates->avg());

        // Revenue Trends (Last 7 days)
        $revenueTrends = collect(range(6, 0))->map(function ($daysAgo) {
            $date = now()->subDays($daysAgo);
            return [
                'name' => $date->format('M d'),
                'revenue' => (float) Transaction::where('status', 'success')->whereDate('created_at', $date)->sum('amount'),
            ];
        });

        return Inertia::render('Dashboard', [
            'role' => 'admin',
            'stats' => [
                'total_revenue' => ['value' => 'IDR ' . number_format($totalRevenue, 0, ',', '.'), 'change' => ($revenueChange >= 0 ? '+' : '') . $revenueChange . '% vs last mo'],
                'active_students' => ['value' => number_format($activeStudents), 'change' => '+' . $newStudentsToday . ' new today'],
                'course_progress' => ['value' => $avgCompletionRate . '%', 'change' => 'Avg. completion rate'],
                'active_courses' => ['value' => $activeCourses, 'change' => $pendingReviews . ' pending review'],
            ],
            'revenue_trends' => $revenueTrends,
            'recent_activity' => Enrollment::with(['student', 'course'])->latest()->take(5)->get()->map(fn($e) => [
                'id' => $e->id, 'user' => $e->student->full_name, 'action' => 'enrolled in', 'target' => $e->course->title, 'time' => $e->created_at->diffForHumans(), 'type' => 'enrollment'
            ]),
            'initial_notifications' => Notification::where('user_id', $user->id)->latest()->take(10)->get(),
        ]);
    }

    private function studentDashboard()
    {
        $user = auth()->user();

        // Stats for Main Dashboard (Learning Focus - Image 1)
        $lessonsFinished = LessonProgress::whereHas('enrollment', fn($q) => $q->where('student_id', $user->id))->where('is_completed', true)->count();
        
        $enrolledCategories = $user->enrollments()->with('course.category')->get()
            ->groupBy('course.category.name')
            ->map(fn($enrollments, $cat) => ['subject' => $cat, 'A' => $enrollments->count() * 5, 'fullMark' => 100])
            ->values();

        $defaultCategories = collect(['Code', 'Design', 'Business', 'Marketing', 'UI/UX'])->map(fn($cat) => 
            $enrolledCategories->firstWhere('subject', $cat) ?: ['subject' => $cat, 'A' => 0, 'fullMark' => 100]
        );

        // --- START ACHIEVEMENT LOGIC ---
        $enrollmentCount = Enrollment::where('student_id', $user->id)->count();
        $completedCourses = Enrollment::where('student_id', $user->id)->where('status', 'completed')->count();
        $certificateCount = Certificate::where('student_id', $user->id)->count();
        $perfectScoresCount = QuizAttempt::whereHas('enrollment', fn($q) => $q->where('student_id', $user->id))->where('score', 100)->count();
        $passedQuizzesCount = QuizAttempt::whereHas('enrollment', fn($q) => $q->where('student_id', $user->id))->where('is_passed', true)->distinct('quiz_id')->count();
        
        $achievements = [
            ['id' => 'first_enrollment', 'title' => 'First Step', 'icon' => '🎯', 'unlocked' => $enrollmentCount >= 1],
            ['id' => 'knowledge_seeker', 'title' => 'Knowledge Seeker', 'icon' => '📚', 'unlocked' => $enrollmentCount >= 10],
            ['id' => 'first_completion', 'title' => 'Graduate', 'icon' => '🎓', 'unlocked' => $completedCourses >= 1],
            ['id' => 'marathoner', 'title' => 'Marathoner', 'icon' => '🏆', 'unlocked' => $completedCourses >= 10],
            ['id' => 'high_flyer', 'title' => 'High Flyer', 'icon' => '📜', 'unlocked' => $certificateCount >= 5],
            ['id' => 'perfect_score', 'title' => 'Perfectionist', 'icon' => '💯', 'unlocked' => $perfectScoresCount >= 1],
            ['id' => 'quiz_guru', 'title' => 'Quiz Guru', 'icon' => '🧠', 'unlocked' => $passedQuizzesCount >= 10],
        ];

        $unlockedBadges = collect($achievements)->where('unlocked', true)->take(4)->values();
        // --- END ACHIEVEMENT LOGIC ---

        return Inertia::render('Dashboard', [
            'role' => 'student',
            'stats' => [
                'my_courses' => $user->enrollments()->count(),
                'lessons_finished' => number_format($lessonsFinished),
                'learning_time' => number_format($lessonsFinished * 20),
                'certificates' => $user->certificates()->count(),
                'courses_completed' => $user->enrollments()->where('status', 'completed')->count(),
                'quizzes_passed' => QuizAttempt::whereHas('enrollment', fn($q) => $q->where('student_id', $user->id))->where('is_passed', true)->count(),
            ],
            'strengths' => $enrolledCategories->count() >= 5 ? $enrolledCategories : $defaultCategories,
            'unlocked_badges' => $unlockedBadges,
            'initial_notifications' => Notification::where('user_id', $user->id)->latest()->take(10)->get(),
        ]);
    }

    public function studentStats()
    {
        $user = auth()->user();

        // Stats for Mentor Overview (Business Focus - Image 2)
        // If admin, they see platform-wide stats. If mentor, they see their own.
        $isAdmin = $user->hasRole('admin');
        
        if ($isAdmin) {
            $totalRevenue = Transaction::where('status', 'success')->sum('amount');
            $activeStudents = User::role('student')->count();
            $activeCourses = Course::where('status', 'published')->count();
            $pendingReviews = Course::where('status', 'draft')->count();
            
            $thisMonthRevenue = Transaction::where('status', 'success')->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->sum('amount');
            $lastMonthRevenue = Transaction::where('status', 'success')->whereMonth('created_at', now()->subMonth()->month)->whereYear('created_at', now()->subMonth()->year)->sum('amount');
            
            $newStudentsToday = User::role('student')->whereDate('created_at', today())->count();
            $avgCompletionRate = 13; // Placeholder for platform-wide avg
            
            $courseIds = Course::pluck('id'); // For trends
        } else {
            $courseIds = Course::where('mentor_id', $user->id)->pluck('id');
            $totalRevenue = Transaction::where('status', 'success')->whereIn('course_id', $courseIds)->sum('amount');
            $activeStudents = Enrollment::whereIn('course_id', $courseIds)->distinct('student_id')->count();
            $activeCourses = Course::where('mentor_id', $user->id)->where('status', 'published')->count();
            $pendingReviews = Course::where('mentor_id', $user->id)->where('status', 'draft')->count();
            
            $thisMonthRevenue = Transaction::where('status', 'success')->whereIn('course_id', $courseIds)->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->sum('amount');
            $lastMonthRevenue = Transaction::where('status', 'success')->whereIn('course_id', $courseIds)->whereMonth('created_at', now()->subMonth()->month)->whereYear('created_at', now()->subMonth()->year)->sum('amount');
            
            $newStudentsToday = Enrollment::whereIn('course_id', $courseIds)->whereDate('created_at', today())->count();
            
            // Avg Completion Rate for Mentor's Courses
            $enrollments = Enrollment::whereIn('course_id', $courseIds)->with('course.sections.lessons')->get();
            $completionRates = $enrollments->map(function ($enrollment) {
                $course = $enrollment->course;
                if (!$course) return 0;
                $totalLessons = $course->sections->flatMap->lessons->count();
                if ($totalLessons === 0) return 0;
                $completedLessons = $enrollment->lessonProgress()->where('is_completed', true)->count();
                return ($completedLessons / $totalLessons) * 100;
            });
            $avgCompletionRate = $completionRates->isEmpty() ? 0 : round($completionRates->avg());
        }

        $revenueChange = $lastMonthRevenue == 0 ? ($thisMonthRevenue > 0 ? 100 : 0) : round((($thisMonthRevenue / $lastMonthRevenue) - 1) * 100);

        // Revenue Trends (Last 7 days)
        $revenueTrends = collect(range(6, 0))->map(function ($daysAgo) use ($courseIds) {
            $date = now()->subDays($daysAgo);
            return [
                'name' => $date->format('M d'),
                'revenue' => (float) Transaction::where('status', 'success')->whereIn('course_id', $courseIds)->whereDate('created_at', $date)->sum('amount'),
            ];
        });

        // Filter activity
        $recentActivityQuery = $isAdmin 
            ? Enrollment::with(['student', 'course']) 
            : Enrollment::whereIn('course_id', $courseIds)->with(['student', 'course']);

        return Inertia::render('Dashboard/MentorStats', [
            'stats' => [
                'total_revenue' => ['value' => 'IDR ' . number_format($totalRevenue, 0, ',', '.'), 'change' => ($revenueChange >= 0 ? '+' : '') . $revenueChange . '% vs last mo'],
                'active_students' => ['value' => number_format($activeStudents), 'change' => '+' . $newStudentsToday . ' new today'],
                'course_progress' => ['value' => $avgCompletionRate . '%', 'change' => 'Avg. completion rate'],
                'active_courses' => ['value' => $activeCourses, 'change' => $pendingReviews . ' pending review'],
            ],
            'revenue_trends' => $revenueTrends,
            'recent_activity' => $recentActivityQuery->latest()->take(5)->get()->map(fn($e) => [
                'id' => $e->id, 'user' => $e->student->full_name, 'action' => 'enrolled in', 'target' => $e->course->title, 'time' => $e->created_at->diffForHumans(), 'type' => 'enrollment'
            ]),
        ]);
    }

    public function learningProgress()
    {
        $user = auth()->user();
        
        // 1. Course Progress Cards
        $enrollments = Enrollment::where('student_id', $user->id)
            ->with(['course.sections.lessons', 'course.category'])
            ->get()
            ->map(function($e) {
                $total = $e->course->sections->flatMap->lessons->count();
                $completed = $e->lessonProgress()->where('is_completed', true)->count();
                return [
                    'id' => $e->id,
                    'course_title' => $e->course->title,
                    'category' => $e->course->category->name,
                    'thumbnail' => $e->course->thumbnail,
                    'progress' => $total > 0 ? round(($completed / $total) * 100) : 0,
                    'completed_lessons' => $completed,
                    'total_lessons' => $total,
                    'status' => $e->status,
                    'updated_at' => $e->updated_at->diffForHumans(),
                ];
            });

        // 2. Chart Data (Reuse logic from studentDashboard)
        $userCategories = DB::table('enrollments')
            ->join('courses', 'enrollments.course_id', '=', 'courses.id')
            ->join('categories', 'courses.category_id', '=', 'categories.id')
            ->where('enrollments.student_id', $user->id)
            ->distinct()
            ->pluck('categories.name')
            ->toArray();

        $topicsTrends = collect(range(6, 0))->map(function ($daysAgo) use ($user, $userCategories) {
            $date = now()->subDays($daysAgo);
            $activity = DB::table('lesson_progress')
                ->join('enrollments', 'lesson_progress.enrollment_id', '=', 'enrollments.id')
                ->join('courses', 'enrollments.course_id', '=', 'courses.id')
                ->join('categories', 'courses.category_id', '=', 'categories.id')
                ->where('enrollments.student_id', $user->id)
                ->where('lesson_progress.is_completed', true)
                ->whereDate('lesson_progress.completed_at', $date)
                ->select('categories.name as topic', DB::raw('count(*) as count'))
                ->groupBy('categories.name')
                ->get();

            $result = ['name' => $date->format('d M')];
            foreach ($userCategories as $catName) { $result[$catName] = 0; }
            foreach ($activity as $act) { $result[$act->topic] = $act->count; }
            return $result;
        });

        $watchTimeTrends = collect(range(6, 0))->map(function ($daysAgo) use ($user) {
            $date = now()->subDays($daysAgo);
            
            $minutes = DB::table('lesson_progress')
                ->join('lessons', 'lesson_progress.lesson_id', '=', 'lessons.id')
                ->join('enrollments', 'lesson_progress.enrollment_id', '=', 'enrollments.id')
                ->where('enrollments.student_id', $user->id)
                ->where('lesson_progress.is_completed', true)
                ->whereDate('lesson_progress.completed_at', $date)
                ->sum('lessons.duration_minutes');

            return [
                'name' => $date->format('d M'),
                'minutes' => (int) $minutes,
            ];
        });

        return Inertia::render('Dashboard/LearningProgress', [
            'enrollments' => $enrollments,
            'topics_trends' => $topicsTrends,
            'watch_time_trends' => $watchTimeTrends,
        ]);
    }

    public function markAllRead()
    {
        Notification::where('user_id', auth()->id())->where('is_read', false)->update(['is_read' => true]);
        return back();
    }

    public function activityLog(Request $request)
    {
        $user = auth()->user();
        return Inertia::render('Dashboard/ActivityLog', [
            'activities' => Notification::where('user_id', $user->id)->latest()->paginate(15),
            'summary' => [
                'total_events' => Notification::where('user_id', $user->id)->count(),
                'user_actions' => Notification::where('user_id', $user->id)->whereIn('type', ['success', 'info'])->count(),
                'security_alerts' => 0, 'config_changes' => 0,
            ],
        ]);
    }
}
