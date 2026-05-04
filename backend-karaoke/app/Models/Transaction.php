<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $primaryKey = 'transaction_id';

    protected $fillable = [
        'room_id',
        'customer_name',
        'start_time',
        'end_time',
        'duration',
        'price_per_hour',
        'total_price',
        'status'
    ];

    public function room()
    {
        return $this->belongsTo(Room::class, 'room_id');
    }

    public function extendLogs()
    {
        return $this->hasMany(RoomExtendLog::class, 'transaction_id');
    }
}
