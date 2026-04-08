<?php

namespace App\Http\Controllers\Mentor;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class CourseBuilderController extends Controller
{
    /**
     * Display a listing of the mentor's courses.
     */
    public function index()
    {
        $courses = Course::where('mentor_id', auth()->id())
            ->with(['category', 'sections.lessons'])
            ->latest()
            ->get();

        return Inertia::render('Mentor/CourseBuilder/Index', [
            'courses' => $courses,
        ]);
    }

    /**
     * Show the form for creating a new course.
     */
    public function create()
    {
        $categories = Category::all(['id', 'name']);

        return Inertia::render('Mentor/CourseBuilder/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created course in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'level' => 'required|in:beginner,intermediate,advanced',
            'price' => 'required|numeric|min:0',
            'description' => 'required|string',
            'tagline' => 'nullable|string|max:255',
            'thumbnail' => 'nullable|image|max:2048',
        ]);

        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('courses/thumbnails', 'public');
            $thumbnailPath = '/storage/' . $path;
        }

        $course = Course::create([
            ...$validated,
            'mentor_id' => auth()->id(),
            'slug' => Str::slug($validated['title']) . '-' . Str::random(5),
            'status' => 'draft',
            'thumbnail' => $thumbnailPath,
        ]);

        return redirect()->route('mentor.courses.edit', $course->id)
            ->with('success', 'Course basic info saved. Now add sections and lessons.');
    }

    /**
     * Show the form for editing the specified course.
     */
    /**
     * Update the specified course in storage.
     */
    public function update(Request $request, Course $course)
    {
        if ($course->mentor_id !== auth()->id()) abort(403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'level' => 'required|in:beginner,intermediate,advanced',
            'price' => 'required|numeric|min:0',
            'description' => 'required|string',
            'tagline' => 'nullable|string|max:255',
            'status' => 'required|in:draft,published,archived',
            'thumbnail' => 'nullable|image|max:2048',
            'cover_image' => 'nullable|image|max:5120',
        ]);

        $updateData = $validated;
        unset($updateData['thumbnail']);
        unset($updateData['cover_image']);

        // Handle Thumbnail
        if ($request->hasFile('thumbnail')) {
            if ($course->thumbnail) {
                $oldPath = str_replace('/storage/', '', $course->thumbnail);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('thumbnail')->store('courses/thumbnails', 'public');
            $updateData['thumbnail'] = '/storage/' . $path;
        }

        // Handle Cover Image
        if ($request->hasFile('cover_image')) {
            if ($course->cover_image) {
                $oldPath = str_replace('/storage/', '', $course->cover_image);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('cover_image')->store('courses/covers', 'public');
            $updateData['cover_image'] = '/storage/' . $path;
        }

        // Only update slug if title changed
        if ($course->title !== $validated['title']) {
            $updateData['slug'] = Str::slug($validated['title']) . '-' . Str::random(5);
        }

        $course->update($updateData);

        return back()->with('success', 'Course updated successfully.');
    }

    /**
     * Remove the specified course from storage.
     */
    public function destroy(Course $course)
    {
        if ($course->mentor_id !== auth()->id()) abort(403);

        $course->delete();

        return redirect()->route('mentor.courses.index')->with('success', 'Course deleted.');
    }

    public function edit(Course $course)
    {
        // Ensure mentor owns the course
        if ($course->mentor_id !== auth()->id()) {
            abort(403);
        }

        $course->load(['sections.lessons', 'sections.quizzes']);
        $categories = Category::all(['id', 'name']);

        return Inertia::render('Mentor/CourseBuilder/Edit', [
            'course' => $course,
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created section in storage.
     */
    public function storeSection(Request $request, Course $course)
    {
        if ($course->mentor_id !== auth()->id()) abort(403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $course->sections()->create([
            'title' => $validated['title'],
            'order' => $course->sections()->count() + 1,
        ]);

        return back()->with('success', 'Section added successfully.');
    }

    /**
     * Update the specified section in storage.
     */
    public function updateSection(Request $request, \App\Models\Section $section)
    {
        if ($section->course->mentor_id !== auth()->id()) abort(403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $section->update($validated);

        return back()->with('success', 'Section updated successfully.');
    }

    /**
     * Remove the specified section from storage.
     */
    public function destroySection(\App\Models\Section $section)
    {
        if ($section->course->mentor_id !== auth()->id()) abort(403);

        $section->delete();

        return back()->with('success', 'Section deleted.');
    }

    /**
     * Store a newly created lesson in storage.
     */
    public function storeLesson(Request $request, \App\Models\Section $section)
    {
        if ($section->course->mentor_id !== auth()->id()) abort(403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:video,article',
        ]);

        $section->lessons()->create([
            'title' => $validated['title'],
            'type' => $validated['type'],
            'order' => $section->lessons()->count() + 1,
        ]);

        return back()->with('success', 'Lesson added successfully.');
    }

    /**
     * Remove the specified lesson from storage.
     */
    public function destroyLesson(\App\Models\Lesson $lesson)
    {
        if ($lesson->section->course->mentor_id !== auth()->id()) abort(403);

        $lesson->delete();

        return back()->with('success', 'Lesson deleted.');
    }

    /**
     * Store a newly created quiz in storage.
     */
    public function storeQuiz(Request $request, \App\Models\Section $section)
    {
        if ($section->course->mentor_id !== auth()->id()) abort(403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:multiple_choice,submission',
        ]);

        $section->quizzes()->create([
            'course_id' => $section->course_id,
            'title' => $validated['title'],
            'type' => $validated['type'],
            'order' => $section->quizzes()->count() + 1,
        ]);

        return back()->with('success', 'Quiz added successfully.');
    }

    /**
     * Update the specified quiz in storage.
     */
    public function updateQuiz(Request $request, \App\Models\Quiz $quiz)
    {
        if ($quiz->course->mentor_id !== auth()->id()) abort(403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:multiple_choice,submission',
            'description' => 'nullable|string',
            'passing_score' => 'nullable|integer|min:0|max:100',
        ]);

        $quiz->update($validated);

        return back()->with('success', 'Quiz updated successfully.');
    }

    /**
     * Remove the specified quiz from storage.
     */
    public function destroyQuiz(\App\Models\Quiz $quiz)
    {
        if ($quiz->course->mentor_id !== auth()->id()) abort(403);

        $quiz->delete();

        return back()->with('success', 'Quiz deleted.');
    }

    /**
     * Edit lesson content.
     */
    public function editLesson(\App\Models\Lesson $lesson)
    {
        if ($lesson->section->course->mentor_id !== auth()->id()) abort(403);

        return Inertia::render('Mentor/CourseBuilder/LessonEditor', [
            'lesson' => $lesson->load('section.course'),
        ]);
    }

    /**
     * Update lesson content.
     */
    public function updateLesson(Request $request, \App\Models\Lesson $lesson)
    {
        if ($lesson->section->course->mentor_id !== auth()->id()) abort(403);

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'video_url' => 'nullable|url',
            'video_source' => 'nullable|in:youtube,onedrive_upload,onedrive_library,onedrive_shared_link',
            'video_id' => 'nullable|string',
            'duration_minutes' => 'nullable|integer',
            'thumbnail' => 'nullable|image|max:2048',
            'is_preview' => 'nullable|boolean',
        ]);

        $updateData = array_filter($validated, fn($v) => !is_null($v));

        \Illuminate\Support\Facades\Log::info('Lesson update payload', [
            'request' => $request->all(),
            'validated' => $validated,
            'updateData' => $updateData
        ]);

        // Logic check: if video_url is provided but no source, default to youtube
        if (isset($updateData['video_url']) && !isset($updateData['video_source'])) {
            $updateData['video_source'] = 'youtube';
        }
        
        if ($request->hasFile('thumbnail')) {
            if ($lesson->thumbnail) {
                $oldPath = str_replace('/storage/', '', $lesson->thumbnail);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('thumbnail')->store('lessons/thumbnails', 'public');
            $updateData['thumbnail'] = '/storage/' . $path;
        }

        $lesson->update($updateData);

        return back()->with('success', 'Lesson updated.');
    }

    public function toggleLessonPreview(\App\Models\Lesson $lesson)
    {
        if ($lesson->section->course->mentor_id !== auth()->id()) abort(403);

        $lesson->update([
            'is_preview' => !$lesson->is_preview
        ]);

        return back()->with('success', 'Lesson preview status updated.');
    }

    public function uploadLessonVideo(Request $request, \App\Models\Lesson $lesson)
    {
        if ($lesson->section->course->mentor_id !== auth()->id()) abort(403);

        $request->validate([
            'video' => 'required|file|max:512000', // 500MB max
        ]);

        $file = $request->file('video');
        $oneDrive = new \App\Services\OneDriveService();
        
        // Use course slug as folder name
        $folder = $lesson->section->course->slug;
        $filename = Str::slug($lesson->title) . '-' . time() . '.' . $file->getClientOriginalExtension();
        
        $result = $oneDrive->uploadLargeFile($file->getRealPath(), $filename, $folder);

        if ($result && isset($result['id'])) {
            $lesson->update([
                'video_source' => 'onedrive_upload',
                'video_id' => $result['id'],
                'video_url' => null, // Clear youtube URL if it existed
            ]);

            return back()->with('success', 'Video uploaded to OneDrive successfully.');
        }

        return back()->withErrors(['video' => 'Failed to upload video to OneDrive.']);
    }

    /**
     * Edit quiz questions.
     */
    public function editQuiz(\App\Models\Quiz $quiz)
    {
        if ($quiz->course->mentor_id !== auth()->id()) abort(403);

        return Inertia::render('Mentor/CourseBuilder/QuizEditor', [
            'quiz' => $quiz->load(['questions.options', 'course']),
        ]);
    }

    /**
     * Store a newly created question in storage.
     */
    public function storeQuestion(Request $request, \App\Models\Quiz $quiz)
    {
        if ($quiz->course->mentor_id !== auth()->id()) abort(403);

        $validated = $request->validate([
            'question' => 'required|string',
        ]);

        $quiz->questions()->create([
            'question' => $validated['question'],
            'order' => $quiz->questions()->count() + 1,
        ]);

        return back()->with('success', 'Question added successfully.');
    }

    /**
     * Update the specified question.
     */
    public function updateQuestion(Request $request, \App\Models\QuizQuestion $question)
    {
        if ($question->quiz->course->mentor_id !== auth()->id()) abort(403);

        $validated = $request->validate([
            'question' => 'required|string',
        ]);

        $question->update([
            'question' => $validated['question'],
        ]);

        return back()->with('success', 'Question updated successfully.');
    }

    /**
     * Delete the specified question.
     */
    public function deleteQuestion(\App\Models\QuizQuestion $question)
    {
        if ($question->quiz->course->mentor_id !== auth()->id()) abort(403);

        $question->delete();

        return back()->with('success', 'Question deleted successfully.');
    }

    /**
     * Store a newly created option for a question.
     */
    public function storeOption(Request $request, \App\Models\QuizQuestion $question)
    {
        if ($question->quiz->course->mentor_id !== auth()->id()) abort(403);

        $validated = $request->validate([
            'option_text' => 'required|string',
            'is_correct' => 'required|boolean',
        ]);

        $question->options()->create($validated);

        return back()->with('success', 'Option added successfully.');
    }

    /**
     * Update the specified option.
     */
    public function updateOption(Request $request, \App\Models\QuizOption $option)
    {
        if ($option->question->quiz->course->mentor_id !== auth()->id()) abort(403);

        $validated = $request->validate([
            'option_text' => 'required|string',
            'is_correct' => 'required|boolean',
        ]);

        $option->update($validated);

        return back()->with('success', 'Option updated successfully.');
    }

    /**
     * Remove the specified option from storage.
     */
    public function destroyOption(\App\Models\QuizOption $option)
    {
        if ($option->question->quiz->course->mentor_id !== auth()->id()) abort(403);

        $option->delete();

        return back()->with('success', 'Option deleted.');
    }

    /**
     * Edit course certificate template.
     */
    public function editCertificateTemplate(Course $course)
    {
        if ($course->mentor_id !== auth()->id()) abort(403);

        $template = $course->certificateTemplate;

        if (!$template) {
            // Default layout parameters for a new template
            $defaultLayout = [
                'student_name' => ['x' => 50, 'y' => 50, 'fontSize' => 36, 'color' => '#000000', 'align' => 'center', 'fontFamily' => 'sans-serif', 'fontWeight' => 'bold'],
                'course_title' => ['x' => 50, 'y' => 60, 'fontSize' => 24, 'color' => '#4b5563', 'align' => 'center', 'fontFamily' => 'sans-serif', 'fontWeight' => 'normal'],
                'date' => ['x' => 50, 'y' => 70, 'fontSize' => 16, 'color' => '#6b7280', 'align' => 'center', 'fontFamily' => 'sans-serif', 'fontWeight' => 'normal'],
                'certificate_code' => ['x' => 50, 'y' => 80, 'fontSize' => 12, 'color' => '#9ca3af', 'align' => 'center', 'fontFamily' => 'monospace', 'fontWeight' => 'normal'],
            ];

            $template = [
                'id' => null,
                'course_id' => $course->id,
                'background_image' => null,
                'layout_data' => $defaultLayout,
            ];
        }

        return Inertia::render('Admin/CertificateDesigner', [
            'template' => $template,
            'course' => $course,
        ]);
    }

    /**
     * Update course certificate template.
     */
    public function updateCertificateTemplate(Request $request, Course $course)
    {
        if ($course->mentor_id !== auth()->id()) abort(403);

        $validated = $request->validate([
            'background_image' => 'nullable|image|max:10240',
            'layout_data' => 'required|string',
        ]);

        $template = $course->certificateTemplate;
        $imagePath = $template ? $template->background_image : null;

        if ($request->hasFile('background_image')) {
            // Delete old image if exists
            if ($template && $template->background_image) {
                $oldPath = str_replace('/storage/', '', $template->background_image);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('background_image')->store('certificates/templates', 'public');
            $imagePath = '/storage/' . $path;
        }

        if (!$imagePath) {
            return back()->withErrors(['background_image' => 'A background image is required.']);
        }

        $layoutData = json_decode($validated['layout_data'], true);

        if ($template) {
            $template->update([
                'background_image' => $imagePath,
                'layout_data' => $layoutData,
            ]);
        } else {
            $course->certificateTemplate()->create([
                'background_image' => $imagePath,
                'layout_data' => $layoutData,
            ]);
        }

        return redirect()->route('mentor.courses.edit', $course->id)->with('success', 'Certificate template updated.');
    }
}
