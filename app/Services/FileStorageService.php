<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Modules\Settings\Models\Setting;
use App\Services\OneDriveService;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;

class FileStorageService
{
    /**
     * Store an uploaded file to the configured favorite storage.
     * 
     * @param UploadedFile $file
     * @param string $folderPath (e.g., 'courses/thumbnails')
     * @return string Path or URL to the stored file
     */
    public static function store(UploadedFile $file, string $folderPath)
    {
        $provider = Setting::get_value('default_storage_provider', 'local');

        if ($provider === 'onedrive') {
            try {
                $oneDrive = new OneDriveService();
                if ($oneDrive->getAccessToken()) {
                    $filename = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '-' . time() . '.' . $file->getClientOriginalExtension();
                    
                    // Normalize folder path for OneDrive (ensure it starts with storage/)
                    $normalizedFolder = trim($folderPath, '/');
                    if (!str_starts_with($normalizedFolder, 'storage')) {
                        $normalizedFolder = 'storage/' . $normalizedFolder;
                    }
                    
                    // OneDrive upload
                    $result = $oneDrive->uploadFile($file->get(), $filename, $normalizedFolder);
                    
                    if ($result && isset($result['id'])) {
                        // Return the internal proxy URL instead of webUrl
                        return route('onedrive.public.show', $result['id']);
                    }
                }
            } catch (\Exception $e) {
                \Log::error("OneDrive Upload Failed in FileStorageService: " . $e->getMessage());
                // Fallback to local
            }
        }

        // Default: Local Storage (Public disk)
        $path = $file->store($folderPath, 'public');
        return '/storage/' . $path;
    }

    /**
     * Delete a file from the correct storage.
     */
    public static function delete(?string $path)
    {
        if (!$path) return;

        // 1. Handle OneDrive Proxy URL (Internal)
        if (str_contains($path, '/storage/onedrive/')) {
            try {
                $itemId = last(explode('/', $path));
                $oneDrive = new OneDriveService();
                $oneDrive->deleteItem($itemId);
            } catch (\Exception $e) {
                \Log::error("OneDrive Proxy Deletion Failed: " . $e->getMessage());
            }
            return;
        }

        // 2. Handle Direct OneDrive/SharePoint URL (Legacy)
        if (str_starts_with($path, 'https://') && (
            str_contains($path, 'sharepoint.com') || 
            str_contains($path, '1drv.ms') || 
            str_contains($path, 'microsoft.com')
        )) {
            try {
                $oneDrive = new OneDriveService();
                $oneDrive->deleteByUrl($path);
            } catch (\Exception $e) {
                \Log::error("OneDrive Deletion Failed in FileStorageService: " . $e->getMessage());
            }
            return;
        }

        // 3. Local deletion
        $localPath = str_replace('/storage/', '', $path);
        Storage::disk('public')->delete($localPath);
    }
}
