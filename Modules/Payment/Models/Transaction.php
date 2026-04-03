<?php

namespace Modules\Payment\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Transaction extends Model
{
    protected $fillable = [
        'student_id',
        'course_id',
        'order_id',
        'amount',
        'status',
        'payment_type',
        'payment_gateway_response',
    ];

    protected $casts = [
        'payment_gateway_response' => 'json',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(\Modules\Course\Models\Course::class);
    }

    public function earning(): HasOne
    {
        return $this->hasOne(MentorEarning::class);
    }
}
