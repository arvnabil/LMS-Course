<?php

namespace App\Http\Controllers\Mentor;

use App\Http\Controllers\Controller;
use App\Models\MentorEarning;
use App\Models\MentorWithdrawal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WithdrawalController extends Controller
{
    public function index()
    {
        $mentorId = auth()->id();

        $withdrawals = MentorWithdrawal::where('mentor_id', $mentorId)
            ->latest()
            ->paginate(15);

        $totalEarnings = MentorEarning::where('mentor_id', $mentorId)->sum('net_earning');
        $totalWithdrawn = MentorWithdrawal::where('mentor_id', $mentorId)
            ->whereIn('status', ['approved', 'completed'])
            ->sum('amount');

        $balance = $totalEarnings - $totalWithdrawn;

        return Inertia::render('Mentor/Withdrawals', [
            'withdrawals' => $withdrawals,
            'balance' => $balance,
            'totalEarnings' => $totalEarnings,
            'totalWithdrawn' => $totalWithdrawn,
        ]);
    }

    public function store(Request $request)
    {
        $mentorId = auth()->id();

        $validated = $request->validate([
            'amount' => 'required|numeric|min:50000',
            'bank_name' => 'required|string|max:100',
            'account_number' => 'required|string|max:50',
            'account_name' => 'required|string|max:255',
            'notes' => 'nullable|string|max:500',
        ]);

        // Check balance
        $totalEarnings = MentorEarning::where('mentor_id', $mentorId)->sum('net_earning');
        $totalWithdrawn = MentorWithdrawal::where('mentor_id', $mentorId)
            ->whereIn('status', ['approved', 'completed', 'pending'])
            ->sum('amount');

        $balance = $totalEarnings - $totalWithdrawn;

        if ($validated['amount'] > $balance) {
            return back()->with('error', 'Insufficient balance.');
        }

        MentorWithdrawal::create([
            'mentor_id' => $mentorId,
            ...$validated,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Withdrawal request submitted.');
    }
}
