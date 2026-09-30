<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorLandingSection extends Model
{
    use HasFactory;

    protected $table = 'vendor_landing_sections';

    protected $fillable = [
        'section_id',
        'name',
        'content_type',
        'visibility',
        'status',
        'description',
        'position',
    ];
}
