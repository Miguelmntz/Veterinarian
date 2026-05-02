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
        Schema::table('appointments', function (Blueprint $table) {
            // SQLite does not support editing enums reliably natively.
            // We convert the column to string, which effectively drops the hardcoded ENUM constraint.
            // Our Controller validation already enforces the 4 allowed values perfectly anyway.
            $table->string('status')->default('scheduled')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('status')->default('scheduled')->change();
        });
    }
};
