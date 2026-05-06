<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomExtendLog extends Model
{
    protected $fillable = [
        'transaction_id',
        'added_minutes',
        'old_end_time',
        'new_end_time'
    ];

    public function transaction()
    {   
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }
}