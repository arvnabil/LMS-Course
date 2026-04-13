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

        // Optimized Proxy with Single-Pass Streaming
        $range = request()->header('Range');
        $headers = $range ? ['Range' => $range] : [];

        $response = Http::withHeaders($headers)
            ->withOptions([
                'stream' => true,
                'verify' => false,
            ])->get($downloadUrl);

        $status = $response->status();
        $oneDriveHeaders = $response->headers();

        // Pass through essential headers for video playback
        $filteredHeaders = [
            'Content-Type' => $oneDriveHeaders['Content-Type'][0] ?? ($mimeType ?: 'video/mp4'),
            'Content-Disposition' => 'inline; filename="' . $fileName . '"',
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'no-cache',
        ];

        if (isset($oneDriveHeaders['Content-Range'])) {
            $filteredHeaders['Content-Range'] = $oneDriveHeaders['Content-Range'][0];
        }
        
        if (isset($oneDriveHeaders['Content-Length'])) {
            $filteredHeaders['Content-Length'] = $oneDriveHeaders['Content-Length'][0];
        }

        return response()->stream(function () use ($response) {
            $body = $response->toPsrResponse()->getBody();
            while (!$body->eof()) {
                echo $body->read(1024 * 64);
                if (connection_aborted()) break;
                flush();
            }
        }, $status, $filteredHeaders);
    }
}
