<?php

use Illuminate\Support\Facades\Route;
use Modules\Certificate\Http\Controllers\Student\CertificateController;

/*
|--------------------------------------------------------------------------
| Certificate Module Routes
|--------------------------------------------------------------------------
*/

Route::middleware('web')->group(function () {
    Route::middleware(['auth', 'verified'])->group(function () {
        // Student routes
        Route::group(['prefix' => 'dashboard', 'as' => 'student.'], function () {
            Route::get('/certificates', [CertificateController::class, 'index'])->name('dashboard.certificates');
        });
    });
});
