<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Modules\Course\Models\Course;
use Modules\Course\Models\Category;
use App\Services\OneDriveService;
use Illuminate\Support\Facades\Log;

class FixOneDriveLinks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'onedrive:fix-links';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate broken OneDrive webUrls to stable internal proxy URLs';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting OneDrive Link Migration...');
        $oneDrive = new OneDriveService();

        // 1. Fix User Avatars
        $this->info('Processing User Avatars...');
        User::whereNotNull('avatar')
            ->where('avatar', 'like', 'https://%')
            ->where('avatar', 'not like', '%/storage/onedrive/%')
            ->chunk(100, function ($users) use ($oneDrive) {
                foreach ($users as $user) {
                    $this->processItem($user, 'avatar', $oneDrive);
                }
            });

        // 2. Fix Course Thumbnails & Covers
        $this->info('Processing Course Images...');
        Course::where(function ($q) {
                $q->where(function($sq) {
                    $sq->where('thumbnail', 'like', 'https://%')
                       ->where('thumbnail', 'not like', '%/storage/onedrive/%');
                })
                ->orWhere(function($sq) {
                    $sq->where('cover_image', 'like', 'https://%')
                       ->where('cover_image', 'not like', '%/storage/onedrive/%');
                });
            })
            ->chunk(100, function ($courses) use ($oneDrive) {
                foreach ($courses as $course) {
                    $this->processItem($course, 'thumbnail', $oneDrive);
                    $this->processItem($course, 'cover_image', $oneDrive);
                }
            });

        // 3. Fix Category Icons
        $this->info('Processing Category Icons...');
        Category::whereNotNull('icon')
            ->where('icon', 'like', 'https://%')
            ->where('icon', 'not like', '%/storage/onedrive/%')
            ->get()
            ->each(function ($cat) use ($oneDrive) {
                $this->processItem($cat, 'icon', $oneDrive);
            });

        $this->info('Migration completed.');
    }

    protected function processItem($model, $column, $oneDrive)
    {
        $url = $model->$column;
        if (!$url || !str_starts_with($url, 'https://')) return;

        // Skip if already proxied
        if (str_contains($url, '/storage/onedrive/')) return;

        // Only process OneDrive/SharePoint links
        if (!str_contains($url, 'sharepoint.com') && 
            !str_contains($url, '1drv.ms') && 
            !str_contains($url, 'microsoft.com')) {
            return;
        }

        $this->line("Resolving: {$url}");

        $result = $oneDrive->resolveSharingLink($url);
        if ($result && isset($result['id'])) {
            $proxyUrl = route('onedrive.public.show', $result['id']);
            $model->update([$column => $proxyUrl]);
            $this->info("  -> Fixed: {$proxyUrl}");
        } else {
            $this->error("  -> Failed to resolve ID for this link.");
        }
    }
}
