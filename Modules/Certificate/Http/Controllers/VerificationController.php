<?php

namespace Modules\Certificate\Http\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Modules\Certificate\Models\Certificate;

class VerificationController extends Controller
{
    /**
     * Display the certificate verification page.
     */
    public function index(Request $request)
    {
        $code = $request->query('code');
        $certificate = null;
        $status = 'idle'; // idle, valid, invalid

        if ($code) {
            // Ignore preview codes
            if (str_starts_with($code, 'CERT-EXAMPLE-')) {
                $status = 'invalid';
            } else {
                $certificate = Certificate::with(['student', 'course'])
                    ->where('certificate_code', $code)
                    ->first();

                if ($certificate) {
                    $status = 'valid';
                } else {
                    $status = 'invalid';
                }
            }
        }

        return Inertia::render('Certificate/Verify', [
            'code' => $code,
            'certificate' => $certificate,
            'status' => $status,
        ]);
    }
}
