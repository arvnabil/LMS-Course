<?php

namespace Modules\Certificate\Console;

use Illuminate\Console\Command;
use Modules\Course\Models\Course;
use Modules\Course\Models\Enrollment;
use Modules\Certificate\Models\Certificate;
use Modules\Certificate\Services\CertificateService;

class FixCertificatesCommand extends Command
{
    protected $signature = 'lms:fix-certificates {title?}';
    protected $description = 'Retroactively generate certificates for completed courses';

    public function handle()
    {
        $title = $this->argument('title');
        $query = Course::query();
        
        if ($title) {
            $query->where('title', 'like', "%{$title}%");
        }

        $courses = $query->get();

        foreach ($courses as $course) {
            $this->info("Processing Course: {$course->title} (ID: {$course->id})");
            
            if (!$course->is_certified) {
                $course->update(['is_certified' => true]);
                $this->warn(" - Forced as Certified.");
            }

            $enrollments = Enrollment::where('course_id', $course->id)
                ->where('status', 'completed')
                ->get();

            $this->info(" - Found " . $enrollments->count() . " completed enrollments.");

            foreach ($enrollments as $enrollment) {
                $certificate = Certificate::where('student_id', $enrollment->student_id)
                    ->where('course_id', $enrollment->course_id)
                    ->first();

                $needsGeneration = false;
                
                if (!$certificate) {
                    $needsGeneration = true;
                    $this->comment("   [NEW] Student ID: {$enrollment->student_id} needs a new certificate.");
                } else {
                    $pdfPath = str_replace('/storage/', '', $certificate->pdf_url);
                    if (empty($certificate->pdf_url) || !\Illuminate\Support\Facades\Storage::disk('public')->exists($pdfPath)) {
                        $needsGeneration = true;
                        $this->warn("   [FIX] Student ID: {$enrollment->student_id} exists but PDF is missing. Regenerating...");
                    }
                }

                if ($needsGeneration) {
                    try {
                        // Use the service to generate (it handles the DB record and PDF file)
                        app(CertificateService::class)->generate($enrollment);
                        $this->info("   [SUCCESS] Certificate/PDF ready.");
                    } catch (\Exception $e) {
                        $this->error("   [ERROR] Failed: " . $e->getMessage());
                    }
                } else {
                    $this->line("   [SKIP] Student ID {$enrollment->student_id} already has a valid certificate PDF.");
                }
            }
        }
    }
}
