<?php

namespace App\Http\Controllers\Mentor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $mentorId = auth()->id();

        // Get all courses by this mentor
        $courses = Course::where('mentor_id', $mentorId)
            ->select('id', 'title')
            ->get();

        $query = Enrollment::with(['student', 'course', 'lessonProgress'])
            ->whereHas('course', fn($q) => $q->where('mentor_id', $mentorId));

        if ($request->filled('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('student', fn($q) => $q->where('full_name', 'like', "%{$search}%"));
        }

        $enrollments = $query->latest()->paginate(15)->withQueryString();

        // Add progress info to each enrollment
        $enrollments->getCollection()->transform(function ($enrollment) {
            $totalLessons = $enrollment->course->sections()
                ->withCount('lessons')
                ->get()
                ->sum('lessons_count');

            $completedLessons = $enrollment->lessonProgress
                ->where('is_completed', true)
                ->count();

            $enrollment->progress = $totalLessons > 0
                ? round(($completedLessons / $totalLessons) * 100)
                : 0;
            $enrollment->total_lessons = $totalLessons;
            $enrollment->completed_lessons = $completedLessons;

            return $enrollment;
        });

        return Inertia::render('Mentor/Students', [
            'enrollments' => $enrollments,
            'courses' => $courses,
            'filters' => $request->only(['course_id', 'search']),
        ]);
    }
}
