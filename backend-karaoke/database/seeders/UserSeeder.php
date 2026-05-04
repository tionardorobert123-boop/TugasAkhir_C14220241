<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'user_name' => 'Owner',
            'user_email' => 'owner@gmail.com',
            'user_password' => Hash::make('123456'),
            'user_role' => 'owner'
        ]);

        User::create([
            'user_name' => 'Kasir',
            'user_email' => 'kasir@gmail.com',
            'user_password' => Hash::make('123456'),
            'user_role' => 'kasir'
        ]);
    }
}