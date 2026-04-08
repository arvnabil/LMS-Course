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

        return response()->stream(function () use ($downloadUrl) {
            $stream = fopen($downloadUrl, 'r');
            while (!feof($stream)) {
                echo fread($stream, 8192);
                flush();
            }
            fclose($stream);
        }, 200, [
            'Content-Type' => 'application/octet-stream',
            // Add other headers if you can retrieve metadata (filename, size)
        ]);
    }
}
