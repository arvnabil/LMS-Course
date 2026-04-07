<?php

use Illuminate\Support\Facades\Route;
use Modules\Payment\Http\Controllers\PaymentController;
use Modules\Payment\Http\Controllers\Admin\TransactionController;
use Modules\Payment\Http\Controllers\Admin\WithdrawalController as AdminWithdrawalController;
use Modules\Payment\Http\Controllers\Mentor\EarningController;
use Modules\Payment\Http\Controllers\Mentor\WithdrawalController as MentorWithdrawalController;

/*
|--------------------------------------------------------------------------
| Payment Module Routes
|--------------------------------------------------------------------------
*/

Route::middleware('web')->group(function () {
    Route::middleware(['auth', 'verified'])->group(function () {
        // Payment Routes
        Route::get('/checkout/{course:slug}', [PaymentController::class, 'checkout'])->name('payment.checkout');
        Route::get('/payment/callback', [PaymentController::class, 'callback'])->name('payment.callback');

        // Mentor routes
        Route::middleware('role:mentor,admin')->prefix('dashboard/mentor')->name('mentor.')->group(function () {
            // Mentor Earnings
            Route::get('/earnings', [EarningController::class, 'index'])->name('earnings');

            // Mentor Withdrawals
            Route::get('/withdrawals', [MentorWithdrawalController::class, 'index'])->name('withdrawals');
            Route::post('/withdrawals', [MentorWithdrawalController::class, 'store'])->name('withdrawals.store');
        });

        // Admin routes
        Route::middleware('role:admin')->prefix('dashboard/admin')->name('admin.')->group(function () {
            // Transaction Management
            Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');

            // Payout / Withdrawal Management
            Route::get('/withdrawals', [AdminWithdrawalController::class, 'index'])->name('withdrawals.index');
            Route::patch('/withdrawals/{withdrawal}/status', [AdminWithdrawalController::class, 'updateStatus'])->name('withdrawals.updateStatus');
        });
    });

    // Webhook Route
    Route::post('/payment/webhook', [PaymentController::class, 'webhook'])->name('payment.webhook');
});
