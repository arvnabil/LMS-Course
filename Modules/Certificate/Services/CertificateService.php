<?php

namespace Modules\Certificate\Services;

use Modules\Certificate\Models\Certificate;
use Modules\Certificate\Models\CertificateTemplate;
use Modules\Course\Models\Enrollment;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Services\OneDriveService;

class CertificateService
{
    /**
     * Generate a certificate for a completed enrollment.
     */
    public function generate(Enrollment $enrollment): ?Certificate
    {
        // Don't generate duplicate
        $existing = Certificate::where('student_id', $enrollment->student_id)
            ->where('course_id', $enrollment->course_id)
            ->first();

        if ($existing) {
            return $existing;
        }

        $certificate = Certificate::create([
            'student_id' => $enrollment->student_id,
            'course_id' => $enrollment->course_id,
            'certificate_code' => $this->generateCode(),
            'issued_at' => now(),
        ]);

        // Generate PDF (simplified - stores path for future PDF generation)
        $certificate->update([
            'pdf_url' => $this->generatePdf($certificate),
        ]);

        return $certificate;
    }

    /**
     * Generate a unique certificate code.
     */
    private function generateCode(): string
    {
        do {
            $code = 'CERT-' . strtoupper(Str::random(8));
        } while (Certificate::where('certificate_code', $code)->exists());

        return $code;
    }

    /**
     * Generate PDF certificate.
     */
    private function generatePdf(Certificate $certificate): string
    {
        $certificate->load(['student', 'course']);

        // Get course specific template
        $template = CertificateTemplate::where('course_id', $certificate->course_id)->first();

        if (!$template) {
            // If no active template, simply return a placeholder string or throw exception
            return 'certificates/placeholder.pdf';
        }

        $filename = 'certificates/' . $certificate->certificate_code . '.pdf';

        $bg_base64 = $this->getImageBase64($template->background_image);

        $data = [
            'certificate' => $certificate,
            'template' => $template,
            'layout' => is_string($template->layout_data) ? json_decode($template->layout_data, true) : $template->layout_data,
            'bg_base64' => $bg_base64,
        ];

        // Ensure directory exists
        \Illuminate\Support\Facades\Storage::disk('public')->makeDirectory('certificates');

        // Generate PDF
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('certificate::pdf.certificate', $data)
            ->setPaper('a4', 'landscape')
            ->setWarnings(false);

        \Illuminate\Support\Facades\Storage::disk('public')->put($filename, $pdf->output());

        return '/storage/' . $filename;
    }

    /**
     * Get Base64 encoded image data from path or URL.
     */
    private function getImageBase64(?string $path): ?string
    {
        if (!$path) return null;

        try {
            $imageData = null;
            $mimeType = 'image/jpeg'; // Default

            if (str_starts_with($path, '/storage/')) {
                $localPath = str_replace('/storage/', '', $path);
                if (Storage::disk('public')->exists($localPath)) {
                    $imageData = Storage::disk('public')->get($localPath);
                    $mimeType = Storage::disk('public')->mimeType($localPath);
                }
            } else {
                // Remote URL or OneDrive ID
                $url = $path;

                // If it's a OneDrive ID (doesn't look like a URL)
                if (!filter_var($path, FILTER_VALIDATE_URL) && !str_starts_with($path, 'http')) {
                    $oneDrive = new OneDriveService();
                    $url = $oneDrive->getDownloadUrl($path);
                }

                if ($url) {
                    $response = Http::get($url);
                    if ($response->successful()) {
                        $imageData = $response->body();
                        $mimeType = $response->header('Content-Type') ?: 'image/jpeg';
                    }
                }
            }

            if ($imageData) {
                return 'data:' . $mimeType . ';base64,' . base64_encode($imageData);
            }
        } catch (\Exception $e) {
            Log::error('Certificate Background Fetch Failed', [
                'path' => $path,
                'error' => $e->getMessage()
            ]);
        }

        return null;
    }
}
