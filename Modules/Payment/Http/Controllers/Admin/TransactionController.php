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
}
