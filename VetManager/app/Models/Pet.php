<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pet extends Model
{
    use HasFactory;

    protected $fillable = ['owner_id', 'name', 'species', 'raza', 'fech_nac', 'peso'];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class);
    }
}
