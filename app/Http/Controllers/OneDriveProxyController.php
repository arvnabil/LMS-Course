<?php

namespace App\Http\Controllers;

use App\Services\OneDriveService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class OneDriveProxyController extends Controller
{
    /**
     * Redirect public requests for OneDrive files to a fresh, public download URL.
     * This bypasses the need for SharePoint/OneDrive login for guest users.
     */
    public function show($itemId)
    {
        try {
            // Cache the download URL for 1 hour (Graph API links usually last 1 hour)
            $url = Cache::remember("onedrive_public_url_{$itemId}", 3500, function () use ($itemId) {
                $oneDrive = new OneDriveService();
                $downloadUrl = $oneDrive->getDownloadUrl($itemId);
                
                if (!$downloadUrl) {
                    Log::warning("OneDrive Proxy: Could not get download URL for item {$itemId}");
                }
                
                return $downloadUrl;
            });

            if (!$url) {
                return abort(404, 'File not found on OneDrive or permission denied.');
            }

            return redirect($url);
        } catch (\Exception $e) {
            Log::error("OneDrive Proxy Error: " . $e->getMessage());
            return abort(500, 'Internal server error while fetching file.');
        }
    }
}
