<?php

namespace Modules\Course\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\Course\Models\Category;
use Modules\Course\Models\Course;
use Modules\Course\Models\Enrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CatalogController extends Controller
{
    /**
     * Display the course catalog.
     */
    public function index(Request $request)
    {
        $query = Course::query()
            ->with(['category', 'mentor'])
            ->where('status', 'published');

        // Search filter
        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%')
                ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        // Category filter
        if ($request->has('category')) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Level filter
        if ($request->has('levels')) {
            $query->whereIn('level', $request->levels);
        }

        $courses = $query->latest()->paginate(12)->withQueryString();
        $categories = Category::all(['id', 'name', 'slug']);

        // Inject organization pricing data for authenticated users
        if (auth()->check()) {
            $orgService = app(\Modules\Organization\Services\OrganizationService::class);
            $user = auth()->user();
            $courses->getCollection()->transform(function ($course) use ($user, $orgService) {
                $pricing = $orgService->getEffectivePrice($user, $course);
                $course->effective_price = $pricing['final_price'];
                $course->is_org_sponsored = $pricing['is_org_sponsored'];
                $course->org_name = $pricing['org_name'];
                return $course;
            });
        }

        $isDashboard = $request->route()->named('student.*');

        return Inertia::render('Catalog', [
            'courses' => $courses,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'levels']),
            'isDashboard' => $isDashboard,
            'basePath' => $isDashboard ? route('student.catalog.dashboard') : route('catalog.public'),
            'detailRouteName' => $isDashboard ? 'student.courses.dashboard.show' : 'courses.public.show',
        ]);
    }

    /**
     * Show course details for guest or checkout.
     */
    public function show(Course $course)
    {
        $course->load(['category', 'mentor', 'sections.lessons', 'sections.quizzes']);
        
        $isDashboard = request()->route()->named('student.*');

        $isEnrolled = false;
        $enrollment = null;
        $orgPricing = null;
        if (auth()->check()) {
            $enrollment = Enrollment::where('student_id', auth()->id())
                ->where('course_id', $course->id)
                ->with(['lessonProgress', 'quizAttempts', 'submissions'])
                ->first();
            $isEnrolled = (bool)$enrollment;

            // Get organization pricing
            $orgService = app(\Modules\Organization\Services\OrganizationService::class);
            $orgPricing = $orgService->getEffectivePrice(auth()->user(), $course);
        }

        return Inertia::render('CourseDetail', [
            'course' => $course,
            'isEnrolled' => $isEnrolled,
            'enrollment' => $enrollment,
            'orgPricing' => $orgPricing,
            'isDashboard' => $isDashboard,
            'basePath' => $isDashboard ? route('student.catalog.dashboard') : route('catalog.public'),
            'detailRouteName' => $isDashboard ? 'student.courses.dashboard.show' : 'courses.public.show',
        ]);
    }
}
