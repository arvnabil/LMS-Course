<?php

use Illuminate\Support\Facades\Route;
use Modules\Organization\Http\Controllers\Admin\OrganizationController;

/*
|--------------------------------------------------------------------------
| Organization Module Routes
|--------------------------------------------------------------------------
*/

Route::middleware('web')->group(function () {
    Route::middleware(['auth', 'verified'])->group(function () {

        // Admin routes
        Route::middleware('role:admin')->prefix('dashboard/admin')->name('admin.')->group(function () {
            Route::resource('organizations', OrganizationController::class);

            // Member management
            Route::post('organizations/{organization}/members', [OrganizationController::class, 'addMember'])
                ->name('organizations.members.add');
            Route::delete('organizations/{organization}/members/{user}', [OrganizationController::class, 'removeMember'])
                ->name('organizations.members.remove');

            // Course assignment
            Route::post('organizations/{organization}/courses', [OrganizationController::class, 'assignCourse'])
                ->name('organizations.courses.assign');
            Route::delete('organizations/{organization}/courses/{course}', [OrganizationController::class, 'unassignCourse'])
                ->name('organizations.courses.unassign');
        });
    });
});
