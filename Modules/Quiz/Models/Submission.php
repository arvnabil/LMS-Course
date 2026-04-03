<?php

namespace Modules\Quiz\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Submission extends Model
{
    protected $fillable = [
        'enrollment_id',
        'quiz_id',
        'submission_text',
        'file_url',
        'status',
        'score',
        'mentor_feedback',
    ];

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(\Modules\Course\Models\Enrollment::class);
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }
}
