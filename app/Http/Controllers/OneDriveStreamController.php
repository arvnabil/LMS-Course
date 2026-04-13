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

        // Optimized Hybrid Proxy (Direct Stream without Redirect)
        // This fixes browser "Seeking" issues that happen with Redirects
        set_time_limit(0); 

        $range = request()->header('Range');
        $opts = [
            'http' => [
                'method' => 'GET',
                'header' => $range ? "Range: {$range}\r\n" : ""
            ]
        ];

        $context = stream_context_create($opts);
        $stream = @fopen($downloadUrl, 'rb', false, $context);

        if (!$stream) {
            return redirect()->away($downloadUrl); // Fallback to redirect if proxy fails
        }

        // Extract metadata from the stream headers
        $meta = stream_get_meta_data($stream);
        $headers = $meta['wrapper_data'] ?? [];
        
        $responseHeaders = [
            'Content-Type' => $mimeType ?: 'video/mp4',
            'Content-Disposition' => 'inline; filename="' . $fileName . '"',
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'no-cache',
        ];

        foreach ($headers as $header) {
            if (stripos($header, 'Content-Range:') === 0) $responseHeaders['Content-Range'] = trim(substr($header, 14));
            if (stripos($header, 'Content-Length:') === 0) $responseHeaders['Content-Length'] = trim(substr($header, 15));
        }

        return response()->stream(function () use ($stream) {
            while (!feof($stream)) {
                echo fread($stream, 1024 * 128); // 128KB chunks
                flush();
            }
            fclose($stream);
        }, isset($responseHeaders['Content-Range']) ? 206 : 200, $responseHeaders);
    }
}
