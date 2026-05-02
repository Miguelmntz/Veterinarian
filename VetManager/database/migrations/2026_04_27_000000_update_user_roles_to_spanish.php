<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('users')->where('role', 'veterinarian')->update(['role' => 'veterinario']);
        DB::table('users')->where('role', 'receptionist')->update(['role' => 'recepcionista']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('users')->where('role', 'veterinario')->update(['role' => 'veterinarian']);
        DB::table('users')->where('role', 'recepcionista')->update(['role' => 'receptionist']);
    }
};
