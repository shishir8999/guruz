<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FooterLink extends Model
{
    protected $guarded = [];

    public function widget()
    {
        return $this->belongsTo(FooterWidget::class, 'footer_widget_id');
    }
}
