<?php

namespace Modules\Certificate\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

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
}
