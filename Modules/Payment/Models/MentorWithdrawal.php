<?php

namespace Modules\Payment\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MentorWithdrawal extends Model
{
    protected $fillable = [
        'mentor_id',
        'amount',
        'status',
        'bank_name',
        'account_number',
        'account_name',
        'notes',
    ];

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }
}
