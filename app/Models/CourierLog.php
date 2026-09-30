<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourierLog extends Model
{
    use HasFactory;

    protected $table = 'courier_logs';

    protected $fillable = [
        'courier',
        'endpoint',
        'status',
        'status_code',
        'payload',
        'response',
        'tracking_id',
        'order_id',
    ];

    protected $casts = [
        'status_code' => 'integer',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
