<?php

namespace Modules\Course\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Modules\Course\Models\Lesson;
use App\Services\OneDriveService;

class UploadVideoToOneDrive implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 600; // 10 minutes

    protected $lessonId;
    protected $tempFilePath;
    protected $filename;
    protected $folderName;

    /**
     * Create a new job instance.
     */
    public function __construct($lessonId, $tempFilePath, $filename, $folderName)
    {
        $this->lessonId = $lessonId;
        $this->tempFilePath = $tempFilePath;
        $this->filename = $filename;
        $this->folderName = $folderName;
    }

    /**
     * Execute the job.
     */
    public function handle()
    {
        Log::info("Starting Background OneDrive Upload Job", [
            'lesson_id' => $this->lessonId,
            'filename' => $this->filename,
            'temp_path' => $this->tempFilePath
        ]);

        $lesson = Lesson::find($this->lessonId);
        if (!$lesson) {
            Log::error("Lesson not found for OneDrive Upload Job", ['id' => $this->lessonId]);
            $this->cleanup();
            return;
        }

        try {
            $oneDrive = new OneDriveService();
            if (!$oneDrive->getAccessToken()) {
                throw new \Exception("OneDrive access token not available.");
            }

            // Get absolute path for the temporary local file using the disk
            if (!Storage::disk('local')->exists($this->tempFilePath)) {
                throw new \Exception("Temporary file not found on disk: {$this->tempFilePath}");
            }

            $absolutePath = Storage::disk('local')->path($this->tempFilePath);

            $onedriveFolder = $this->folderName;
            if (!str_starts_with(trim($onedriveFolder, '/'), 'storage')) {
                $onedriveFolder = 'storage/' . trim($onedriveFolder, '/');
            }

            $result = $oneDrive->uploadLargeFile($absolutePath, $this->filename, $onedriveFolder);

            if ($result) {
                $lesson->update([
                    'video_source' => 'onedrive_upload',
                    'video_id' => $result['id'],
                    'video_url' => $result['webUrl'] ?? null,
                ]);

                Log::info("OneDrive Upload Job Successful", ['lesson_id' => $lesson->id]);
            } else {
                throw new \Exception("OneDrive upload function returned null.");
            }

        } catch (\Exception $e) {
            Log::error("OneDrive Upload Job Failed", [
                'lesson_id' => $this->lessonId,
                'error' => $e->getMessage()
            ]);
            
            throw $e; // Re-throw to trigger Laravel's retry mechanism
        } finally {
            $this->cleanup();
        }
    }

    /**
     * Cleanup the temporary local file.
     */
    protected function cleanup()
    {
        if (Storage::disk('local')->exists($this->tempFilePath)) {
            Storage::disk('local')->delete($this->tempFilePath);
            Log::info("Cleaned up temporary video file", ['path' => $this->tempFilePath]);
        }
    }
}
