<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffPermission extends Model
{
    use HasFactory;

    protected $table = 'staff_permissions';

    protected $fillable = [
        'user_id',
        'permission',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
