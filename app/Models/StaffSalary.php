<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffSalary extends Model
{
    use HasFactory;

    protected $table = 'staff_salaries';

    protected $fillable = [
        'staff_id',
        'name',
        'designation',
        'department',
        'salary',
        'month',
        'status',
        'paid_at',
        'payment_method',
        'transaction_reference',
        'notes',
    ];

    protected $casts = [
        'salary' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
