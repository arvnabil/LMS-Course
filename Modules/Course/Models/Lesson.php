<?php

namespace Modules\Course\Models;

use App\Traits\HasUploadedFiles;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lesson extends Model
{
    use HasUploadedFiles;

    /**
     * Columns that store uploaded file paths (auto-cleanup on update/delete).
     */
    protected array $uploadedFileColumns = ['thumbnail'];

    protected $fillable = [
        'section_id',
        'title',
        'type',
        'video_url',
        'content',
        'order',
        'is_preview',
        'thumbnail',
        'video_source',
        'video_id',
    ];

    protected $casts = [
        'is_preview' => 'boolean',
    ];

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function progress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }
}
