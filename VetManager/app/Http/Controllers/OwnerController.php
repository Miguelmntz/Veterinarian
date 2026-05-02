<?php

namespace App\Http\Controllers;

use App\Models\Owner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OwnerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Recuperación de todos los registros de propietarios.
        // Se implementa Eager Loading con 'with("pets")' para pre-cargar las relaciones y prevenir consultas N+1.
        return Owner::with('pets')->get();
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validación del payload entrante para asegurar la integridad de los datos antes de la persistencia.
        $validate = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:owners,email',
            'telefono' => 'required|string',
            'direccion' => 'nullable|string',
            'pets' => 'nullable|array',
            'pets.*.name' => 'required|string',
            'pets.*.species' => 'required|string',
            'pets.*.raza' => 'nullable|string',
            'pets.*.peso' => 'nullable|numeric',
            'pets.*.fech_nac' => 'nullable|date',
        ]);

        // Implementación de transacción de base de datos para garantizar la atomicidad de las operaciones relacionadas.
        return DB::transaction(function () use ($request) {
            // Persistencia del nuevo registro de propietario con los datos validados.
            $owner = Owner::create($request->only(['name', 'email', 'telefono', 'direccion']));

            // Fase 6: Aprovisionamiento automático de la cuenta de usuario para el portal de clientes.
            \App\Models\User::firstOrCreate(
                ['email' => $owner->email],
                [
                    'name' => $owner->name,
                    'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                    'role' => 'client'
                ]
            );

            // Procesamiento de las relaciones subordinadas (mascotas) incluidas en el payload inicial.
            if ($request->has('pets')) {
                foreach ($request->pets as $petData) {
                    $owner->pets()->create($petData);
                }
            }

            // Respuesta con el objeto creado y sus relaciones cargadas, permitiendo la actualización del estado del cliente (SPA) de forma óptima.
            return response()->json($owner->load('pets'), 201);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        // Recuperación de un registro específico mediante su ID, incluyendo sus relaciones (Eager Loading).
        // Se utiliza findOrFail() para manejar automáticamente excepciones de no encontrado (HTTP 404).
        return Owner::with('pets')->findOrFail($id);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Owner $owner)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Owner $owner)
    {
        // Actualización de datos del registro de Propietario (Cliente).
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            // Excepción en la validación de unicidad: Se omite el ID del registro actual para permitir la actualización parcial.
            'email' => 'required|email|unique:owners,email,' . $owner->id,
            'telefono' => 'required|string',
            'direccion' => 'nullable|string',
        ]);

        $owner->update($validated);

        // Respuesta JSON que incluye la entidad actualizada y sus relaciones requeridas para mantener el estado del frontend.
        return response()->json($owner->load('pets'), 200);    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Owner $owner)
    {
        //
    }
}
