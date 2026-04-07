<?php

use App\Http\Controllers\ProfileController;
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
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

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

    // Achievements (Cross-module)
    Route::group(['prefix' => 'dashboard', 'as' => 'student.'], function () {
        Route::get('/achievements', [\App\Http\Controllers\Student\AchievementController::class, 'index'])->name('dashboard.achievements');
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
