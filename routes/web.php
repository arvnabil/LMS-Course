<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\OneDriveAuthController;
use App\Http\Controllers\OneDriveStreamController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Guest Routes
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('Home', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'phpVersion' => PHP_VERSION,
    ]);
});

// OneDrive Public Image Proxy (for guest users viewing catalog)
Route::get('/storage/onedrive/{itemId}', [\App\Http\Controllers\OneDriveProxyController::class, 'show'])->name('onedrive.public.show');

// Temporary fix script for hosting (Admin only)
Route::get('/fix-onedrive', function() {
    \Illuminate\Support\Facades\Artisan::call('onedrive:fix-links');
    return "Fix command triggered. Output: <pre>" . \Illuminate\Support\Facades\Artisan::output() . "</pre>";
})->middleware(['auth', 'role:admin']);


/*
|--------------------------------------------------------------------------
| Authenticated Routes (Core - app/)
|--------------------------------------------------------------------------
| Only core routes that don't belong to any module stay here.
| Module-specific routes are loaded by their respective ServiceProviders.
*/
Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard (aggregator)
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
    Route::post('/notifications/mark-all-read', [\App\Http\Controllers\DashboardController::class, 'markAllRead'])->name('notifications.markAllRead');
    Route::get('/dashboard/activity-log', [\App\Http\Controllers\DashboardController::class, 'activityLog'])->name('dashboard.activity-log');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // OneDrive Storage
    Route::get('/onedrive/auth', [OneDriveAuthController::class, 'redirect'])->name('onedrive.auth');
    Route::get('/onedrive/callback', [OneDriveAuthController::class, 'callback'])->name('onedrive.callback');
    Route::get('/onedrive/stream/{itemId}', [OneDriveStreamController::class, 'stream'])->name('onedrive.stream');
    Route::post('/dashboard/mentor/lessons/{lesson}/upload-video', [\Modules\Course\Http\Controllers\Mentor\CourseBuilderController::class, 'uploadLessonVideo'])->name('mentor.lessons.upload-video');
    Route::post('/dashboard/mentor/lessons/{lesson}/upload-file', [\Modules\Course\Http\Controllers\Mentor\CourseBuilderController::class, 'uploadLessonFile'])->name('mentor.lessons.upload-file');
    
    // OneDrive Library & Shared Link Resolvers
    Route::get('/dashboard/mentor/onedrive/files/{itemId?}', [\App\Http\Controllers\Mentor\OneDriveFilesController::class, 'list'])->name('mentor.onedrive.files');
    Route::post('/dashboard/mentor/onedrive/resolve', [\App\Http\Controllers\Mentor\OneDriveFilesController::class, 'resolve'])->name('mentor.onedrive.resolve');


    // Overview & Progress (Cross-module)
    Route::group(['prefix' => 'dashboard', 'as' => 'student.'], function () {
        Route::get('/achievements', [\App\Http\Controllers\Student\AchievementController::class, 'index'])->name('dashboard.achievements');
        Route::get('/mentor-overview', [\App\Http\Controllers\DashboardController::class, 'studentStats'])->name('dashboard.mentor-overview');
        Route::get('/learning-progress', [\App\Http\Controllers\DashboardController::class, 'learningProgress'])->name('dashboard.learning-progress');
    });

    // Admin routes (core)
    Route::middleware('role:admin')->prefix('dashboard/admin')->name('admin.')->group(function () {
        // Analytics
        Route::get('/analytics', [\App\Http\Controllers\Admin\AnalyticsController::class, 'index'])->name('analytics');

        // User Management
        Route::get('/users', [\App\Http\Controllers\Admin\UserManagementController::class, 'index'])->name('users.index');
        Route::patch('/users/{user}/role', [\App\Http\Controllers\Admin\UserManagementController::class, 'updateRole'])->name('users.updateRole');
        Route::patch('/users/{user}/toggle-ban', [\App\Http\Controllers\Admin\UserManagementController::class, 'toggleBan'])->name('users.toggleBan');
        Route::delete('/users/bulk', [\App\Http\Controllers\Admin\UserManagementController::class, 'bulkDestroy'])->name('users.bulkDestroy');
        Route::delete('/users/{user}', [\App\Http\Controllers\Admin\UserManagementController::class, 'destroy'])->name('users.destroy');

        // Role Management (Spatie)
        Route::get('/roles', [\App\Http\Controllers\Admin\RoleController::class, 'index'])->name('roles.index');
        Route::post('/roles', [\App\Http\Controllers\Admin\RoleController::class, 'store'])->name('roles.store');
        Route::put('/roles/{role}', [\App\Http\Controllers\Admin\RoleController::class, 'update'])->name('roles.update');
        Route::delete('/roles/bulk', [\App\Http\Controllers\Admin\RoleController::class, 'bulkDestroy'])->name('roles.bulkDestroy');
        Route::delete('/roles/{role}', [\App\Http\Controllers\Admin\RoleController::class, 'destroy'])->name('roles.destroy');
    });
});

require __DIR__.'/auth.php';
