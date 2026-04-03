<?php

namespace Modules\Course\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Modules\Course\Models\Course;
use Modules\Course\Models\Enrollment;
use Modules\Course\Models\Lesson;
use Modules\Quiz\Models\Quiz;
use Modules\Quiz\Models\Submission;
use Modules\Notification\Models\Notification;
use Modules\Course\Services\CourseCompletionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseController extends Controller
{
    /**
     * Display the student's enrolled courses.
     */
    public function index()
    {
        $enrollments = auth()->user()->enrollments()
            ->with(['course.category', 'course.mentor', 'course.sections.lessons'])
            ->latest()
            ->get()
            ->map(function ($enrollment) {
                // Total lessons across all sections
                $totalLessons = 0;
                foreach ($enrollment->course->sections as $section) {
                    $totalLessons += $section->lessons->count();
                }

                // Completed lessons for this user
                $completedLessonsCount = $enrollment->lessonProgress()
                    ->where('is_completed', true)
                    ->count();

                // Calculate percentage
                $enrollment->progress_percentage = $totalLessons > 0 
                    ? round(($completedLessonsCount / $totalLessons) * 100) 
                    : 0;
                
                return $enrollment;
            });

        return Inertia::render('Dashboard/MyCourses', [
            'enrollments' => $enrollments,
        ]);
    }

    /**
     * Show the course player.
     */
    public function learn(Course $course, Lesson $lesson = null)
    {
        $user = auth()->user();
        $enrollment = Enrollment::where('student_id', $user?->id)->where('course_id', $course->id)->first();

        $course->load(['sections.lessons', 'sections.quizzes']);

        // Handle Quiz specifically if quiz_id provided via query param
        $quizId = request('quiz_id');
        if ($quizId && !$lesson) {
            $quiz = Quiz::with('questions.options')->find($quizId);
            if ($quiz) {
                $lesson = $quiz; // Assign quiz to lesson variable for unified handling
                $lesson->is_quiz = true; // Mark as quiz for frontend
            }
        }

        // Handle default lesson if still null
        if (!$lesson) {
            if (!$enrollment) {
                // If not enrolled, find the first preview lesson
                $lesson = Lesson::whereHas('section', function($q) use ($course) {
                    $q->where('course_id', $course->id);
                })->where('is_preview', true)->first();
                
                if (!$lesson) {
                    abort(403, 'No preview available for this course.');
                }
            } else {
                $lesson = $course->sections->first()?->lessons->first();
            }
        }

        // If not enrolled, only allow specific previewable content
        if (!$enrollment) {
            // If it's a lesson, check its is_preview property
            if ($lesson instanceof Lesson && !$lesson->is_preview) {
                abort(403, 'You must be enrolled to view this content.');
            }
            // If it's a quiz, check its is_preview property (assuming Quiz model has it)
            if ($lesson instanceof Quiz && !$lesson->is_preview) {
                abort(403, 'You must be enrolled to view this content.');
            }
            // If it's neither a lesson nor a quiz
            if (!($lesson instanceof Lesson) && !($lesson instanceof Quiz)) {
                abort(403, 'You must be enrolled to view this content.');
            }
        }

        // Drip Content: Check prerequisite
        $prerequisiteMet = true;
        $prerequisiteMessage = null;

        if ($lesson && $lesson->prerequisite_lesson_id) {
            $prereqCompleted = $enrollment->lessonProgress()
                ->where('lesson_id', $lesson->prerequisite_lesson_id)
                ->where('is_completed', true)
                ->exists();

            if (!$prereqCompleted) {
                $prerequisiteMet = false;
                $prereqLesson = Lesson::find($lesson->prerequisite_lesson_id);
                $prerequisiteMessage = 'You must complete "' . ($prereqLesson->title ?? 'previous lesson') . '" first.';
            }
        }

        return Inertia::render('Learn', [
            'course' => $course,
            'currentLesson' => $lesson,
            'enrollment' => $enrollment->load(['lessonProgress', 'quizAttempts', 'submissions']),
            'prerequisiteMet' => $prerequisiteMet,
            'prerequisiteMessage' => $prerequisiteMessage,
        ]);
    }

    /**
     * Mark a lesson as completed.
     */
    public function completeLesson(Lesson $lesson)
    {
        $user = auth()->user();
        $enrollment = Enrollment::where('student_id', $user->id)->where('course_id', $lesson->section->course_id)->firstOrFail();

        $enrollment->lessonProgress()->updateOrCreate(
            ['lesson_id' => $lesson->id],
            ['is_completed' => true, 'completed_at' => now()]
        );

        // Notify user
        Notification::create([
            'user_id' => $user->id,
            'title' => 'Lesson Completed',
            'message' => 'You have completed the lesson: ' . $lesson->title,
            'type' => 'info',
            'data' => ['lesson_id' => $lesson->id, 'course_id' => $lesson->section->course_id],
        ]);

        app(CourseCompletionService::class)->checkAndComplete($enrollment);

        return back()->with('success', 'Lesson marked as completed.');
    }

    /**
     * Show the quiz player.
     */
    public function playQuiz(Quiz $quiz)
    {
        // Ensure student is enrolled in the course that owns this quiz
        $user = auth()->user();
        $enrollment = Enrollment::where('student_id', $user->id)->where('course_id', $quiz->course_id)->firstOrFail();

        return Inertia::render('QuizPlayer', [
            'quiz' => $quiz->load('questions.options'),
            'course' => $quiz->course,
        ]);
    }

    /**
     * Submit quiz answers and calculate score.
     */
    public function submitQuiz(Request $request, Quiz $quiz)
    {
        $user = auth()->user();
        $enrollment = Enrollment::where('student_id', $user->id)->where('course_id', $quiz->course_id)->firstOrFail();

        if ($quiz->type === 'submission') {
            $request->validate([
                'submission_text' => 'nullable|string',
                'file' => 'nullable|file|mimes:pdf,zip,rar,doc,docx|max:10240', // 10MB max
            ]);

            $fileUrl = null;
            if ($request->hasFile('file')) {
                $fileUrl = $request->file('file')->store('submissions/' . $quiz->id, 'public');
                $fileUrl = asset('storage/' . $fileUrl);
            }

            Submission::create([
                'enrollment_id' => $enrollment->id,
                'quiz_id' => $quiz->id,
                'submission_text' => $request->submission_text,
                'file_url' => $fileUrl,
                'status' => 'pending',
            ]);

            // Notify mentor
            Notification::create([
                'user_id' => $quiz->course->mentor_id,
                'title' => 'New Assignment Submission',
                'message' => 'Student ' . $user->name . ' has submitted an assignment for ' . $quiz->title,
                'type' => 'info',
                'data' => ['quiz_id' => $quiz->id, 'enrollment_id' => $enrollment->id],
            ]);

            return redirect()->route('student.learn', ['course' => $quiz->course->slug, 'quiz_id' => $quiz->id])
                ->with('success', 'Assignment submitted and pending review.');
        }

        $answers = $request->input('answers', []); // question_id => option_id

        $totalQuestions = $quiz->questions()->count();
        if ($totalQuestions === 0) return back()->with('error', 'Quiz has no questions.');

        $correctAnswers = 0;

        // Start a quiz attempt
        $attempt = $quiz->attempts()->create([
            'enrollment_id' => $enrollment->id,
            'score' => 0,
            'is_passed' => false,
        ]);

        foreach ($quiz->questions as $question) {
            $selectedOptionId = $answers[$question->id] ?? null;
            $isCorrect = false;

            if ($selectedOptionId) {
                $option = $question->options()->find($selectedOptionId);
                if ($option && $option->is_correct) {
                    $correctAnswers++;
                    $isCorrect = true;
                }
            }

            $attempt->answers()->create([
                'quiz_question_id' => $question->id,
                'quiz_option_id' => $selectedOptionId,
                'is_correct' => $isCorrect,
            ]);
        }

        $score = ($correctAnswers / $totalQuestions) * 100;
        $isPassed = $score >= ($quiz->passing_score ?? 70);

        $attempt->update([
            'score' => $score,
            'is_passed' => $isPassed
        ]);

        // Notify student
        Notification::create([
            'user_id' => $user->id,
            'title' => 'Quiz Submitted',
            'message' => 'You have submitted the quiz: ' . $quiz->title . '. Result: ' . ($isPassed ? 'Passed' : 'Failed') . ' (' . round($score) . '%)',
            'type' => $isPassed ? 'success' : 'warning',
            'data' => ['quiz_id' => $quiz->id, 'score' => $score, 'is_passed' => $isPassed],
        ]);

        app(CourseCompletionService::class)->checkAndComplete($enrollment);

        return redirect()->route('student.learn', ['course' => $quiz->course->slug, 'quiz_id' => $quiz->id])
            ->with('success', "Quiz submitted! Your score: " . round($score) . "%" . ($isPassed ? " (Passed)" : " (Failed)"));
    }

    /**
     * Show the course completion page.
     */
    public function completed(Course $course)
    {
        $user = auth()->user();
        $enrollment = Enrollment::where('student_id', $user->id)
            ->where('course_id', $course->id)
            ->firstOrFail();

        // Re-check completion just in case to be sure
        app(CourseCompletionService::class)->checkAndComplete($enrollment);

        return Inertia::render('Student/CourseComplete', [
            'course' => $course->load(['mentor', 'category']),
            'enrollment' => $enrollment,
        ]);
    }
}
