<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $primaryKey = 'room_id';

    protected $fillable = [
        'room_name',
        'room_type',
        'price_per_hour',
        'status',
        'iot_device_id'
    ];

    public function iotDevice()
    {
        return $this->belongsTo(IotDevice::class, 'iot_device_id', 'device_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'room_id');
    }

    public function logs()
    {
        return $this->hasMany(AccessLog::class, 'room_id');
    }

     public function activeTransaction()
    {
        return $this->hasOne(Transaction::class, 'room_id')
                    ->where('status', 'active');
    }
}
