<?php

namespace Modules\Course\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Modules\Course\Models\Course;
use Modules\Course\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = Course::with(['mentor', 'category'])
            ->withCount('enrollments');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $courses = $query->latest()->paginate(15)->withQueryString();
        $categories = Category::all(['id', 'name']);

        return Inertia::render('Admin/Courses', [
            'courses' => $courses,
            'categories' => $categories,
            'filters' => $request->only(['status', 'category_id', 'search']),
        ]);
    }

    public function updateStatus(Request $request, Course $course)
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,published,archived,closed',
        ]);

        $course->update(['status' => $validated['status']]);

        return back()->with('success', 'Course status updated.');
    }

    public function toggleFeatured(Course $course)
    {
        $course->update(['is_featured' => !$course->is_featured]);

        return back()->with('success', 'Course featured status toggled.');
    }
}
