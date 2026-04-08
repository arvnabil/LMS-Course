<?php

use Illuminate\Support\Facades\Route;
use Modules\Settings\Http\Controllers\Admin\SettingController;
use Modules\Settings\Http\Controllers\Admin\OneDriveExplorerController;
use Modules\Settings\Http\Controllers\Admin\OneDrivePermissionController;

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

            // OneDrive Explorer for Settings
            Route::get('/settings/onedrive/list/{itemId?}', [OneDriveExplorerController::class, 'list'])->name('settings.onedrive.list');
            Route::post('/settings/onedrive/create-folder', [OneDriveExplorerController::class, 'createFolder'])->name('settings.onedrive.create-folder');
            Route::post('/settings/onedrive/rename-folder', [OneDriveExplorerController::class, 'renameFolder'])->name('settings.onedrive.rename-folder');
            Route::get('/settings/onedrive/resolve-path/{itemId}', [OneDriveExplorerController::class, 'resolvePath'])->name('settings.onedrive.resolve-path');

            // OneDrive Permissions
            Route::get('/settings/onedrive/permissions', [OneDrivePermissionController::class, 'index'])->name('settings.onedrive.permissions.index');
            Route::post('/settings/onedrive/permissions', [OneDrivePermissionController::class, 'update'])->name('settings.onedrive.permissions.update');
            Route::delete('/settings/onedrive/permissions/{user}', [OneDrivePermissionController::class, 'destroy'])->name('settings.onedrive.permissions.destroy');
        });
    });
});
