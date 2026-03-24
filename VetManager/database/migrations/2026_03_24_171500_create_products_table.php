<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Creo la tabla para gestionar el almacén de medicinas y material clínico de la consulta.
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            
            // El nombre corto del artículo (ej. Ibuprofeno 600mg, Venda algodón 5cm)
            $table->string('name');
            
            // Detalles más específicos opcionales (proveedor, gramaje de pastillas...)
            $table->text('description')->nullable();
            
            // Cuánto me cuesta comprarlo o a cuánto la vendo al público (con 2 decimales para céntimos)
            $table->decimal('price', 8, 2);
            
            // Cuántas unidades físicas tangibles me quedan en las baldas ahora mismo
            $table->integer('stock_quantity')->default(0);
            
            // Si el stock baja de esta cifra, el panel de React se pintará de rojo "¡Haz pedido urgente!"
            $table->integer('min_stock_alert')->default(5);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
