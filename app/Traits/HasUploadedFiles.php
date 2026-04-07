<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;

/**
 * Trait HasUploadedFiles
 *
 * Automatically deletes old files from storage when file columns are updated or when the model is deleted.
 *
 * Usage: Add `use HasUploadedFiles;` to your model and define
 * a `$uploadedFileColumns` property listing the columns that store file paths.
 *
 * Example:
 *   protected array $uploadedFileColumns = ['avatar'];
 *   // or for multiple:
 *   protected array $uploadedFileColumns = ['thumbnail', 'cover_image'];
 *
 * The trait assumes files are stored on the 'public' disk.
 * If a column stores paths prefixed with '/storage/', the trait
 * will strip that prefix before checking the disk.
 */
trait HasUploadedFiles
{
    /**
     * Boot the trait: register updating & deleting model events.
     */
    public static function bootHasUploadedFiles(): void
    {
        // On update: delete old files for any dirty file columns
        static::updating(function ($model) {
            foreach ($model->getUploadedFileColumns() as $column) {
                if ($model->isDirty($column) && $model->getOriginal($column)) {
                    static::deleteFileFromStorage($model->getOriginal($column));
                }
            }
        });

        // On delete: delete all associated files
        static::deleting(function ($model) {
            foreach ($model->getUploadedFileColumns() as $column) {
                if ($model->{$column}) {
                    static::deleteFileFromStorage($model->{$column});
                }
            }
        });
    }

    /**
     * Get the list of columns that store uploaded file paths.
     */
    public function getUploadedFileColumns(): array
    {
        return $this->uploadedFileColumns ?? [];
    }

    /**
     * Delete a file from the public storage disk.
     * Handles paths with or without '/storage/' prefix.
     */
    protected static function deleteFileFromStorage(?string $path): void
    {
        if (!$path) {
            return;
        }

        // Normalize: strip '/storage/' prefix if present
        $cleanPath = preg_replace('#^/?storage/#', '', $path);

        if (Storage::disk('public')->exists($cleanPath)) {
            Storage::disk('public')->delete($cleanPath);
        }
    }
}
