<?php

use Illuminate\Support\Facades\Route;
use Modules\Quiz\Http\Controllers\Mentor\SubmissionController;

/*
|--------------------------------------------------------------------------
| Quiz Module Routes
|--------------------------------------------------------------------------
*/

Route::middleware('web')->group(function () {
    Route::middleware(['auth', 'verified'])->group(function () {
        // Mentor routes
        Route::middleware('role:mentor,admin')->prefix('dashboard/mentor')->name('mentor.')->group(function () {
            // Mentor Submissions Review
            Route::get('/submissions', [SubmissionController::class, 'index'])->name('submissions.index');
            Route::patch('/submissions/{submission}', [SubmissionController::class, 'review'])->name('submissions.review');
        });
    });
});
