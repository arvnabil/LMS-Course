<?php

use Illuminate\Support\Facades\Route;
use Modules\Course\Http\Controllers\CatalogController;
use Modules\Course\Http\Controllers\Admin\CategoryController;
use Modules\Course\Http\Controllers\Admin\CourseManagementController;
use Modules\Course\Http\Controllers\Mentor\CourseBuilderController;
use Modules\Course\Http\Controllers\Mentor\StudentController;
use Modules\Course\Http\Controllers\Student\CourseController;

/*
|--------------------------------------------------------------------------
| Course Module Routes
|--------------------------------------------------------------------------
*/

Route::middleware('web')->group(function () {
    // Guest catalog routes
    Route::get('/catalog', [CatalogController::class, 'index'])->name('catalog.public');
    Route::get('/courses/{course:slug}', [CatalogController::class, 'show'])->name('courses.public.show');

    // Authenticated Routes
    Route::middleware(['auth', 'verified'])->group(function () {

        // Student routes
        Route::group(['prefix' => 'dashboard', 'as' => 'student.'], function () {
            Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
            Route::get('/courses/{course:slug}/learn/{lesson?}', [CourseController::class, 'learn'])->name('learn');
            Route::get('/courses/{course:slug}/completed', [CourseController::class, 'completed'])->name('courses.completed');
            Route::post('/lessons/{lesson}/complete', [CourseController::class, 'completeLesson'])->name('lessons.complete');

            Route::get('/quizzes/{quiz}/play', [CourseController::class, 'playQuiz'])->name('quizzes.play');
            Route::post('/quizzes/{quiz}/submit', [CourseController::class, 'submitQuiz'])->name('quizzes.submit');

            Route::get('/catalog', [CatalogController::class, 'index'])->name('catalog.dashboard');
            Route::get('/catalog/{course:slug}', [CatalogController::class, 'show'])->name('courses.dashboard.show');
            Route::get('/courses/{course:slug}/enroll', [CatalogController::class, 'show'])->name('courses.enroll');
        });

        // Mentor routes
        Route::middleware('role:mentor,admin')->prefix('dashboard/mentor')->name('mentor.')->group(function () {
            Route::resource('courses', CourseBuilderController::class);

            // Curriculum management
            Route::post('courses/{course}/sections', [CourseBuilderController::class, 'storeSection'])->name('sections.store');
            Route::put('sections/{section}', [CourseBuilderController::class, 'updateSection'])->name('sections.update');
            Route::delete('sections/{section}', [CourseBuilderController::class, 'destroySection'])->name('sections.destroy');
            Route::post('sections/{section}/lessons', [CourseBuilderController::class, 'storeLesson'])->name('lessons.store');
            Route::get('lessons/{lesson}/edit', [CourseBuilderController::class, 'editLesson'])->name('lessons.edit');
            Route::put('lessons/{lesson}', [CourseBuilderController::class, 'updateLesson'])->name('lessons.update');
            Route::patch('lessons/{lesson}/toggle-preview', [CourseBuilderController::class, 'toggleLessonPreview'])->name('lessons.toggle-preview');
            Route::delete('lessons/{lesson}', [CourseBuilderController::class, 'destroyLesson'])->name('lessons.destroy');

            Route::post('sections/{section}/quizzes', [CourseBuilderController::class, 'storeQuiz'])->name('quizzes.store');
            Route::put('quizzes/{quiz}', [CourseBuilderController::class, 'updateQuiz'])->name('quizzes.update');
            Route::delete('quizzes/{quiz}', [CourseBuilderController::class, 'destroyQuiz'])->name('quizzes.destroy');
            Route::get('quizzes/{quiz}/edit', [CourseBuilderController::class, 'editQuiz'])->name('quizzes.edit');
            Route::post('quizzes/{quiz}/questions', [CourseBuilderController::class, 'storeQuestion'])->name('quizzes.questions.store');
            Route::put('questions/{question}', [CourseBuilderController::class, 'updateQuestion'])->name('quizzes.questions.update');
            Route::delete('questions/{question}', [CourseBuilderController::class, 'deleteQuestion'])->name('quizzes.questions.destroy');
            Route::post('questions/{question}/options', [CourseBuilderController::class, 'storeOption'])->name('quizzes.questions.options.store');
            Route::put('options/{option}', [CourseBuilderController::class, 'updateOption'])->name('quizzes.options.update');
            Route::delete('options/{option}', [CourseBuilderController::class, 'destroyOption'])->name('quizzes.options.destroy');

            // Course Certificate Template
            Route::get('courses/{course}/certificate-template', [CourseBuilderController::class, 'editCertificateTemplate'])->name('courses.certificate-template');
            Route::post('courses/{course}/certificate-template', [CourseBuilderController::class, 'updateCertificateTemplate'])->name('courses.certificate-template.update');

            // Mentor Students
            Route::get('/students', [StudentController::class, 'index'])->name('students');
        });

        // Admin routes (course-related)
        Route::middleware('role:admin')->prefix('dashboard/admin')->name('admin.')->group(function () {
            // Course Management
            Route::get('/courses', [CourseManagementController::class, 'index'])->name('courses.index');
            Route::patch('/courses/{course}/status', [CourseManagementController::class, 'updateStatus'])->name('courses.updateStatus');

            // Categories CRUD
            Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
            Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
            Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
            Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
        });
    });
});

