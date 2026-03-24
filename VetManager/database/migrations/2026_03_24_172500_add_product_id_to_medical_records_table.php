<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Altero la tabla del historial clínico para poder vincularle medicinas gastadas en consulta
        Schema::table('medical_records', function (Blueprint $table) {
            // Nullable porque no en absolutamente todas las visitas de revisión se gasta material del almacén
            // Si le doy a nullOnDelete, si fulmino una pastilla del sistema, el historial no se borra, simplemente pone que gastaron "null"
            $table->foreignId('product_id')->nullable()->after('pet_id')->constrained('products')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('medical_records', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropColumn('product_id');
        });
    }
};
