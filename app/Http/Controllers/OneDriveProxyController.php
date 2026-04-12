<?php

namespace App\Http\Controllers;

use App\Services\OneDriveService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class OneDriveProxyController extends Controller
{
    /**
     * Proxy OneDrive file content with inline headers for live previews.
     * This ensures Microsoft Office Viewer and PDF viewers can render the file 
     * without triggering an automatic download.
     */
    public function show($itemId)
    {
        try {
            $oneDrive = new OneDriveService();
            
            // Get file metadata to determine filename and mimetype
            $item = Cache::remember("onedrive_item_meta_{$itemId}", 3600, function () use ($oneDrive, $itemId) {
                return $oneDrive->getDriveItem($itemId);
            });

            if (!$item) {
                return abort(404, 'File not found on OneDrive.');
            }

            $mimeType = $item['file']['mimeType'] ?? 'application/octet-stream';
            $fileName = $item['name'] ?? 'file';

            // Auto-heal: Fix missing metadata in database for existing lessons
            try {
                \Illuminate\Support\Facades\DB::table('lessons')
                    ->where('file_id', $itemId)
                    ->where(function($query) {
                        $query->whereNull('mime_type')
                              ->orWhereNull('file_name')
                              ->orWhere('mime_type', 'application/octet-stream');
                    })
                    ->update([
                        'mime_type' => $mimeType,
                        'file_name' => $fileName,
                        'updated_at' => now(),
                    ]);
            } catch (\Exception $e) {
                // Silently fail database update to not block the file delivery
                Log::debug("OneDrive Auto-Heal Failed: " . $e->getMessage());
            }

            // Get a fresh signed download URL
            $url = $oneDrive->getDownloadUrl($itemId);
            
            if (!$url) {
                return abort(404, 'Could not generate download link.');
            }

            // Stream the file content directly
            return response()->stream(function () use ($url) {
                $response = \Illuminate\Support\Facades\Http::withOptions(['stream' => true])->get($url);
                $body = $response->toPsrResponse()->getBody();
                
                while (!$body->eof()) {
                    echo $body->read(1024 * 8); // 8KB chunks
                    if (connection_aborted()) break;
                    flush();
                }
            }, 200, [
                'Content-Type' => $mimeType,
                'Content-Disposition' => 'inline; filename="' . $fileName . '"',
                'Cache-Control' => 'public, max-age=3600',
            ]);
            
        } catch (\Exception $e) {
            Log::error("OneDrive Proxy Error: " . $e->getMessage());
            return abort(500, 'Internal server error while fetching file.');
        }
    }
}
