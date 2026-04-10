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
        
        // Fetch metadata to accurately identify mime type and filename
        $metadata = $this->oneDrive->getDriveItem($itemId);
        
        if (!$metadata) {
            \Illuminate\Support\Facades\Log::error("OneDrive Stream Failed: Could not get metadata", ['item_id' => $itemId]);
            abort(404, 'File not found or access denied.');
        }

        $downloadUrl = $metadata['@microsoft.graph.downloadUrl'] ?? null;
        if (!$downloadUrl) {
            \Illuminate\Support\Facades\Log::error("OneDrive Stream Failed: No download URL in metadata", ['item_id' => $itemId]);
            abort(404, 'Download link unavailable.');
        }

        $fileName = $metadata['name'] ?? 'file';
        $mimeType = $metadata['file']['mimeType'] ?? '';
        
        // Accurate detection for PDFs and common browser-supported images
        $isPdf = str_ends_with(strtolower($fileName), '.pdf') || $mimeType === 'application/pdf';
        $isImage = str_starts_with($mimeType, 'image/') && preg_match('/\.(jpg|jpeg|png|gif|webp|svg|bmp)/i', $fileName);

        if ($isPdf || $isImage) {
            $response = Http::get($downloadUrl);
            if ($response->successful()) {
                // Determine the correct content type (prefer application/pdf for PDFs)
                $finalContentType = $isPdf ? 'application/pdf' : ($response->header('Content-Type') ?: $mimeType);
                
                return response($response->body(), 200, [
                    'Content-Type' => $finalContentType,
                    'Content-Disposition' => 'inline; filename="' . $fileName . '"',
                    'Cache-Control' => 'public, max-age=3600',
                ]);
            }
        }

        // Redirecting to the pre-signed URL for video files
        // (Redirect usually triggers a download for non-browser-handled types, 
        // but for videos it's needed for Range support).
        return redirect()->away($downloadUrl);
    }
}
