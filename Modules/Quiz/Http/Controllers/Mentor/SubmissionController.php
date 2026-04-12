<?php

namespace Modules\Quiz\Http\Controllers\Mentor;

use App\Http\Controllers\Controller;
use Modules\Quiz\Models\Submission;
use Modules\Course\Services\CourseCompletionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubmissionController extends Controller
{
    protected $completionService;

    public function __construct(CourseCompletionService $completionService)
    {
        $this->completionService = $completionService;
    }

    public function index(Request $request)
    {
        $mentorId = auth()->id();

        $query = Submission::with(['enrollment.student', 'enrollment.course', 'quiz'])
            ->whereHas('enrollment.course', fn($q) => $q->where('mentor_id', $mentorId));

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $submissions = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Mentor/Submissions', [
            'submissions' => $submissions,
            'filters' => $request->only(['status']),
        ]);
    }

    public function review(Request $request, Submission $submission)
    {
        // Verify mentor owns the course or user is admin
        if (!auth()->user()->isAdmin() && $submission->enrollment->course->mentor_id != auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'score' => 'nullable|integer|min:0|max:100',
            'mentor_feedback' => 'nullable|string|max:1000',
        ]);

        $submission->update($validated);

        if ($validated['status'] === 'approved') {
            // Check if this approval completes the lesson and course
            $this->completionService->checkAndComplete($submission->enrollment);
        }

        return back()->with('success', 'Submission reviewed successfully.');
    }
}
