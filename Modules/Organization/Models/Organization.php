<?php

namespace Modules\Organization\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Organization extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'logo',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (Organization $org) {
            if (empty($org->slug)) {
                $org->slug = Str::slug($org->name);
            }
        });
    }

    /**
     * Members of this organization.
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'organization_members')
            ->withPivot('role', 'joined_at')
            ->withTimestamps();
    }

    /**
     * Raw member pivot records.
     */
    public function memberRecords(): HasMany
    {
        return $this->hasMany(OrganizationMember::class);
    }

    /**
     * Courses assigned to this organization.
     */
    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(\Modules\Course\Models\Course::class, 'organization_courses')
            ->withPivot('assigned_at')
            ->withTimestamps();
    }

    /**
     * Raw course pivot records.
     */
    public function courseRecords(): HasMany
    {
        return $this->hasMany(OrganizationCourse::class);
    }
}
