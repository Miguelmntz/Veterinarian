<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    // Campos del catálogo y almacén que Laravel me dejará tocar desde Axios en React
    protected $fillable = [
        'name',
        'description',
        'price',
        'stock_quantity',
        'min_stock_alert'
    ];

    // Casteos al vuelo: me aseguro de que el precio viaje como decimal a React,
    // que a veces MySQL y Axios se pelean devolviendo strings en vez de numeritos.
    protected $casts = [
        'price' => 'float',
        'stock_quantity' => 'integer',
        'min_stock_alert' => 'integer',
    ];

    // Estrechando lazos: Un producto concreto (ej: Vacuna Rabia) ha podido ser pinchado en mil historiales médicos distintos
    public function medicalRecords()
    {
        return $this->hasMany(MedicalRecord::class);
    }
}
