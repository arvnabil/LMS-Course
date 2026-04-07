<?php

namespace Modules\Course\Models;

use App\Traits\HasUploadedFiles;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CoursePhoto extends Model
{
    use HasUploadedFiles;

    /**
     * Columns that store uploaded file paths (auto-cleanup on update/delete).
     */
    protected array $uploadedFileColumns = ['photo'];

    protected $fillable = ['course_id', 'photo', 'order'];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
