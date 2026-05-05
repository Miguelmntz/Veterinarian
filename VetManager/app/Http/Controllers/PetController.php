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

        // Quitamos 'photo' para evitar errores al crear el modelo en la BD
        unset($validated['photo']);
        
        $pet = Pet::create($validated);

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

        // Quitamos el objeto file para que no de guerra al actualizar el modelo.
        unset($validated['photo']);

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
        $owner = $pet->owner;
        
        // Borramos la mascota
        $pet->delete();

        // Lógica automática: Si el dueño ya no tiene más mascotas, lo borramos también a él
        if ($owner && $owner->pets()->count() === 0) {
            $owner->delete();
            return response()->json(['message' => 'Mascota y dueño eliminados (dueño sin más mascotas)'], 200);
        }

        return response()->json(null, 204);
    }
}
