<?php

namespace App\Models;

use App\Traits\HasUploadedFiles;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles, HasUploadedFiles;

    /**
     * Columns that store uploaded file paths (auto-cleanup on update/delete).
     */
    protected array $uploadedFileColumns = ['avatar'];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'full_name',
        'email',
        'password',
        'phone',
        'gender',
        'role',
        'avatar',

    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Check if user is mentor.
     */
    public function isMentor(): bool
    {
        return $this->hasRole('mentor');
    }

    /**
     * Check if user is student.
     */
    public function isStudent(): bool
    {
        return $this->hasRole('student');
    }



    /**
     * Accessor for 'name' attribute for Breeze compatibility.
     */
    public function getNameAttribute(): string
    {
        return $this->full_name;
    }

    /**
     * Accessor for avatar URL — returns full public URL or null.
     */
    public function getAvatarUrlAttribute(): ?string
    {
        if (!$this->avatar) {
            return null;
        }

        return \Illuminate\Support\Facades\Storage::disk('public')->url($this->avatar);
    }

    /**
     * Courses mentored by this user.
     */
    public function mentoredCourses(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\Modules\Course\Models\Course::class, 'mentor_id');
    }

    /**
     * Courses enrolled by this student.
     */
    public function enrollments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\Modules\Course\Models\Enrollment::class, 'student_id');
    }

    /**
     * Certificates earned by this student.
     */
    public function certificates(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\Modules\Certificate\Models\Certificate::class, 'student_id');
    }

    /**
     * Transactions made by this user.
     */
    public function transactions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\Modules\Payment\Models\Transaction::class, 'student_id');
    }

    /**
     * Earnings for this mentor.
     */
    public function earnings(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\Modules\Payment\Models\MentorEarning::class, 'mentor_id');
    }

    /**
     * Withdrawals by this mentor.
     */
    public function withdrawals(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\Modules\Payment\Models\MentorWithdrawal::class, 'mentor_id');
    }


    /**
     * Organizations this user belongs to.
     */
    public function organizations(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(\Modules\Organization\Models\Organization::class, 'organization_members')
            ->withPivot('role', 'joined_at')
            ->withTimestamps();
    }

}
