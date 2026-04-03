<?php

namespace Modules\Payment\Http\Controllers\Mentor;

use App\Http\Controllers\Controller;
use Modules\Payment\Models\MentorEarning;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EarningController extends Controller
{
    public function index()
    {
        $mentorId = auth()->id();

        $earnings = MentorEarning::where('mentor_id', $mentorId)
            ->with(['transaction.course', 'transaction.student'])
            ->latest()
            ->paginate(15);

        $stats = [
            'total_earnings' => MentorEarning::where('mentor_id', $mentorId)->sum('net_earning'),
            'total_platform_fee' => MentorEarning::where('mentor_id', $mentorId)->sum('platform_fee'),
            'total_transactions' => MentorEarning::where('mentor_id', $mentorId)->count(),
        ];

        return Inertia::render('Mentor/Earnings', [
            'earnings' => $earnings,
            'stats' => $stats,
        ]);
    }
}
