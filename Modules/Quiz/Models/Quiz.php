<?php

namespace Modules\Quiz\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quiz extends Model
{
    protected $fillable = [
        'course_id',
        'section_id',
        'title',
        'description',
        'type',
        'passing_score',
        'is_required_for_certificate',
        'order',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(\Modules\Course\Models\Course::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(\Modules\Course\Models\Section::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class)->orderBy('order');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }
}
