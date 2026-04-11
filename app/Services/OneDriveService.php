<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\Setting;
use Carbon\Carbon;

class OneDriveService
{
    protected string $clientId;
    protected string $clientSecret;
    protected string $tenantId;
    protected string $redirectUri;
    protected string $basePath;

    public function __construct()
    {
        $settings = \Modules\Settings\Models\Setting::where('group', 'onedrive')->pluck('value', 'key');

        $this->clientId = $settings->get('onedrive_client_id') ?? config('services.onedrive.client_id') ?? '';
        $this->clientSecret = $settings->get('onedrive_client_secret') ?? config('services.onedrive.client_secret') ?? '';
        $this->tenantId = $settings->get('onedrive_tenant_id') ?? config('services.onedrive.tenant_id', 'common') ?? 'common';
        $this->redirectUri = $settings->get('onedrive_redirect_uri') ?? config('services.onedrive.redirect_uri') ?? '';
        $this->basePath = $settings->get('onedrive_base_path') ?? config('services.onedrive.base_path', 'LMS-Course') ?? 'LMS-Course';
    }

    public function getAuthUrl(): string
    {
        $scopes = 'offline_access Files.ReadWrite.All';
        $params = [
            'client_id' => $this->clientId,
            'response_type' => 'code',
            'redirect_uri' => $this->redirectUri,
            'response_mode' => 'query',
            'scope' => $scopes,
        ];

        return "https://login.microsoftonline.com/{$this->tenantId}/oauth2/v2.0/authorize?" . http_build_query($params);
    }

    public function fetchTokenWithCode(string $code): bool
    {
        $response = Http::asForm()->post("https://login.microsoftonline.com/{$this->tenantId}/oauth2/v2.0/token", [
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'code' => $code,
            'redirect_uri' => $this->redirectUri,
            'grant_type' => 'authorization_code',
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $this->storeTokens($data);
            return true;
        }

        Log::error('OneDrive Token Fetch Failed', ['response' => $response->json()]);
        return false;
    }

    protected function storeTokens(array $data): void
    {
        DB::table('onedrive_tokens')->updateOrInsert(
            ['id' => 1], // Central storage
            [
                'access_token' => $data['access_token'],
                'refresh_token' => $data['refresh_token'] ?? null,
                'expires_at' => Carbon::now()->addSeconds($data['expires_in']),
                'updated_at' => Carbon::now(),
            ]
        );
    }

    public function getAccessToken(): ?string
    {
        $token = DB::table('onedrive_tokens')->where('id', 1)->first();

        if (!$token) {
            return null;
        }

        // Refresh if expiring in less than 5 minutes
        if (Carbon::now()->addMinutes(5)->greaterThan(Carbon::parse($token->expires_at))) {
            return $this->refreshToken($token->refresh_token);
        }

        return $token->access_token;
    }

    protected function refreshToken(string $refreshToken): ?string
    {
        $response = Http::asForm()->post("https://login.microsoftonline.com/{$this->tenantId}/oauth2/v2.0/token", [
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'refresh_token' => $refreshToken,
            'grant_type' => 'refresh_token',
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $this->storeTokens($data);
            return $data['access_token'];
        }

        Log::error('OneDrive Token Refresh Failed', ['response' => $response->json()]);
        return null;
    }

    public function uploadFile($fileContent, string $filename, string $folder = '')
    {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) return null;

        // Ensure folders exist
        if ($folder) {
            $this->getOrCreatePath($folder);
        }

        $path = $this->encodePath($this->basePath . ($folder ? '/' . $folder : '') . '/' . $filename);
        $url = "https://graph.microsoft.com/v1.0/me/drive/root:/{$path}:/content";

        Log::debug('OneDrive Uploading Small File', ['path' => $path]);

        $response = Http::withToken($accessToken)
            ->timeout(60)
            ->withBody($fileContent, 'application/octet-stream')
            ->put($url);

        if ($response->successful()) {
            return $response->json();
        }

        Log::error('OneDrive Upload Failed', ['response' => $response.json(), 'path' => $path]);
        return null;
    }

    /**
     * Ensure a deep path exists in OneDrive (e.g., "Courses/thumbnails/2026")
     */
    public function getOrCreatePath(string $path)
    {
        $segments = explode('/', trim($path, '/'));
        $currentPath = '';

        foreach ($segments as $segment) {
            $this->getOrCreateFolder($segment, $currentPath);
            $currentPath = $currentPath ? $currentPath . '/' . $segment : $segment;
        }

        return $currentPath;
    }

    public function getDownloadUrl(string $itemId): ?string
    {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) return null;

        $response = Http::withToken($accessToken)
            ->get("https://graph.microsoft.com/v1.0/me/drive/items/{$itemId}");

        if ($response->successful()) {
            $data = $response->json();
            return $data['@microsoft.graph.downloadUrl'] ?? null;
        }

        return null;
    }

