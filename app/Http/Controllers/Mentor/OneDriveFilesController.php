<?php

namespace App\Http\Controllers\Mentor;

use App\Http\Controllers\Controller;
use App\Services\OneDriveService;
use Illuminate\Http\Request;

class OneDriveFilesController extends Controller
{
    public function list(Request $request, $itemId = 'root')
    {
        $oneDrive = new OneDriveService();
        $items = $oneDrive->listChildren($itemId);

        if (is_null($items)) {
            return response()->json(['error' => 'Failed to fetch files from OneDrive.'], 500);
        }

        // Filter and map items
        $formattedItems = array_map(function ($item) {
            return [
                'id' => $item['id'],
                'name' => $item['name'],
                'is_folder' => isset($item['folder']),
                'is_video' => isset($item['video']) || (isset($item['file']['mimeType']) && str_starts_with($item['file']['mimeType'], 'video/')),
                'size' => $item['size'] ?? 0,
                'updated_at' => $item['lastModifiedDateTime'] ?? null,
            ];
        }, $items);

        return response()->json([
            'items' => $formattedItems,
            'current_id' => $itemId
        ]);
    }

    public function resolve(Request $request)
    {
        $request->validate(['url' => 'required|url']);
        
        $oneDrive = new OneDriveService();
        
        if (!$oneDrive->getAccessToken()) {
            return response()->json(['error' => 'OneDrive integration is required to resolve sharing links. Please connect your account in Settings first.'], 422);
        }

        $result = $oneDrive->resolveSharingLink($request->url);

        if ($result && isset($result['id'])) {
            return response()->json([
                'id' => $result['id'],
                'name' => $result['name'] ?? 'Shared Video',
            ]);
        }

        return response()->json(['error' => 'Failed to resolve sharing link. Make sure the link is a valid OneDrive/SharePoint sharing URL and your account has access to it.'], 422);
    }
}
