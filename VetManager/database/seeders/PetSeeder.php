<?php

namespace Database\Seeders;

use App\Models\Owner;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $owner = Owner::create([
            'name' => 'Miguel',
            'email' => 'email@prueba.com',
            'telefono' => '123456789',
            'direccion' => 'Paseo de San Luis'
        ]);

        $owner->pets()->create([
            'name' => 'Garfield',
            'species' => 'Gato',
            'raza' => 'Persa',
            'peso' => 5.5,
            'fech_nac' => '2020-06-19'
        ]);
    }
}
