<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccessLog extends Model
{
    protected $primaryKey = 'log_id';

    protected $fillable = [
        'temp_id',
        'room_id',
        'customer_name',
        'room_status',
        'duration',
        'timestamp',

    ];

    protected $casts = [
        'timestamp' => 'datetime',
    ];

    public function room()
    {
        return $this->belongsTo(Room::class, 'room_id');
    }
}