    /**
     * Upload a large file using an upload session (chunked).
     */
    public function uploadLargeFile($filePath, string $filename, string $folder = '')
    {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) return null;

        // Proactively create folder if it's for a specific course
        if ($folder) {
            $this->getOrCreateFolder($folder);
        }

        $path = $this->encodePath($this->basePath . ($folder ? '/' . $folder : '') . '/' . $filename);
        $url = "https://graph.microsoft.com/v1.0/me/drive/root:/{$path}:/createUploadSession";

        Log::debug('OneDrive Creating Upload Session', ['path' => $path]);

        $sessionResponse = Http::withToken($accessToken)
            ->timeout(60)
            ->post($url, [
                'item' => ['@microsoft.graph.conflictBehavior' => 'rename']
            ]);

        if (!$sessionResponse->successful()) {
            Log::error('OneDrive Upload Session Failed', [
                'status' => $sessionResponse->status(),
                'response' => $sessionResponse->json(),
                'path' => $path
            ]);
            return null;
        }

        $uploadUrl = $sessionResponse->json()['uploadUrl'];
        $fileSize = filesize($filePath);
        $chunkSize = 320 * 1024 * 10; // 3.2MB per chunk (must be multiple of 320KB)
        $handle = fopen($filePath, 'rb');
        
        $uploaded = 0;
        $chunkCount = 0;
        
        Log::debug('OneDrive Starting Chunked Upload', [
            'total_size' => $fileSize,
            'chunk_size' => $chunkSize,
            'filename' => $filename
        ]);

        while (!feof($handle)) {
            $chunk = fread($handle, $chunkSize);
            if (empty($chunk)) break;
            
            $end = $uploaded + strlen($chunk) - 1;
            
            $response = Http::withHeaders([
                'Content-Length' => strlen($chunk),
                'Content-Range' => "bytes {$uploaded}-{$end}/{$fileSize}",
            ])
            ->timeout(120) // Give chunks more time
            ->withBody($chunk, 'application/octet-stream')
            ->put($uploadUrl);

            $uploaded = $end + 1;
            $chunkCount++;
            
            if ($chunkCount % 5 === 0) {
                Log::debug('OneDrive Upload Progress', [
                    'uploaded' => $uploaded,
                    'percentage' => round(($uploaded / $fileSize) * 100, 2)
                ]);
            }

            if ($response->successful()) {
                if ($uploaded >= $fileSize) {
                    fclose($handle);
                    Log::debug('OneDrive Upload Completed Successfully', ['filename' => $filename]);
                    return $response->json();
                }
            } else {
                Log::error('OneDrive Chunk Upload Failed', [
                    'chunk' => $chunkCount,
                    'status' => $response->status(),
                    'response' => $response->json()
                ]);
                fclose($handle);
                return null;
            }
        }
        
