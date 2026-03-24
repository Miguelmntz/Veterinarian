<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'pet_id',
        'title',
        'start_time',
        'end_time',
        'notes',
        'status',
        'type'
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'end_time' => 'datetime',
        ];
    }

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }

    public function owner()
    {
        return $this->belongsTo(Owner::class);
    }
}
