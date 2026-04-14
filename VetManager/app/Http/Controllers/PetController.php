<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use Illuminate\Http\Request;

class PetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Al recuperar todas las mascotas, llamo también a la relación 'owner' usando with().
        // Esto evita el problema N+1 queries al renderizar las tablas en React (traigo dueño de una sola vez).
        return Pet::with('owner')->get();
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

    //
    public function store(Request $request)
    {
        // Reglas de validación: quiero asegurar que el dueño existe (exists:owners,id)
        // y que no puedan meterme campos nulos obligatorios (nombre y especie).
        $validated = $request->validate([
            'owner_id' => 'required|exists:owners,id',
            'name' => 'required|string',
            'species' => 'required|string',
            'raza' => 'nullable|string',
            'peso' => 'nullable|numeric',
            'fech_nac' => 'nullable|date',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', // 2MB máximo
        ]);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('pets', 'public');
            $validated['photo_path'] = $path;
        }

        // Ya asegurados los datos, creo la mascota en BD.
        $pet = Pet::create($validated);

        // Retorno la mascota creada en formato JSON al front, con código HTTP 201 (Creado).
        return response()->json($pet, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Pet $pet)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Pet $pet)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Pet $pet)
    {
        // Para la actualización exijo los mismos datos de validación básica por si los cambian.
        $validated = $request->validate([
            'owner_id' => 'required|exists:owners,id',
            'name' => 'required|string',
            'species' => 'required|string',
            'raza' => 'nullable|string',
            'peso' => 'nullable|numeric',
            'fech_nac' => 'nullable|date',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('pets', 'public');
            $validated['photo_path'] = $path;
        }

        // Laravel se encarga de guardar los cambios en la BD con el objeto Model $pet recibido por Route Model Binding.
        $pet->update($validated);

        // Envío 200 (OK) en vez de 201 por ser una actualización.
        return response()->json($pet, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pet $pet)
    {
        // Borramos la mascota de forma directa usando Eloquent ORM.
        $pet->delete();

        // Retornamos 204 (No Content) para avisar de que ha salido bien y ya no hay contenido.
        return response()->json(null, 204);
    }
}
