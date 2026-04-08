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
        $downloadUrl = $this->oneDrive->getDownloadUrl($itemId);

        if (!$downloadUrl) {
            abort(404, 'File not found or access denied.');
        }

        // Try to determine content type from extension (naive but helpful)
        $contentType = 'video/mp4'; // Default to mp4 as it's most common for web
        
        return response()->stream(function () use ($downloadUrl) {
            $stream = fopen($downloadUrl, 'r');
            if ($stream) {
                while (!feof($stream)) {
                    echo fread($stream, 8192 * 4); // Use larger buffer for smoother streaming
                    flush();
                }
                fclose($stream);
            }
        }, 200, [
            'Content-Type' => $contentType,
            'Cache-Control' => 'max-age=86400',
            'Accept-Ranges' => 'bytes',
        ]);
    }
}
