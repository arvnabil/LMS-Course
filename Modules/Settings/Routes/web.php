<?php

use Illuminate\Support\Facades\Route;
use Modules\Settings\Http\Controllers\Admin\SettingController;

/*
|--------------------------------------------------------------------------
| Settings Module Routes
|--------------------------------------------------------------------------
*/

Route::middleware('web')->group(function () {
    Route::middleware(['auth', 'verified'])->group(function () {
        // Admin routes
        Route::middleware('role:admin')->prefix('dashboard/admin')->name('admin.')->group(function () {
            // Platform Settings
            Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
            Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');
        });
    });
});
