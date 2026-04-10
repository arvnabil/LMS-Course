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

        // Check if it's a video file based on common video extensions or by calling Graph API for metadata
        // For simplicity and performance, we'll check the download URL's query params or the extension if available.
        // But since we want the best UX, let's proxy documents/images and redirect videos.
        
        $isPdf = str_contains(strtolower($downloadUrl), '.pdf');
        $isImage = preg_match('/\.(jpg|jpeg|png|gif|webp|svg|bmp)/i', $downloadUrl);

        if ($isPdf || $isImage) {
            $response = Http::get($downloadUrl);
            if ($response->successful()) {
                $contentType = $response->header('Content-Type');
                return response($response->body(), 200, [
                    'Content-Type' => $contentType,
                    'Content-Disposition' => 'inline',
                    'Cache-Control' => 'public, max-age=3600',
                ]);
            }
        }

        // Redirecting to the pre-signed URL is much better for video playback
        // as it supports Range requests and chunked streaming natively.
        return redirect()->away($downloadUrl);
    }
}
