<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pets', function (Blueprint $table) {
            $table->string('raza')->nullable()->change();
            $table->double('peso')->nullable()->change();
            $table->date('fech_nac')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pets', function (Blueprint $table) {
            $table->string('raza')->nullable(false)->change();
            $table->double('peso')->nullable(false)->change();
            $table->date('fech_nac')->nullable(false)->change();
        });
    }
};
