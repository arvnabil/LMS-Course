<?php

use Illuminate\Support\Facades\Route;
use Modules\Certificate\Http\Controllers\Student\CertificateController;

/*
|--------------------------------------------------------------------------
| Certificate Module Routes
|--------------------------------------------------------------------------
*/

Route::middleware('web')->group(function () {
    // Public certificate verification route
    Route::get('/verify-certificate', [\Modules\Certificate\Http\Controllers\VerificationController::class, 'index'])->name('certificate.verify');

    Route::middleware(['auth', 'verified'])->group(function () {
        // Student routes
        Route::group(['prefix' => 'dashboard', 'as' => 'student.'], function () {
            Route::get('/certificates', [CertificateController::class, 'index'])->name('dashboard.certificates');
            Route::post('/certificates/claim/{course}', [CertificateController::class, 'claim'])->name('dashboard.certificates.claim');
        });
    });
});

