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

class UploadFileToOneDrive implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 300; // 5 minutes (files are generally smaller than videos)

    protected $lessonId;
    protected $tempFilePath;
    protected $filename;
    protected $folderName;
    protected $originalFileName;
    protected $mimeType;

    /**
     * Create a new job instance.
     */
    public function __construct($lessonId, $tempFilePath, $filename, $folderName, $originalFileName = null, $mimeType = null)
    {
        $this->lessonId = $lessonId;
        $this->tempFilePath = $tempFilePath;
        $this->filename = $filename;
        $this->folderName = $folderName;
        $this->originalFileName = $originalFileName;
        $this->mimeType = $mimeType;
    }

    /**
     * Execute the job.
     */
    public function handle()
    {
        Log::info("Starting Background OneDrive File Upload Job", [
            'lesson_id' => $this->lessonId,
            'filename' => $this->filename,
            'temp_path' => $this->tempFilePath
        ]);

        $lesson = Lesson::find($this->lessonId);
        if (!$lesson) {
            Log::error("Lesson not found for OneDrive File Upload Job", ['id' => $this->lessonId]);
            $this->cleanup();
            return;
        }

        try {
            $oneDrive = new OneDriveService();
            if (!$oneDrive->getAccessToken()) {
                throw new \Exception("OneDrive access token not available.");
            }

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
                    'file_source' => 'onedrive_upload',
                    'file_id' => $result['id'],
                    'file_url' => $result['webUrl'] ?? null,
                    'file_name' => $this->originalFileName,
                    'mime_type' => $this->mimeType,
                ]);

                Log::info("OneDrive File Upload Job Successful", ['lesson_id' => $lesson->id]);
            } else {
                throw new \Exception("OneDrive upload function returned null.");
            }

        } catch (\Exception $e) {
            Log::error("OneDrive File Upload Job Failed", [
                'lesson_id' => $this->lessonId,
                'error' => $e->getMessage()
            ]);
            
            throw $e;
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
            Log::info("Cleaned up temporary file", ['path' => $this->tempFilePath]);
        }
    }
}
