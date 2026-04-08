<?php

use App\Services\OneDriveService;
use Illuminate\Support\Facades\Log;

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$sharingUrl = 'https://activtechno-my.sharepoint.com/:v:/g/personal/nabil_activ_co_id/IQBMLdB85GbPR6At6yoE9MsQAZ9TsscHGLzP_q2sZ-mlbYU?e=4WmYO9';
$oneDrive = new OneDriveService();

$accessToken = $oneDrive->getAccessToken();
if (!$accessToken) {
    echo "TOKEN ERROR: No token found\n";
    exit;
}

$encodedUrl = base64_encode($sharingUrl);
$encodedUrl = str_replace(['+', '/', '='], ['-', '_', ''], $encodedUrl);
$encodedUrl = 'u!' . $encodedUrl;

$url = "https://graph.microsoft.com/v1.0/shares/{$encodedUrl}/driveItem";

$response = \Illuminate\Support\Facades\Http::withToken($accessToken)
    ->withHeaders(['Prefer' => 'redeemSharingLinkIfNecessary'])
    ->get($url);

echo "URL: $url\n";
echo "STATUS: " . $response->status() . "\n";
echo "BODY: " . $response->body() . "\n";
