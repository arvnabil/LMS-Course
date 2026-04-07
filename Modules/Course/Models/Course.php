<?php

namespace Modules\Course\Models;

use App\Models\User;
use App\Traits\HasUploadedFiles;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    use SoftDeletes, HasUploadedFiles;

    /**
     * Columns that store uploaded file paths (auto-cleanup on update/delete).
     */
    protected array $uploadedFileColumns = ['thumbnail', 'cover_image'];

    protected $fillable = [
        'mentor_id',
        'category_id',
        'title',
        'slug',
        'tagline',
        'description',
        'thumbnail',
        'cover_image',
        'level',
        'price',
        'status',
        'is_certified',
        'is_featured',
    ];

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(CoursePhoto::class);
    }

    public function sections(): HasMany
    {
        return $this->hasMany(Section::class)->orderBy('order');
    }

    public function lessons(): \Illuminate\Database\Eloquent\Relations\HasManyThrough
    {
        return $this->hasManyThrough(Lesson::class, Section::class);
    }

    public function quizzes(): HasMany
    {
        return $this->hasMany(\Modules\Quiz\Models\Quiz::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(\Modules\Certificate\Models\Certificate::class);
    }

    public function certificateTemplate()
    {
        return $this->hasOne(\Modules\Certificate\Models\CertificateTemplate::class);
    }

    /**
     * Organizations that have access to this course.
     */
    public function organizations(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(\Modules\Organization\Models\Organization::class, 'organization_courses')
            ->withPivot('assigned_at')
            ->withTimestamps();
    }
}
