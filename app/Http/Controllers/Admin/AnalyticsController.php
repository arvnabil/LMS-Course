<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Modules\Course\Models\Course;
use Modules\Course\Models\Enrollment;
use Modules\Payment\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function index()
    {
        // Overall stats
        $stats = [
            'total_users' => User::count(),
            'total_courses' => Course::count(),
            'total_enrollments' => Enrollment::count(),
            'total_revenue' => Transaction::where('status', 'success')->sum('amount'),
            'students' => User::where('role', 'student')->count(),
            'mentors' => User::where('role', 'mentor')->count(),
            'published_courses' => Course::where('status', 'published')->count(),
        ];

        // Enrollment trend (last 12 months)
        $enrollmentTrend = Enrollment::select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw('COUNT(*) as count')
            )
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Revenue trend (last 12 months)
        $revenueTrend = Transaction::select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw('SUM(amount) as total')
            )
            ->where('status', 'success')
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Top courses by enrollment
        $topCourses = Course::withCount('enrollments')
            ->orderByDesc('enrollments_count')
            ->limit(5)
            ->get(['id', 'title', 'slug']);

        // Category distribution
        $categoryDistribution = Course::select('category_id', DB::raw('COUNT(*) as count'))
            ->with('category:id,name')
            ->groupBy('category_id')
            ->get();

        return Inertia::render('Admin/Analytics', [
            'stats' => $stats,
            'enrollmentTrend' => $enrollmentTrend,
            'revenueTrend' => $revenueTrend,
            'topCourses' => $topCourses,
            'categoryDistribution' => $categoryDistribution,
        ]);
    }
}
