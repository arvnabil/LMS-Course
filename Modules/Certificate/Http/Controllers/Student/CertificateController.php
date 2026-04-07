<?php

namespace Modules\Certificate\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Modules\Course\Models\Course;
use Modules\Course\Models\Enrollment;
use Modules\Certificate\Services\CertificateService;

class CertificateController extends Controller
{
    public function index()
    {
        $certificates = auth()->user()->certificates()
            ->with('course')
            ->latest('issued_at')
            ->get();

        return Inertia::render('Dashboard/Certificates', [
            'certificates' => $certificates,
        ]);
    }

    public function claim(Course $course)
    {
        $user = auth()->user();
        $enrollment = Enrollment::where('student_id', $user?->id)
            ->where('course_id', $course->id)
            ->where('status', 'completed')
            ->firstOrFail();

        // Proactive fix: always ensure course is certified if a student is claiming
        if (!$course->is_certified) {
            $course->update(['is_certified' => true]);
        }

        // Generate certificate
        $service = app(CertificateService::class);
        $service->generate($enrollment);

        return redirect()->route('student.dashboard.certificates')
            ->with('success', 'Certificate claimed successfully!');
    }
}
