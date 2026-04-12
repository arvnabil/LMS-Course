<?php

namespace Modules\Course\Http\Controllers\Mentor;

use App\Http\Controllers\Controller;
use Modules\Course\Models\Category;
use Modules\Course\Models\Course;
use Modules\Course\Models\Section;
use Modules\Course\Models\Lesson;
use Modules\Quiz\Models\Quiz;
use Modules\Quiz\Models\QuizQuestion;
use Modules\Quiz\Models\QuizOption;
use Modules\Certificate\Models\CertificateTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use App\Models\OneDrivePermission;
use App\Services\FileStorageService;
use App\Services\OneDriveService;

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
            $thumbnailPath = FileStorageService::store($request->file('thumbnail'), 'courses/thumbnails');
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
     * Update the specified course in storage.
     */
    public function update(Request $request, Course $course)
    {
        if ($course->mentor_id != auth()->id()) abort(403);

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
            FileStorageService::delete($course->thumbnail);
            $updateData['thumbnail'] = FileStorageService::store($request->file('thumbnail'), 'courses/thumbnails');
        }

        // Handle Cover Image
        if ($request->hasFile('cover_image')) {
            FileStorageService::delete($course->cover_image);
            $updateData['cover_image'] = FileStorageService::store($request->file('cover_image'), 'courses/covers');
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
        if ($course->mentor_id != auth()->id()) abort(403);

        $course->delete();

        return redirect()->route('mentor.courses.index')->with('success', 'Course deleted.');
    }

    public function edit(Course $course)
    {
        // Ensure mentor owns the course or user is an admin
        if ($course->mentor_id != auth()->id()) {
            abort(403);
        }

        $course->load(['sections.lessons', 'sections.quizzes']);
        $categories = Category::all(['id', 'name']);

        return Inertia::render('Mentor/CourseBuilder/Edit', [
            'course' => $course,
            'categories' => $categories,
            'onedrive_permissions' => OneDrivePermission::where('user_id', auth()->id())->first() ?? [
                'can_use_shared_link' => false,
                'can_upload' => false,
                'can_use_library' => false,
            ],
        ]);
    }

    /**
     * Store a newly created section in storage.
     */
    public function storeSection(Request $request, Course $course)
    {
        if ($course->mentor_id != auth()->id()) abort(403);

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
    public function updateSection(Request $request, Section $section)
    {
        if ($section->course->mentor_id != auth()->id()) abort(403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $section->update($validated);

        return back()->with('success', 'Section updated successfully.');
    }

    /**
     * Remove the specified section from storage.
     */
    public function destroySection(Section $section)
    {
        if ($section->course->mentor_id != auth()->id()) abort(403);

        $section->delete();

        return back()->with('success', 'Section deleted.');
    }

    /**
     * Store a newly created lesson in storage.
     */
    public function storeLesson(Request $request, Section $section)
    {
        if ($section->course->mentor_id != auth()->id()) abort(403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:video,article,file',
            'video_source' => 'nullable|string',
            'file_source' => 'nullable|string',
        ]);

        $videoSource = $validated['video_source'] ?? null;
        if (empty($videoSource)) {
            $videoSource = 'youtube'; // Default for db to pass constraint
        }
        
        $fileSource = $validated['file_source'] ?? null;
        if (empty($fileSource) && $validated['type'] === 'file') {
            $fileSource = 'onedrive_shared_link';
        }

        $lesson = $section->lessons()->create([
            'title' => $validated['title'],
            'type' => $validated['type'],
            'video_source' => $videoSource,
            'file_source' => $fileSource,
            'order' => $section->lessons()->count() + 1,
        ]);

        \Illuminate\Support\Facades\Log::info("Module Lesson Created", [
            'id' => $lesson->id,
            'type' => $lesson->type,
            'video_source' => $lesson->video_source,
            'file_source' => $lesson->file_source,
        ]);

        return back()->with('success', 'Lesson added successfully.');
    }

    /**
     * Remove the specified lesson from storage.
     */
    public function destroyLesson(Lesson $lesson)
    {
        if ($lesson->section->course->mentor_id != auth()->id()) abort(403);

        $lesson->delete();

        return back()->with('success', 'Lesson deleted.');
    }

    /**
     * Store a newly created quiz in storage.
     */
    public function storeQuiz(Request $request, Section $section)
    {
        if ($section->course->mentor_id != auth()->id()) abort(403);

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
    public function updateQuiz(Request $request, Quiz $quiz)
    {
        if ($quiz->course->mentor_id != auth()->id()) abort(403);

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
    public function destroyQuiz(Quiz $quiz)
    {
        if ($quiz->course->mentor_id != auth()->id()) abort(403);

        $quiz->delete();

        return back()->with('success', 'Quiz deleted.');
    }

    /**
     * Edit lesson content.
     */
    public function editLesson(Lesson $lesson)
    {
        if ($lesson->section->course->mentor_id != auth()->id()) abort(403);

        $initialFolderId = 'root';
        
        // Pick any ID that belongs to OneDrive, regardless of source type (upload or library)
        $selectedId = null;
        if (str_starts_with($lesson->video_source, 'onedrive_')) {
            $selectedId = $lesson->video_id;
        } elseif (str_starts_with($lesson->file_source, 'onedrive_')) {
            $selectedId = $lesson->file_id;
        }
        
        if ($selectedId && $selectedId !== 'PROCESSING') {
            try {
                $oneDrive = new OneDriveService();
                $initialFolderId = $oneDrive->getParentFolderId($selectedId) ?? 'root';
            } catch (\Exception $e) {
                \Log::error("Failed to resolve initial folder for OneDrive Browser: " . $e->getMessage());
            }
        }

        return Inertia::render('Mentor/CourseBuilder/LessonEditor', [
            'lesson' => $lesson->load('section.course'),
            'initial_folder_id' => $initialFolderId,
            'onedrive_permissions' => OneDrivePermission::where('user_id', auth()->id())->first() ?? [
                'can_use_shared_link' => false,
                'can_upload' => false,
                'can_use_library' => false,
            ],
        ]);
    }

    /**
     * Update lesson content.
     */
    public function updateLesson(Request $request, Lesson $lesson)
    {
        if ($lesson->section->course->mentor_id != auth()->id()) abort(403);

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'video_url' => 'nullable|string',
            'video_source' => 'nullable|string',
            'video_id' => 'nullable|string',
            'duration_minutes' => 'nullable|integer',
            'thumbnail' => 'nullable|image|max:2048',
            'file_url' => 'nullable|string',
            'file_source' => 'nullable|string',
            'file_id' => 'nullable|string',
            'file_name' => 'nullable|string|max:255',
            'mime_type' => 'nullable|string|max:100',
        ]);

        $updateData = array_filter($validated, fn($v) => !is_null($v));

        // Cleanup conflicting video data
        if (isset($validated['video_source']) && !empty($validated['video_source'])) {
            if ($validated['video_source'] !== 'youtube') {
                $updateData['video_url'] = null;
            } else {
                $updateData['video_id'] = null;
            }
        }

        // Cleanup conflicting file data
        if (isset($validated['file_source']) && !empty($validated['file_source'])) {
            if ($validated['file_source'] === 'onedrive_shared_link') {
                $updateData['file_id'] = null;
            } else {
                $updateData['file_url'] = null;
            }
        }

        if ($request->hasFile('thumbnail')) {
            FileStorageService::delete($lesson->thumbnail);
            $updateData['thumbnail'] = FileStorageService::store($request->file('thumbnail'), 'lessons/thumbnails');
        }

        // Explicitly handle video_source to prevent it being lost if empty/falsey
        if ($request->has('video_source')) {
            $lesson->video_source = $request->video_source;
        }

        // Handle file source fields
        if ($request->has('file_source')) {
            $lesson->file_source = $request->file_source;
        }
        if ($request->has('file_id')) {
            $lesson->file_id = $request->file_id;
        }
        if ($request->has('file_url')) {
            $lesson->file_url = $request->file_url;
        }

        $lesson->fill($updateData);
        $lesson->save();

        \Illuminate\Support\Facades\Log::info("Module Lesson Updated", [
            'id' => $lesson->id,
            'video_source' => $lesson->video_source,
            'file_source' => $lesson->file_source,
        ]);

        return back()->with('success', 'Lesson updated.');
    }

    public function toggleLessonPreview(Lesson $lesson)
    {
        if ($lesson->section->course->mentor_id != auth()->id()) abort(403);

        $lesson->is_preview = !$lesson->is_preview;
        $lesson->save();

        return back()->with('success', 'Lesson preview status updated.');
    }

    /**
     * Upload video to OneDrive.
     */
    public function uploadLessonVideo(Request $request, Lesson $lesson)
    {
        if ($lesson->section->course->mentor_id != auth()->id()) abort(403);

        try {
            // Logic to detect if file was lost due to server 'post_max_size' limit
            if ($request->isMethod('post') && empty($request->all()) && empty($request->file())) {
                return back()->withErrors(['video' => 'The file is too large for the server to process. Please increase post_max_size and upload_max_filesize in your hosting PHP settings.']);
            }

            $request->validate([
                'video' => 'required|file|mimetypes:video/mp4,video/mpeg,video/quicktime,video/x-msvideo|max:512000', // 500MB max
            ]);

            $file = $request->file('video');
            
            if (!$file->isValid()) {
                return back()->withErrors(['video' => 'Upload failed: ' . $file->getErrorMessage()]);
            }

            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $filename = \Illuminate\Support\Str::slug($lesson->title) . '-' . time() . '.' . $extension;
            $folderName = 'Course-' . \Illuminate\Support\Str::slug($lesson->section->course->title);

            // Save file to local storage (app/temp_videos)
            $tempPath = $file->storeAs('temp_videos', $filename, 'local');

            if (!$tempPath) {
                return back()->withErrors(['video' => 'Could not save temporary file to server. Check storage permissions.']);
            }

            // Mark as processing in DB to show UI loading state safely
            $lesson->video_source = 'onedrive_upload';
            $lesson->video_id = 'PROCESSING';
            $lesson->save();

            // Dispatch Background Job
            \Modules\Course\Jobs\UploadVideoToOneDrive::dispatch(
                $lesson->id,
                $tempPath,
                $filename,
                $folderName
            );

            \Illuminate\Support\Facades\Log::info("OneDrive Upload Job Dispatched", [
                'lesson_id' => $lesson->id,
                'temp_path' => $tempPath
            ]);

            return back()->with('success', 'Upload successful! Your video is being processed in the background and will appear on the lesson page in a few minutes.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("OneDrive Dispatch Error: " . $e->getMessage());
            return back()->withErrors(['video' => 'Server error: ' . $e->getMessage()]);
        }
    }

    /**
     * Upload file (PDF/TXT/Image) to OneDrive.
     */
    public function uploadLessonFile(Request $request, Lesson $lesson)
    {
        if ($lesson->section->course->mentor_id != auth()->id()) abort(403);

        try {
            if ($request->isMethod('post') && empty($request->all()) && empty($request->file())) {
                return back()->withErrors(['file' => 'The file is too large for the server to process. Please increase post_max_size and upload_max_filesize in your hosting PHP settings.']);
            }

            $request->validate([
                'file' => 'required|file|mimes:pdf,txt,jpg,jpeg,png,gif,webp|max:51200', // 50MB max
            ]);

            $file = $request->file('file');
            
            if (!$file->isValid()) {
                return back()->withErrors(['file' => 'Upload failed: ' . $file->getErrorMessage()]);
            }

            $extension = $file->getClientOriginalExtension();
            $filename = \Illuminate\Support\Str::slug($lesson->title) . '-' . time() . '.' . $extension;
            $folderName = 'Course-' . \Illuminate\Support\Str::slug($lesson->section->course->title) . '/files';

            $tempPath = $file->storeAs('temp_files', $filename, 'local');

            if (!$tempPath) {
                return back()->withErrors(['file' => 'Could not save temporary file to server. Check storage permissions.']);
            }

            // Mark as processing in DB to show UI loading state safely
            $lesson->file_source = 'onedrive_upload';
            $lesson->file_id = 'PROCESSING';
            $lesson->save();

            \Modules\Course\Jobs\UploadFileToOneDrive::dispatch(
                $lesson->id,
                $tempPath,
                $filename,
                $folderName,
                $file->getClientOriginalName(),
                $file->getMimeType()
            );

            \Illuminate\Support\Facades\Log::info("OneDrive File Upload Job Dispatched", [
                'lesson_id' => $lesson->id,
                'temp_path' => $tempPath
            ]);

            return back()->with('success', 'Upload successful! Your file is being processed in the background.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("OneDrive File Dispatch Error: " . $e->getMessage());
            return back()->withErrors(['file' => 'Server error: ' . $e->getMessage()]);
        }
    }

    /**
     * Edit quiz questions.
     */
    public function editQuiz(Quiz $quiz)
    {
        if ($quiz->course->mentor_id != auth()->id()) abort(403);

        return Inertia::render('Mentor/CourseBuilder/QuizEditor', [
            'quiz' => $quiz->load(['questions.options', 'course']),
        ]);
    }

    /**
     * Store a newly created question in storage.
     */
    public function storeQuestion(Request $request, Quiz $quiz)
    {
        if ($quiz->course->mentor_id != auth()->id()) abort(403);

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
    public function updateQuestion(Request $request, QuizQuestion $question)
    {
        if ($question->quiz->course->mentor_id != auth()->id()) abort(403);

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
    public function deleteQuestion(QuizQuestion $question)
    {
        if ($question->quiz->course->mentor_id != auth()->id()) abort(403);

        $question->delete();

        return back()->with('success', 'Question deleted successfully.');
    }

    /**
     * Store a newly created option for a question.
     */
    public function storeOption(Request $request, QuizQuestion $question)
    {
        if ($question->quiz->course->mentor_id != auth()->id()) abort(403);

        $validated = $request->validate([
            'option_text' => 'required|string',
            'is_correct' => 'required',
        ]);

        $question->options()->create([
            'option_text' => $validated['option_text'],
            'is_correct' => filter_var($request->is_correct, FILTER_VALIDATE_BOOLEAN)
        ]);

        return back()->with('success', 'Option added successfully.');
    }

    /**
     * Update the specified option.
     */
    public function updateOption(Request $request, QuizOption $option)
    {
        if ($option->question->quiz->course->mentor_id != auth()->id()) abort(403);

        $validated = $request->validate([
            'option_text' => 'required|string',
            'is_correct' => 'required',
        ]);

        $option->update([
            'option_text' => $validated['option_text'],
            'is_correct' => filter_var($request->is_correct, FILTER_VALIDATE_BOOLEAN)
        ]);

        return back()->with('success', 'Option updated successfully.');
    }

    /**
     * Remove the specified option from storage.
     */
    public function destroyOption(QuizOption $option)
    {
        if ($option->question->quiz->course->mentor_id != auth()->id()) abort(403);

        $option->delete();

        return back()->with('success', 'Option deleted.');
    }

    /**
     * Edit course certificate template.
     */
    public function editCertificateTemplate(Course $course)
    {
        if ($course->mentor_id != auth()->id()) abort(403);

        $template = $course->certificateTemplate;
        
        // Fetch other courses owned by this mentor that have a certificate template
        $otherTemplates = Course::where('mentor_id', auth()->id())
            ->where('id', '!=', $course->id)
            ->whereHas('certificateTemplate')
            ->with('certificateTemplate')
            ->get()
            ->map(function ($c) {
                $template = $c->certificateTemplate;
                if ($template && $template->background_image && !str_starts_with($template->background_image, '/storage/')) {
                    $template->background_image = route('onedrive.public.show', $template->background_image);
                }
                return [
                    'id' => $c->id,
                    'title' => $c->title,
                    'template' => $template
                ];
            });

        if (!$template) {
            // ... (rest of the default layout logic)
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
                'signature_image' => null,
                'layout_data' => $defaultLayout,
            ];
        }

        if ($template) {
            $templateModel = is_array($template) ? (object)$template : $template;
            // Resolve OneDrive IDs to proxy URLs for frontend preview
            if (isset($templateModel->background_image) && $templateModel->background_image && !str_starts_with($templateModel->background_image, '/storage/')) {
                if (is_array($template)) {
                    $template['background_image'] = route('onedrive.public.show', $template['background_image']);
                } else {
                    $template->background_image = route('onedrive.public.show', $template->background_image);
                }
            }
        }

        return Inertia::render('Admin/CertificateDesigner', [
            'template' => $template,
            'course' => $course,
            'other_templates' => $otherTemplates,
        ]);
    }

    public function updateCertificateTemplate(Request $request, Course $course)
    {
        if ($course->mentor_id != auth()->id()) abort(403);

        $validated = $request->validate([
            'background_image' => 'nullable',
            'signature_image' => 'nullable|image|max:5120',
            'layout_data' => 'required|string',
            'import_source_id' => 'nullable|exists:courses,id',
        ]);

        $template = $course->certificateTemplate;
        $imagePath = $template ? $template->background_image : null;
        $signaturePath = $template ? $template->signature_image : null;

        // Handle Import from another course
        if ($request->import_source_id && !$request->hasFile('background_image') && !$request->hasFile('signature_image')) {
            $sourceCourse = Course::find($request->import_source_id);
            if ($sourceCourse && $sourceCourse->mentor_id == auth()->id() && $sourceCourse->certificateTemplate) {
                $sourceTemplate = $sourceCourse->certificateTemplate;
                
                // If we are currently empty or user hasn't uploaded a NEW replacement, we copy from source
                if (!$request->hasFile('background_image')) {
                    $imagePath = $this->ensureFileCopy($sourceTemplate->background_image, 'certificates/templates');
                }
                if (!$request->hasFile('signature_image')) {
                    $signaturePath = $this->ensureFileCopy($sourceTemplate->signature_image, 'certificates/signatures');
                }
            }
        }

        if ($request->hasFile('background_image')) {
            FileStorageService::delete($imagePath);
            $imagePath = FileStorageService::store($request->file('background_image'), 'certificates/templates');
        } elseif ($request->filled('background_image')) {
            $imagePath = $request->background_image;
        }
    
        // Special case for Imports: if the imagePath is a full proxy URL, extract base
        if ($imagePath && str_contains($imagePath, '/storage/onedrive/')) {
            $imagePath = basename($imagePath);
        }

        if ($request->hasFile('signature_image')) {
            FileStorageService::delete($template ? $template->signature_image : null);
            $signaturePath = FileStorageService::store($request->file('signature_image'), 'certificates/signatures');
        }

        if (!$imagePath) {
            return back()->withErrors(['background_image' => 'A background image is required.']);
        }

        $layoutData = json_decode($validated['layout_data'], true);

        if ($template) {
            $template->update([
                'background_image' => $imagePath,
                'signature_image' => $signaturePath,
                'layout_data' => $layoutData,
            ]);
        } else {
            $course->certificateTemplate()->create([
                'background_image' => $imagePath,
                'signature_image' => $signaturePath,
                'layout_data' => $layoutData,
            ]);
        }

        return redirect()->route('mentor.courses.edit', $course->id)->with('success', 'Certificate template updated.');
    }

    /**
     * Safely copy a file in storage OR return the path if it's already a URL.
     */
    private function ensureFileCopy(?string $path, string $targetFolder)
    {
        if (!$path) return null;

        // OneDrive items are URLs, we just reuse the sharing URL
        if (str_starts_with($path, 'https://')) {
            return $path;
        }

        // Local storage copy
        $localPath = str_replace('/storage/', '', $path);
        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($localPath)) {
            $extension = pathinfo($localPath, PATHINFO_EXTENSION);
            $newPath = $targetFolder . '/' . \Illuminate\Support\Str::random(40) . '.' . $extension;
            
            \Illuminate\Support\Facades\Storage::disk('public')->copy($localPath, $newPath);
            return '/storage/' . $newPath;
        }

        return $path;
    }

    /**
     * Preview course certificate template.
     */
    public function previewCertificateTemplate(Course $course)
    {
        if ($course->mentor_id != auth()->id()) abort(403);

        $template = $course->certificateTemplate;
        if (!$template) {
            abort(404, 'Certificate template not found. Please save the template first.');
        }

        // Create dummy certificate in memory (not saved to DB)
        $dummyCertificate = new \Modules\Certificate\Models\Certificate([
            'certificate_code' => 'CERT-EXAMPLE-001',
            'issued_at' => now(),
        ]);
        
        // Mock relations
        $student = new \Illuminate\Foundation\Auth\User();
        $student->name = "John Doe (Example)";
        
        $dummyCertificate->setRelation('student', $student);
        $dummyCertificate->setRelation('course', $course);

        $layout = is_string($template->layout_data) ? json_decode($template->layout_data, true) : $template->layout_data;

        $bg_base64 = (new \Modules\Certificate\Services\CertificateService())->getImageBase64($template->background_image);

        $data = [
            'certificate' => $dummyCertificate,
            'template' => $template,
            'layout' => $layout,
            'bg_base64' => $bg_base64,
        ];

        // Generate PDF
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('certificate::pdf.certificate', $data)
            ->setPaper('a4', 'landscape')
            ->setWarnings(false);

        return $pdf->stream('preview-certificate.pdf');
    }

    /**
     * Reorder sections within a course.
     */
    public function reorderSections(Request $request, Course $course)
    {
        if ($course->mentor_id != auth()->id()) abort(403);

        $request->validate([
            'section_ids' => 'required|array',
            'section_ids.*' => 'exists:sections,id'
        ]);

        foreach ($request->section_ids as $index => $id) {
            Section::where('id', $id)
                ->where('course_id', $course->id)
                ->update(['order' => $index + 1]);
        }

        return back()->with('success', 'Sections reordered.');
    }

    /**
     * Reorder items (lessons/quizzes) within a section.
     */
    public function reorderItems(Request $request, Section $section)
    {
        if ($section->course->mentor_id != auth()->id()) abort(403);

        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer',
            'items.*.type' => 'required|in:lesson,quiz'
        ]);

        foreach ($request->items as $index => $item) {
            if ($item['type'] === 'lesson') {
                Lesson::where('id', $item['id'])
                    ->where('section_id', $section->id)
                    ->update(['order' => $index + 1]);
            } else {
                Quiz::where('id', $item['id'])
                    ->where('section_id', $section->id)
                    ->update(['order' => $index + 1]);
            }
        }

        return back()->with('success', 'Items reordered.');
    }
}
