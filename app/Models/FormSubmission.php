<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormSubmission extends Model
{
    use HasFactory;

    protected $table = 'form_submissions';

    protected $fillable = [
        'form_name',
        'name',
        'email',
        'phone',
        'message',
        'extra',
        'status',
    ];

    protected $casts = [
        'extra' => 'array',
    ];
}
