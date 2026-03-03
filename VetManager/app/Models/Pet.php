<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pet extends Model
{
    use HasFactory;

    protected $fillable = ['owner_id', 'name', 'species', 'raza', 'peso', 'fech_nac'];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class);
    }
}
