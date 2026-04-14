<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalRecord extends Model
{
    use HasFactory;

    // Los campos que voy a permitir que se rellenen desde React mediante Axios 
    protected $fillable = [
        'pet_id',
        'product_id', // INTEGRADOR CLAVE FASE 3: Material gastado en consulta
        'symptom_title',
        'diagnosis',
        'treatment',
        'attachment_path',
        'attachment_type'
    ];

    // Relación inversa: Un historial pertenece obligatoriamente a una mascota original
    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }

    // Relación opcional cruzada: Esta entrada clínica concreta vació una caja de una medicina determinada
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
