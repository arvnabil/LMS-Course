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
            // Determine the correct content type
            $finalContentType = $isPdf ? 'application/pdf' : $mimeType;

            return response()->stream(function () use ($downloadUrl) {
                $response = \Illuminate\Support\Facades\Http::withOptions(['stream' => true])->get($downloadUrl);
                $body = $response->toPsrResponse()->getBody();
                
                while (!$body->eof()) {
                    echo $body->read(1024 * 8); // 8KB chunks
                    if (connection_aborted()) break;
                    flush();
                }
            }, 200, [
                'Content-Type' => $finalContentType,
                'Content-Disposition' => 'inline; filename="' . $fileName . '"',
                'Cache-Control' => 'public, max-age=3600',
            ]);
        }

        // THE "HOLY GRAIL" SOLUTION: ANONYMOUS SHARING LINK
        // This creates a public-but-hidden link that bypasses all login walls and session timeouts.
        $service = new \App\Services\OneDriveService();
        $accessToken = $service->getAccessToken();
        
        if (!$accessToken) {
            return redirect()->away($downloadUrl);
        }

        // 1. Create a sharing link (view-only, anonymous)
        // This makes the link accessible to anyone without a Microsoft login
        $sharingResponse = Http::withToken($accessToken)
            ->post("https://graph.microsoft.com/v1.0/me/drive/items/{$itemId}/createLink", [
                'type' => 'view',
                'scope' => 'anonymous'
            ]);

        if ($sharingResponse->successful()) {
            $webUrl = $sharingResponse->json()['link']['webUrl'];
            
            // 2. Convert raw webUrl to a Direct Download URL
            // This is the magic trick to get a stable, fast, anonymous stream
            $finalUrl = $webUrl . (str_contains($webUrl, '?') ? '&' : '?') . 'download=1';
            
            return redirect()->away($finalUrl);
        }

        // Fallback to original method if sharing link creation fails
        return redirect()->away($downloadUrl);
    }
}