        fclose($handle);
        return null;
    }

    /**
     * Resolve a OneDrive sharing link into a permanent DriveItem ID.
     * This allows using files already on OneDrive without uploading them.
     */
    public function resolveSharingLink(string $sharingUrl): ?array
    {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) {
            Log::warning('OneDrive Resolve failed: No access token found. Integration required.');
            return null;
        }

        // Try 1: Original URL
        $result = $this->attemptResolve($sharingUrl, $accessToken);
        if ($result) return $result;

        // Try 2: Cleaned URL (Remove query parameters)
        $cleanUrl = explode('?', $sharingUrl)[0];
        if ($cleanUrl !== $sharingUrl) {
            $result = $this->attemptResolve($cleanUrl, $accessToken);
            if ($result) return $result;
        }

        // Try 3: SharePoint specific normalization (sharing links sometimes need specific formatting)
        if (str_contains($sharingUrl, 'sharepoint.com')) {
            // Remove everything after the last colon if it's a redirect link
            // e.g. .../:v:/g/personal/...
            $normalized = preg_replace('/(\/[^:]+:[^:]+:)[^?]+/', '$1', $sharingUrl);
            if ($normalized && $normalized !== $sharingUrl) {
                $result = $this->attemptResolve($normalized, $accessToken);
                if ($result) return $result;
            }
        }

        return null;
    }

    protected function attemptResolve(string $url, string $accessToken): ?array
    {
        $encodedUrl = $this->encodeSharingUrl($url);
        $graphUrl = "https://graph.microsoft.com/v1.0/shares/{$encodedUrl}/driveItem";

        try {
            $response = Http::withToken($accessToken)
                ->withHeaders(['Prefer' => 'redeemSharingLinkIfNecessary'])
                ->get($graphUrl);

            if ($response->successful()) {
                return $response->json();
            }

            // If not found (404), Log debug info but don't treat as fatal error yet
            if ($response->status() !== 404) {
                Log::debug('OneDrive Attempt Resolve Failed', [
                    'url' => $url,
                    'status' => $response->status(),
                    'error' => $response->json()
                ]);
            }
        } catch (\Exception $e) {
            Log::error('OneDrive Attempt Resolve Exception: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Helper to encode sharing URL for Graph API.
     */
    protected function encodeSharingUrl(string $url): string
    {
        $base64Value = base64_encode($url);
        $encodedUrl = str_replace(['+', '/', '='], ['-', '_', ''], $base64Value);
        return 'u!' . $encodedUrl;
    }

    /**
     * List children of a specific folder (defaults to root).
     * Useful for building a "File Picker" or "Folder Browser" in the LMS.
     */
    public function listChildren(string $itemId = 'root'): ?array
    {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) return null;

        $url = "https://graph.microsoft.com/v1.0/me/drive/items/{$itemId}/children";
        
        $response = Http::withToken($accessToken)->get($url);

        if ($response->successful()) {
            return $response->json()['value'];
        }

        return null;
    }

    /**
     * Search for files matching a query in the OneDrive.
     */
    public function search(string $query): ?array
    {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) return null;

        $url = "https://graph.microsoft.com/v1.0/me/drive/root/search(q='{$query}')";
        
        $response = Http::withToken($accessToken)->get($url);

        if ($response->successful()) {
            return $response->json()['value'];
        }

        return null;
    }

    /**
     * Get or create a folder in OneDrive.
     */
    public function getOrCreateFolder(string $folderName, string $parentPath = '')
    {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) return null;

        $parentPath = $parentPath ?: $this->basePath;
        
        // Try to find if folder exists
        $parentPathEncoded = $this->encodePath($parentPath);
        $folderNameEncoded = rawurlencode($folderName);
        $searchUrl = "https://graph.microsoft.com/v1.0/me/drive/root:/{$parentPathEncoded}/{$folderNameEncoded}";
        
        $check = Http::withToken($accessToken)->get($searchUrl);

        if ($check->successful()) {
            return $check->json();
        }

        // Create if not exists
        $createUrl = "https://graph.microsoft.com/v1.0/me/drive/root:/{$parentPathEncoded}:/children";
        $response = Http::withToken($accessToken)->post($createUrl, [
            'name' => $folderName,
            'folder' => (object)[],
            '@microsoft.graph.conflictBehavior' => 'fail'
        ]);

        return $response->successful() ? $response->json() : null;
    }

    /**
     * Rename a DriveItem (file or folder).
     */
    public function renameItem(string $itemId, string $newName): ?array
    {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) return null;

        $url = "https://graph.microsoft.com/v1.0/me/drive/items/{$itemId}";
        
        $response = Http::withToken($accessToken)->patch($url, [
            'name' => $newName
        ]);

        if ($response->successful()) {
            return $response->json();
        }

        Log::error('OneDrive Rename Failed', ['response' => $response->json()]);
        return null;
    }

    /**
     * Get metadata for a specific DriveItem.
     */
    public function getDriveItem(string $itemId): ?array
    {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) return null;

        $url = "https://graph.microsoft.com/v1.0/me/drive/items/{$itemId}";
        $response = Http::withToken($accessToken)->get($url);

        return $response->successful() ? $response->json() : null;
    }

    /**
     * Resolve the readable path for a folder given its Item ID.
     */
    public function getItemPath(string $itemId): ?string
    {
        $item = $this->getDriveItem($itemId);
        if (!$item) return null;

        // Microsoft Graph returns path like "/drive/root:/folder/subfolder"
        // We want to extract just the part after "root:/"
        $fullPath = $item['parentReference']['path'] ?? '';
        $name = $item['name'] ?? '';

        if (str_contains($fullPath, 'root:')) {
            $parts = explode('root:', $fullPath);
            $pathAfterRoot = $parts[1] ?? '';
            $pathAfterRoot = trim($pathAfterRoot, '/');
            
            if ($pathAfterRoot === '') {
                return $name;
            }
            return $pathAfterRoot . '/' . $name;
        }

        return $name;
    }

    /**
     * Get metadata for the folder configured as the platform's root.
     */
    public function getConfiguredRootMetadata(): ?array
    {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) return null;

        $path = trim($this->basePath, '/');
        if (empty($path)) {
            return $this->getDriveItem('root');
        }

        $pathEncoded = $this->encodePath($path);
        $url = "https://graph.microsoft.com/v1.0/me/drive/root:/{$pathEncoded}";
        $response = Http::withToken($accessToken)->get($url);

        return $response->successful() ? $response->json() : null;
    }

    /**
     * Get the Item ID of the configured root folder.
     */
    public function getConfiguredRootId(): string
    {
        $metadata = $this->getConfiguredRootMetadata();
        return $metadata['id'] ?? 'root';
    }

    /**
     * Helper to encode path segments for Microsoft Graph API.
     */
    protected function encodePath(string $path): string
    {
        $segments = explode('/', $path);
        $encodedSegments = array_map(function ($segment) {
            return rawurlencode($segment);
        }, $segments);
        return implode('/', $encodedSegments);
    }
}
