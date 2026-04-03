<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MentorWithdrawal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WithdrawalController extends Controller
{
    /**
     * Display a listing of withdrawal requests.
     */
    public function index(Request $request)
    {
        $query = MentorWithdrawal::with('mentor:id,full_name,email');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('mentor', function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $withdrawals = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Withdrawals', [
            'withdrawals' => $withdrawals,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Update the status of a withdrawal request.
     */
    public function updateStatus(Request $request, MentorWithdrawal $withdrawal)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,completed,rejected',
            'admin_notes' => 'nullable|string|max:500',
        ]);

        $withdrawal->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? $withdrawal->admin_notes,
            'processed_at' => in_array($validated['status'], ['completed', 'approved']) ? now() : $withdrawal->processed_at,
        ]);

        return back()->with('success', "Withdrawal request marked as {$validated['status']}.");
    }
}
