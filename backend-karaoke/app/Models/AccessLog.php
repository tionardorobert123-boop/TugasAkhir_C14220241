<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccessLog extends Model
{
    protected $primaryKey = 'log_id';

    protected $fillable = [
        'room_id',
        'customer_name',
        'action',
        'status',
        'timestamp'
    ];

    public function room()
    {
        return $this->belongsTo(Room::class, 'room_id');
    }
}
