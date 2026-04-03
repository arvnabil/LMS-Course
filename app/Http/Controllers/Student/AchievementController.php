<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Modules\Course\Models\Enrollment;
use Modules\Course\Models\LessonProgress;
use Modules\Certificate\Models\Certificate;
use Modules\Quiz\Models\QuizAttempt;
use Inertia\Inertia;

class AchievementController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Calculate basic counts
        $enrollmentCount = Enrollment::where('student_id', $user->id)->count();
        $completedCourses = Enrollment::where('student_id', $user->id)
            ->where('status', 'completed')
            ->count();
        $certificateCount = Certificate::where('student_id', $user->id)->count();

        // Advanced metrics
        $perfectScoresCount = QuizAttempt::whereHas('enrollment', fn($q) => $q->where('student_id', $user->id))
            ->where('score', 100)
            ->count();

        $passedQuizzesCount = QuizAttempt::whereHas('enrollment', fn($q) => $q->where('student_id', $user->id))
            ->where('is_passed', true)
            ->distinct('quiz_id')
            ->count();

        $speedDemon = Enrollment::where('student_id', $user->id)
            ->where('status', 'completed')
            ->whereNotNull('completed_at')
            ->whereNotNull('enrolled_at')
            ->whereRaw('TIMESTAMPDIFF(HOUR, enrolled_at, completed_at) <= 48')
            ->exists();

        $nightOwl = LessonProgress::whereHas('enrollment', fn($q) => $q->where('student_id', $user->id))
            ->where('is_completed', true)
            ->whereRaw('HOUR(completed_at) BETWEEN 0 AND 5')
            ->exists();

        $achievements = [];

        // --- QUANTITY BADGES ---
        $achievements[] = [
            'id' => 'first_enrollment',
            'title' => 'First Step',
            'description' => 'Enrolled in your first course',
            'icon' => '🎯',
            'unlocked' => $enrollmentCount >= 1,
        ];

        $achievements[] = [
            'id' => 'knowledge_seeker',
            'title' => 'Knowledge Seeker',
            'description' => 'Enrolled in 10 courses',
            'icon' => '📚',
            'unlocked' => $enrollmentCount >= 10,
        ];

        $achievements[] = [
            'id' => 'first_completion',
            'title' => 'Graduate',
            'description' => 'Completed your first course',
            'icon' => '🎓',
            'unlocked' => $completedCourses >= 1,
        ];

        $achievements[] = [
            'id' => 'marathoner',
            'title' => 'Marathoner',
            'description' => 'Completed 10 courses',
            'icon' => '🏆',
            'unlocked' => $completedCourses >= 10,
        ];

        $achievements[] = [
            'id' => 'high_flyer',
            'title' => 'High Flyer',
            'description' => 'Earned 5 certificates',
            'icon' => '📜',
            'unlocked' => $certificateCount >= 5,
        ];

        // --- SKILL BADGES ---
        $achievements[] = [
            'id' => 'perfect_score',
            'title' => 'Perfectionist',
            'description' => 'Got 100% on a quiz',
            'icon' => '💯',
            'unlocked' => $perfectScoresCount >= 1,
        ];

        $achievements[] = [
            'id' => 'perfectionist_2',
            'title' => 'Perfectionist II',
            'description' => 'Got 100% on 3 different quizzes',
            'icon' => '🔥',
            'unlocked' => $perfectScoresCount >= 3,
        ];

        $achievements[] = [
            'id' => 'quiz_guru',
            'title' => 'Quiz Guru',
            'description' => 'Passed 10 different quizzes',
            'icon' => '🧠',
            'unlocked' => $passedQuizzesCount >= 10,
        ];

        // --- SPECIAL BADGES ---
        $achievements[] = [
            'id' => 'speed_demon',
            'title' => 'Speed Demon',
            'description' => 'Completed a course within 48 hours of enrollment',
            'icon' => '⚡',
            'unlocked' => $speedDemon,
        ];

        $achievements[] = [
            'id' => 'night_owl',
            'title' => 'Night Owl',
            'description' => 'Completed a lesson between 12 AM and 5 AM',
            'icon' => '🦉',
            'unlocked' => $nightOwl,
        ];

        $achievements[] = [
            'id' => 'team_player',
            'title' => 'Team Player',
            'description' => 'Learning as part of an organization',
            'icon' => '🤝',
            'unlocked' => !is_null($user->organization_id),
        ];

        $stats = [
            'courses_enrolled' => $enrollmentCount,
            'courses_completed' => $completedCourses,
            'certificates_earned' => $certificateCount,
            'achievements_unlocked' => collect($achievements)->where('unlocked', true)->count(),
            'total_achievements' => count($achievements),
        ];

        return Inertia::render('Dashboard/Achievements', [
            'achievements' => $achievements,
            'stats' => $stats,
        ]);
    }
}
