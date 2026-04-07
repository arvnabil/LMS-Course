<?php

namespace Modules\Payment\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Modules\Payment\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with(['student', 'course']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                return $q->where('order_id', 'like', "%{$search}%")
                         ->orWhereHas('student', function($sq) use ($search) {
                             $sq->where('full_name', 'like', "%{$search}%");
                         });
            });
        }

        $transactions = $query->latest()->paginate(15)->withQueryString();

        $stats = [
            'total_revenue' => Transaction::where('status', 'success')->sum('amount'),
            'pending_count' => Transaction::where('status', 'pending')->count(),
            'success_count' => Transaction::where('status', 'success')->count(),
        ];

        return Inertia::render('Admin/Transactions', [
            'transactions' => $transactions,
            'stats' => $stats,
            'filters' => $request->only(['status', 'date_from', 'date_to', 'search']),
        ]);
    }
    public function destroy(Transaction $transaction)
    {
        if ($transaction->status !== 'pending') {
            return back()->with('error', 'Only pending transactions can be deleted.');
        }

        $transaction->delete();

        return back()->with('success', 'Transaction deleted successfully.');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:transactions,id',
        ]);

        $deletedCount = Transaction::whereIn('id', $request->ids)
            ->where('status', 'pending')
            ->delete();

        if ($deletedCount === 0) {
            return back()->with('error', 'No pending transactions found to delete.');
        }

        return back()->with('success', "{$deletedCount} pending transactions deleted successfully.");
    }
}
