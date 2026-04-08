<?php

namespace App\Http\Controllers;

use App\Services\OneDriveService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OneDriveStreamController extends Controller
{
    protected OneDriveService $oneDrive;

    public function __construct(OneDriveService $oneDrive)
    {
        $this->oneDrive = $oneDrive;
    }

    /**
     * Stream a file from OneDrive through the backend.
     * 
     * @param string $itemId
     * @return StreamedResponse
     */
    public function stream(string $itemId)
    {
        \Illuminate\Support\Facades\Log::info("OneDrive Stream Request", ['item_id' => $itemId]);
        
        $downloadUrl = $this->oneDrive->getDownloadUrl($itemId);

        if (!$downloadUrl) {
            \Illuminate\Support\Facades\Log::error("OneDrive Stream Failed: Could not get download URL", ['item_id' => $itemId]);
            abort(404, 'File not found or access denied.');
        }

        // Redirecting to the pre-signed URL is much better for video playback
        // as it supports Range requests and chunked streaming natively.
        return redirect()->away($downloadUrl);
    }
}
