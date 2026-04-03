<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Categories
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->timestamps();
        });

        // 2. Courses
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mentor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('categories')->onDelete('restrict');
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('tagline');
            $table->text('description');
            $table->string('thumbnail')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->boolean('is_certified')->default(false);
            $table->timestamps();
        });

        // 3. Course Photos
        Schema::create('course_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('photo');
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // 4. Course Sections (Modules)
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // 5. Lessons (Videos/Articles inside Sections)
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->enum('type', ['video', 'text']);
            $table->string('video_url')->nullable(); // For Youtube/Drive/S3
            $table->longText('content')->nullable(); // For Articles
            $table->integer('order')->default(0);
            $table->boolean('is_preview')->default(false);
            $table->timestamps();
        });

        // 6. Quizzes (Can be assigned to Course or specific Section)
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('section_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['multiple_choice', 'submission']);
            $table->integer('passing_score')->default(70);
            $table->boolean('is_required_for_certificate')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // 7. Quiz Questions (For multiple_choice type)
        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->onDelete('cascade');
            $table->text('question');
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // 8. Quiz Options
        Schema::create('quiz_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_question_id')->constrained('quiz_questions')->onDelete('cascade');
            $table->text('option_text');
            $table->boolean('is_correct')->default(false);
            $table->timestamps();
        });

        // 9. Enrollments (Student buys/joins a course)
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['active', 'completed', 'dropped'])->default('active');
            $table->timestamp('enrolled_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'course_id']);
        });

        // 10. Lesson Progress
        Schema::create('lesson_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained()->onDelete('cascade');
            $table->foreignId('lesson_id')->constrained()->onDelete('cascade');
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['enrollment_id', 'lesson_id']);
        });

        // 11. Quiz Attempts (Student takes a multiple choice quiz)
        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained()->onDelete('cascade');
            $table->foreignId('quiz_id')->constrained()->onDelete('cascade');
            $table->integer('score')->default(0);
            $table->boolean('is_passed')->default(false);
            $table->timestamps();
        });

        // 12. Student Submissions (Student uploads a file/text for a submission quiz)
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained()->onDelete('cascade');
            $table->foreignId('quiz_id')->constrained()->onDelete('cascade'); // Points to a 'submission' type quiz
            $table->text('submission_text')->nullable();
            $table->string('file_url')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->integer('score')->nullable();
            $table->text('mentor_feedback')->nullable();
            $table->timestamps();
        });

        // 13. Quiz Answers (Student's specific answers to multiple choice questions)
        Schema::create('quiz_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_attempt_id')->constrained()->onDelete('cascade');
            $table->foreignId('quiz_question_id')->constrained('quiz_questions')->onDelete('cascade');
            $table->foreignId('quiz_option_id')->nullable()->constrained('quiz_options')->onDelete('set null');
            $table->boolean('is_correct')->default(false);
            $table->timestamps();
        });

        // 14. Certificates
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('certificate_code')->unique();
            $table->string('pdf_url')->nullable();
            $table->timestamp('issued_at')->useCurrent();
            $table->timestamps();

            $table->unique(['student_id', 'course_id']);
        });

        // 15. Certificate Templates (Course Specific)
        Schema::create('certificate_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade')->unique(); // 1 template per course
            $table->string('background_image');
            $table->json('layout_data'); // Stores X/Y coords for Name, Date, Course Title etc
            $table->timestamps();
        });

        // 16. Transactions (Payments via Midtrans/Xendit)
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('order_id')->unique(); // For PG Gateways
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['pending', 'success', 'failed', 'expired'])->default('pending');
            $table->string('payment_type')->nullable(); // e.g., credit_card, gopay, bank_transfer
            $table->json('payment_gateway_response')->nullable();
            $table->timestamps();
        });

        // 17. Mentor Earnings
        Schema::create('mentor_earnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mentor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('transaction_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->decimal('platform_fee', 10, 2);
            $table->decimal('net_earning', 10, 2);
            $table->timestamps();
        });

        // 18. Mentor Withdrawals
        Schema::create('mentor_withdrawals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mentor_id')->constrained('users')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed'])->default('pending');
            $table->string('bank_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('account_name')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 19. Site Settings
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('site_settings');
        Schema::dropIfExists('mentor_withdrawals');
        Schema::dropIfExists('mentor_earnings');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('certificate_templates');
        Schema::dropIfExists('certificates');
        Schema::dropIfExists('quiz_answers');
        Schema::dropIfExists('submissions');
        Schema::dropIfExists('quiz_attempts');
        Schema::dropIfExists('lesson_progress');
        Schema::dropIfExists('enrollments');
        Schema::dropIfExists('quiz_options');
        Schema::dropIfExists('quiz_questions');
        Schema::dropIfExists('quizzes');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('sections');
        Schema::dropIfExists('course_photos');
        Schema::dropIfExists('courses');
        Schema::dropIfExists('categories');
        Schema::enableForeignKeyConstraints();
    }
};
