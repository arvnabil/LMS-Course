<?php

namespace Modules\Payment\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\Course\Models\Course;
use Modules\Course\Models\Enrollment;
use Modules\Payment\Models\MentorEarning;
use Modules\Payment\Models\Transaction;
use Modules\Notification\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function checkout(Request $request, Course $course)
    {
        $user = auth()->user();

        // 1. Check if already enrolled
        if ($user->enrollments()->where('course_id', $course->id)->exists()) {
            return redirect()->route('student.learn', $course->slug)
                ->with('info', 'You are already enrolled in this course.');
        }

        // 1.5 Organization-sponsored Course Bypass
        $orgService = app(\Modules\Organization\Services\OrganizationService::class);
        if ($orgService->isCourseFreeForUser($user, $course)) {
            $pricing = $orgService->getEffectivePrice($user, $course);

            // Create successful transaction with organization source
            $transaction = Transaction::create([
                'student_id' => $user->id,
                'course_id' => $course->id,
                'order_id' => 'ORG-' . strtoupper(Str::random(10)),
                'amount' => 0,
                'status' => 'success',
                'payment_type' => 'organization',
                'payment_gateway_response' => ['org_name' => $pricing['org_name'], 'original_price' => $pricing['original_price']],
            ]);

            // Auto enroll
            Enrollment::create([
                'student_id' => $user->id,
                'course_id' => $course->id,
                'status' => 'active',
                'enrolled_at' => now(),
            ]);

            // Notify user
            Notification::create([
                'user_id' => $user->id,
                'title' => 'Enrollment Successful',
                'message' => 'You have been enrolled in "' . $course->title . '" for free via ' . $pricing['org_name'] . '.',
                'type' => 'success',
                'data' => ['course_id' => $course->id],
            ]);

            return redirect()->route('student.enrollment.success', $course->slug)
                ->with('success', 'Enrolled for free via ' . $pricing['org_name'] . '!');
        }

        // 2. Free Course Bypass Logic
        if ((float) $course->price === 0.0) {
            // Create successful transaction
            $transaction = Transaction::create([
                'student_id' => $user->id,
                'course_id' => $course->id,
                'order_id' => 'FREE-' . strtoupper(Str::random(10)),
                'amount' => 0,
                'status' => 'success',
                'payment_type' => 'free',
            ]);

            // Auto enroll
            Enrollment::create([
                'student_id' => $user->id,
                'course_id' => $course->id,
                'status' => 'active',
                'enrolled_at' => now(),
            ]);

            // Notify user
            Notification::create([
                'user_id' => $user->id,
                'title' => 'Enrollment Successful',
                'message' => 'You have successfully enrolled in the course: ' . $course->title,
                'type' => 'success',
                'data' => ['course_id' => $course->id],
            ]);

            return redirect()->route('student.enrollment.success', $course->slug)
                ->with('success', 'Successfully enrolled for free!');
        }

        // 3. Paid Course Logic (Midtrans)
        // Check for existing pending transaction for this user and course
        $transaction = Transaction::where('student_id', $user->id)
            ->where('course_id', $course->id)
            ->where('status', 'pending')
            ->latest()
            ->first();

        if ($transaction) {
            $orderId = $transaction->order_id;
        } else {
            $orderId = 'TRX-' . time() . '-' . strtoupper(Str::random(5));
            // Create pending transaction
            $transaction = Transaction::create([
                'student_id' => $user->id,
                'course_id' => $course->id,
                'order_id' => $orderId,
                'amount' => $course->price,
                'status' => 'pending',
            ]);
        }

        // Midtrans setup
        \Midtrans\Config::$serverKey = config('midtrans.server_key');
        \Midtrans\Config::$isProduction = config('midtrans.is_production');
        \Midtrans\Config::$isSanitized = config('midtrans.is_sanitized');
        \Midtrans\Config::$is3ds = config('midtrans.is_3ds');

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => (int) $course->price,
            ],
            'customer_details' => [
                'first_name' => explode(' ', $user->full_name)[0],
                'last_name' => count(explode(' ', $user->full_name)) > 1 ? explode(' ', $user->full_name)[1] : '',
                'email' => $user->email,
            ],
            'item_details' => [
                [
                    'id' => $course->id,
                    'price' => (int) $course->price,
                    'quantity' => 1,
                    'name' => Str::limit($course->title, 50),
                ]
            ],
            'callbacks' => [
                'finish' => route('payment.callback'),
                'error' => route('payment.callback'),
                'pending' => route('payment.callback'),
            ]
        ];

        try {
            $snapToken = \Midtrans\Snap::getSnapToken($params);
            
            return Inertia::render('Payment/Checkout', [
                'snapToken' => $snapToken,
                'course' => $course->load('mentor:id,full_name'),
                'transaction' => $transaction,
                'midtransClientKey' => config('midtrans.client_key'),
                'isProduction' => config('midtrans.is_production'),
            ]);
        } catch (\Exception $e) {
            Log::error('Midtrans Snap Error: ' . $e->getMessage());
            return back()->with('error', 'Failed to generate payment token. Please try again.');
        }
    }

    public function callback(Request $request)
    {
        if ($request->has('course_slug')) {
            return redirect()->route('student.enrollment.success', $request->query('course_slug'));
        }
        return redirect()->route('student.courses.index')
            ->with('info', 'Payment status is being processed. You can check your courses soon.');
    }

    public function webhook(Request $request)
    {
        \Midtrans\Config::$serverKey = config('midtrans.server_key');
        \Midtrans\Config::$isProduction = config('midtrans.is_production');
        
        try {
            $notif = new \Midtrans\Notification();
        } catch (\Exception $e) {
            Log::error('Midtrans Notification Error: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid Request'], 400);
        }

        $transaction = $notif->transaction_status;
        $type = $notif->payment_type;
        $orderId = $notif->order_id;
        $fraud = $notif->fraud_status;

        $dbTransaction = Transaction::where('order_id', $orderId)->first();

        if (!$dbTransaction) {
            Log::error('Transaction not found in Webhook: ' . $orderId);
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        // Avoid double processing
        if ($dbTransaction->status === 'success') {
            return response()->json(['message' => 'Already processed'], 200);
        }

        $dbTransaction->payment_type = $type;
        $dbTransaction->payment_gateway_response = $notif->getResponse();

        $success = false;

        if ($transaction == 'capture') {
            if ($type == 'credit_card') {
                if ($fraud == 'challenge') {
                    $dbTransaction->status = 'pending';
                } else {
                    $dbTransaction->status = 'success';
                    $success = true;
                }
            }
        } else if ($transaction == 'settlement') {
            $dbTransaction->status = 'success';
            $success = true;
        } else if ($transaction == 'pending') {
            $dbTransaction->status = 'pending';
        } else if ($transaction == 'deny') {
            $dbTransaction->status = 'failed';
        } else if ($transaction == 'expire') {
            $dbTransaction->status = 'expired';
        } else if ($transaction == 'cancel') {
            $dbTransaction->status = 'failed';
        }

        $dbTransaction->save();

        if ($success) {
            // Auto Enroll
            Enrollment::firstOrCreate([
                'student_id' => $dbTransaction->student_id,
                'course_id' => $dbTransaction->course_id,
            ], [
                'status' => 'active',
                'enrolled_at' => now(),
            ]);

            // Calculate Mentor Earning (e.g. 20% platform fee)
            $platformFeePercent = 20;
            $platformFee = $dbTransaction->amount * ($platformFeePercent / 100);
            $netEarning = $dbTransaction->amount - $platformFee;

            $course = Course::find($dbTransaction->course_id);
            if ($course && $course->mentor_id) {
                MentorEarning::create([
                    'mentor_id' => $course->mentor_id,
                    'transaction_id' => $dbTransaction->id,
                    'amount' => $dbTransaction->amount,
                    'platform_fee' => $platformFee,
                    'net_earning' => $netEarning,
                ]);

                // Notify user
                Notification::create([
                    'user_id' => $dbTransaction->student_id,
                    'title' => 'Enrollment Successful',
                    'message' => 'Your payment was successful and you have been enrolled in: ' . $course->title,
                    'type' => 'success',
                    'data' => ['course_id' => $course->id],
                ]);
            }
        }

        return response()->json(['message' => 'Webhook received successfully'], 200);
    }
}
