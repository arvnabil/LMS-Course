<?php

namespace Modules\Course\Services;

use Modules\Course\Models\Enrollment;
use Modules\Course\Models\Course;
use Modules\Quiz\Models\Submission;
use Modules\Notification\Models\Notification;

class CourseCompletionService
{
    /**
     * Check if all lessons and required quizzes are completed for this enrollment.
     * If so, mark the enrollment as completed and optionally trigger certificate generation.
     */
    public function checkAndComplete(Enrollment $enrollment): bool
    {
        $course = $enrollment->course()->with(['sections.lessons', 'quizzes'])->first();

        // Count total lessons
        $totalLessons = 0;
        foreach ($course->sections as $section) {
            $totalLessons += $section->lessons->count();
        }

        // Count completed lessons
        $completedLessons = $enrollment->lessonProgress()
            ->where('is_completed', true)
            ->count();

        // Check required quizzes
        $requiredQuizzes = $course->quizzes()
            ->where('is_required_for_certificate', true)
            ->get();

        $allQuizzesPassed = true;
        foreach ($requiredQuizzes as $quiz) {
            if ($quiz->type === 'submission') {
                $submission = Submission::where('enrollment_id', $enrollment->id)
                    ->where('quiz_id', $quiz->id)
                    ->where('status', 'approved')
                    ->first();
                
                if (!$submission) {
                    $allQuizzesPassed = false;
                    break;
                }
            } else {
                $attempt = $enrollment->quizAttempts()
                    ->where('quiz_id', $quiz->id)
                    ->where('is_passed', true)
                    ->first();

                if (!$attempt) {
                    $allQuizzesPassed = false;
                    break;
                }
            }
        }

        // If all lessons completed and all required quizzes passed
        if ($totalLessons > 0 && $completedLessons >= $totalLessons && $allQuizzesPassed) {
            $enrollment->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            // Trigger certificate generation if course is certified
            if ($course->is_certified) {
                app(\Modules\Certificate\Services\CertificateService::class)->generate($enrollment);
            }

            // Notify user
            Notification::create([
                'user_id' => $enrollment->student_id,
                'title' => 'Course Completed! 🎓',
                'message' => 'Congratulations! You have successfully completed the course: ' . $course->title,
                'type' => 'success',
                'data' => ['course_id' => $course->id],
            ]);

            return true;
        }

        return false;
    }
}
