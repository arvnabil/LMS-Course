<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\QuizOption;
use App\Models\QuizQuestion;
use App\Models\Section;
use App\Models\User;
use App\Models\CertificateTemplate;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mentor = User::where('role', 'mentor')->first();
        $category = Category::first();

        if (!$mentor || !$category) {
            return;
        }

        // Create Course
        $course = Course::create([
            'mentor_id' => $mentor->id,
            'category_id' => $category->id,
            'title' => 'Mastering Laravel Foundations',
            'slug' => Str::slug('Mastering Laravel Foundations'),
            'tagline' => 'Start your journey to becoming a Laravel expert.',
            'description' => 'This comprehensive guide covers everything from setting up the environment to building a complete application using Laravel and the TALL stack. Suitable for beginners to intermediate learners.',
            'thumbnail' => null, // Provide a default or leave null if handled correctly
            'price' => 0, // Free course
            'status' => 'published',
            'is_certified' => true,
        ]);

        // Create Section 1
        $section1 = Section::create([
            'course_id' => $course->id,
            'title' => 'Introduction to Laravel',
            'order' => 1,
        ]);

        // Lessons in Section 1
        Lesson::create([
            'section_id' => $section1->id,
            'title' => 'Installing Laravel',
            'type' => 'text',
            'content' => '<p>Welcome to this course! You will learn how to set up your local environment and install Laravel via Composer.</p>',
            'order' => 1,
            'is_preview' => true,
        ]);

        Lesson::create([
            'section_id' => $section1->id,
            'title' => 'Routing Basics',
            'type' => 'video',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Dummy video
            'order' => 2,
            'is_preview' => false,
        ]);

        // Create Quiz in Section 1
        $quiz = Quiz::create([
            'course_id' => $course->id,
            'section_id' => $section1->id,
            'title' => 'Module 1 Knowledge Check',
            'description' => 'Test your understanding of Laravel basic routing and setup.',
            'type' => 'multiple_choice',
            'passing_score' => 80,
            'order' => 3,
        ]);

        $question1 = QuizQuestion::create([
            'quiz_id' => $quiz->id,
            'question' => 'What is the standard command to install Laravel via Composer?',
            'order' => 1,
        ]);

        QuizOption::create(['quiz_question_id' => $question1->id, 'option_text' => 'npm install laravel', 'is_correct' => false]);
        QuizOption::create(['quiz_question_id' => $question1->id, 'option_text' => 'composer create-project laravel/laravel', 'is_correct' => true]);
        QuizOption::create(['quiz_question_id' => $question1->id, 'option_text' => 'php artisan new', 'is_correct' => false]);

        $question2 = QuizQuestion::create([
            'quiz_id' => $quiz->id,
            'question' => 'Which file contains web routes?',
            'order' => 2,
        ]);

        QuizOption::create(['quiz_question_id' => $question2->id, 'option_text' => 'routes/web.php', 'is_correct' => true]);
        QuizOption::create(['quiz_question_id' => $question2->id, 'option_text' => 'routes/api.php', 'is_correct' => false]);

        // Create Certificate Template for this Course
        $defaultLayout = [
            'student_name' => ['x' => 50, 'y' => 50, 'fontSize' => 36, 'color' => '#000000', 'align' => 'center', 'fontFamily' => 'sans-serif', 'fontWeight' => 'bold'],
            'course_title' => ['x' => 50, 'y' => 60, 'fontSize' => 24, 'color' => '#4b5563', 'align' => 'center', 'fontFamily' => 'sans-serif', 'fontWeight' => 'normal'],
            'date' => ['x' => 50, 'y' => 70, 'fontSize' => 16, 'color' => '#6b7280', 'align' => 'center', 'fontFamily' => 'sans-serif', 'fontWeight' => 'normal'],
            'certificate_code' => ['x' => 50, 'y' => 80, 'fontSize' => 12, 'color' => '#9ca3af', 'align' => 'center', 'fontFamily' => 'monospace', 'fontWeight' => 'normal'],
        ];

        CertificateTemplate::create([
            'course_id' => $course->id,
            'background_image' => 'default_bg.jpg', // Placeholder string as per migration requirement
            'layout_data' => $defaultLayout,
        ]);
    }
}
