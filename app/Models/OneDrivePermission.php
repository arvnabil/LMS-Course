<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OneDrivePermission extends Model
{
    protected $table = 'onedrive_permissions';

    protected $fillable = [
        'user_id',
        'can_use_shared_link',
        'can_upload',
        'can_use_library',
    ];

    protected $casts = [
        'can_use_shared_link' => 'boolean',
        'can_upload' => 'boolean',
        'can_use_library' => 'boolean',
    ];

    /**
     * Get the user that owns the permission.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
