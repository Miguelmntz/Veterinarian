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
                'role' => 'veterinario'
            ]
        );

        User::firstOrCreate(
            ['email' => 'recepcion@veterinario.com'],
            [
                'name' => 'Ana (Recepción)',
                'password' => Hash::make('password123'),
                'role' => 'recepcionista'
            ]
        );

        // Fase 6: Creamos un usuario de Portal de Cliente para que puedan iniciar sesión
        User::firstOrCreate(
            ['email' => 'cliente@gmail.com'],
            [
                'name' => 'Sara (Dueña de prueba)',
                'password' => Hash::make('password123'),
                'role' => 'client'
            ]
        );

        // Por supuesto, también le damos de alta en la tabla de Owners físicamente en la clínica
        \App\Models\Owner::firstOrCreate(
            ['email' => 'cliente@gmail.com'],
            [
                'name' => 'Sara (Dueña de prueba)',
                'telefono' => '600123456',
                'direccion' => 'Calle Demo 123'
            ]
        );
    }
}
