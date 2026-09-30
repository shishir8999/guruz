<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FooterWidget extends Model
{
    protected $guarded = [];

    public function links()
    {
        return $this->hasMany(FooterLink::class)->orderBy('position');
    }
}
