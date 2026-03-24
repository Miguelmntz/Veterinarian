<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Creo la tabla para los historiales clínicos de las mascotas.
        // Aquí meteré cada consulta, diagnóstico y los PDFs o radiografías que suba.
        Schema::create('medical_records', function (Blueprint $table) {
            $table->id();
            // Esta es la clave foránea hacia la mascota. Si borro la mascota, me cargo su historial (cascadeOnDelete)
            $table->foreignId('pet_id')->constrained('pets')->cascadeOnDelete();
            
            // Motivo principal de la consulta
            $table->string('symptom_title');
            
            // El tocho de texto que escribe el veterinario
            $table->text('diagnosis')->nullable();
            $table->text('treatment')->nullable();
            
            // Opcional: Ruta al archivo (la radiografía, resultado lab, pdf...)
            // Lo dejo nullable porque no siempre le harán pruebas a las mascotas
            $table->string('attachment_path')->nullable();
            // Guardo el tipo de archivo por si luego quiero poner un icono distinto a un pdf que a un jpg
            $table->string('attachment_type')->nullable(); 

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_records');
    }
};
