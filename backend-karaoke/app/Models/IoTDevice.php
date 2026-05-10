<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IoTDevice extends Model
{

    protected $table = 'iot_devices';
    protected $primaryKey = 'device_id';

    protected $fillable = [
        'device_name',
        'status_online',
        'lock_status',
        'door_status',
        'last_seen',
        'miss_count'
    ];

    protected $casts = [
        'last_seen' => 'datetime',
        'status_online' => 'boolean',
        'miss_count' => 'integer',
    ];
}