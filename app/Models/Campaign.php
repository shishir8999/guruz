<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'title',
        'banner',
        'status',
        'audience',
        'views',
        'conversion',
        'start_date',
        'end_date',
    ];
}
