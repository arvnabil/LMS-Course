<?php

namespace App\Http\Controllers;

use App\Services\OneDriveService;
use Illuminate\Http\Request;

class OneDriveAuthController extends Controller
{
    protected OneDriveService $oneDrive;

    public function __construct(OneDriveService $oneDrive)
    {
        $this->oneDrive = $oneDrive;
    }

    public function redirect()
    {
        return redirect()->away($this->oneDrive->getAuthUrl());
    }

    public function callback(Request $request)
    {
        if ($request->has('code')) {
            $success = $this->oneDrive->fetchTokenWithCode($request->code);
            if ($success) {
                return redirect()->route('dashboard')->with('success', 'OneDrive connected successfully!');
            }
        }

        return redirect()->route('dashboard')->with('error', 'Failed to connect OneDrive.');
    }
}
