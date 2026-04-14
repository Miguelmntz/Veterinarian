<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@veterinario.com'],
            [
                'name' => 'Dr. Martín (Veterinario)',
                'password' => Hash::make('password123'),
                'role' => 'veterinarian'
            ]
        );

        User::firstOrCreate(
            ['email' => 'recepcion@veterinario.com'],
            [
                'name' => 'Ana (Recepción)',
                'password' => Hash::make('password123'),
                'role' => 'receptionist'
            ]
        );
    }
}
