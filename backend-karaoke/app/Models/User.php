<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    //custom primary key
    protected $primaryKey = 'user_id';

    //kolom yang boleh diisi
    protected $fillable = [
        'user_name',
        'user_email',
        'user_password',
        'user_role'
    ];

    //hidden field
    protected $hidden = [
        'user_password',
        'remember_token',
    ];

    // ⚙️ casting
    protected function casts(): array
    {
        return [
            'user_password' => 'hashed',
        ];
    }

    // 🔑 override auth password (WAJIB karena pakai custom column)
    public function getAuthPassword()
    {
        return $this->user_password;
    }

    // 🔥 override email field (PENTING)
    public function getAuthIdentifierName()
    {
        return 'user_email';
    }
}