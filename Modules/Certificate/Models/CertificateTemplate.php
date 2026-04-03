<?php

namespace Modules\Certificate\Models;

use Illuminate\Database\Eloquent\Model;

class CertificateTemplate extends Model
{
    protected $fillable = ['course_id', 'background_image', 'layout_data'];

    protected $casts = [
        'layout_data' => 'json',
    ];

    public function course()
    {
        return $this->belongsTo(\Modules\Course\Models\Course::class);
    }
}
