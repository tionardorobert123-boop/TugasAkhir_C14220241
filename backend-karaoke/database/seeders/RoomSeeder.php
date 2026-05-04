<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = [
            [
                'room_id' => 1,
                'iot_device_id' => 1,
                'room_name' => '1',
                'room_type' => 'regular',
                'status' => 'available'
            ],
            [
                'room_id' => 2,
                'iot_device_id' => 2,
                'room_name' => '2',
                'room_type' => 'regular',
                'status' => 'available'
            ],
            [
                'room_id' => 3,
                'iot_device_id' => 3,
                'room_name' => '3',
                'room_type' => 'regular',
                'status' => 'available'
            ],
            [
                'room_id' => 4,
                'iot_device_id' => 4,
                'room_name' => '4',
                'room_type' => 'vip',
                'status' => 'disabled'
            ],
            [
                'room_id' => 5,
                'iot_device_id' => 5,
                'room_name' => '5',
                'room_type' => 'vip',
                'status' => 'disabled'
            ],
            [
                'room_id' => 6,
                'iot_device_id' => 6,
                'room_name' => '6',
                'room_type' => 'regular',
                'status' => 'available'
            ],
            [
                'room_id' => 7,
                'iot_device_id' => 7,
                'room_name' => '7',
                'room_type' => 'regular',
                'status' => 'available'
            ],
            [
                'room_id' => 8,
                'iot_device_id' => 8,
                'room_name' => '8',
                'room_type' => 'regular',
                'status' => 'available'
            ],
            [
                'room_id' => 9,
                'iot_device_id' => 9,
                'room_name' => '9',
                'room_type' => 'regular',
                'status' => 'disabled'
            ],
            [
                'room_id' => 10,
                'iot_device_id' => 10,
                'room_name' => '10',
                'room_type' => 'regular',
                'status' => 'disabled'
            ],
            [
                'room_id' => 11,
                'iot_device_id' => 11,
                'room_name' => '11',
                'room_type' => 'regular',
                'status' => 'disabled'
            ],
            [
                'room_id' => 12,
                'iot_device_id' => 12,
                'room_name' => '12',
                'room_type' => 'regular',
                'status' => 'disabled'
            ],
        ];

        foreach ($rooms as &$room) {
            $room['created_at'] = now();
            $room['updated_at'] = now();
        }

        DB::table('rooms')->insert($rooms);
    }
}