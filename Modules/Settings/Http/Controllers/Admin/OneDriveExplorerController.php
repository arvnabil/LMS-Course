<?php

namespace Modules\Settings\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\OneDriveService;
use Illuminate\Http\Request;

class OneDriveExplorerController extends Controller
{
    protected $oneDrive;

    public function __construct()
    {
        $this->oneDrive = new OneDriveService();
    }

    public function list($itemId = 'root')
    {
        if (!$this->oneDrive->getAccessToken()) {
            return response()->json(['error' => 'OneDrive not connected.'], 401);
        }

        $items = $this->oneDrive->listChildren($itemId);

        if (is_null($items)) {
            return response()->json(['error' => 'Failed to fetch folders.'], 500);
        }

        // Only return folders
        $folders = array_filter($items, function ($item) {
            return isset($item['folder']);
        });

        $formattedFolders = array_map(function ($item) {
            return [
                'id' => $item['id'],
                'name' => $item['name'],
                'updated_at' => $item['lastModifiedDateTime'] ?? null,
            ];
        }, array_values($folders));

        return response()->json([
            'items' => $formattedFolders,
            'current_id' => $itemId
        ]);
    }

    public function createFolder(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'required|string'
        ]);

        if (!$this->oneDrive->getAccessToken()) {
            return response()->json(['error' => 'OneDrive not connected.'], 401);
        }

        // We need to resolve the parent path to use getOrCreateFolder, or implement createFolderById
        $parentPath = '';
        if ($request->parent_id !== 'root') {
            $parentPath = $this->oneDrive->getItemPath($request->parent_id);
            if (!$parentPath) {
                return response()->json(['error' => 'Could not resolve parent folder path.'], 422);
            }
        }

        $folder = $this->oneDrive->getOrCreateFolder($request->name, $parentPath);

        if ($folder) {
            return response()->json([
                'id' => $folder['id'],
                'name' => $folder['name'],
                'path' => $this->oneDrive->getItemPath($folder['id'])
            ]);
        }

        return response()->json(['error' => 'Failed to create folder.'], 500);
    }

    public function resolvePath($itemId)
    {
        if (!$this->oneDrive->getAccessToken()) {
            return response()->json(['error' => 'OneDrive not connected.'], 401);
        }

        $path = $this->oneDrive->getItemPath($itemId);

        if ($path) {
            return response()->json(['path' => $path]);
        }

        return response()->json(['error' => 'Could not resolve path.'], 404);
    }
}
