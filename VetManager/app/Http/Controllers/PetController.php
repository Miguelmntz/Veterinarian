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
        // Recuperación de registros con carga anticipada (eager loading) de la relación 'owner'.
        // Implementación requerida para mitigar el problema de consultas N+1 durante la renderización del frontend.
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
        // Definición de reglas de validación: Verificación de integridad referencial (exists:owners,id)
        // y validación de campos obligatorios para prevenir excepciones a nivel de base de datos.
        $validated = $request->validate([
            'owner_id' => 'required|exists:owners,id',
            'name' => 'required|string',
            'species' => 'required|string',
            'raza' => 'nullable|string',
            'peso' => 'nullable|numeric',
            'fech_nac' => 'nullable|date',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240', // 10MB máximo
        ]);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('pets', 'public');
            $validated['photo_path'] = $path;
        }

        // Persistencia de la nueva entidad en la base de datos tras superar la validación.
        $pet = Pet::create($validated);

        // Respuesta JSON con la entidad generada y código de estado HTTP 201 (Created).
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
        // Validación integral del payload de actualización manteniendo las restricciones de integridad originales.
        $validated = $request->validate([
            'owner_id' => 'required|exists:owners,id',
            'name' => 'required|string',
            'species' => 'required|string',
            'raza' => 'nullable|string',
            'peso' => 'nullable|numeric',
            'fech_nac' => 'nullable|date',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240',
        ]);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('pets', 'public');
            $validated['photo_path'] = $path;
        }

        // Actualización del registro en base de datos aprovechando la inyección implícita del modelo (Route Model Binding).
        $pet->update($validated);

        // Respuesta JSON con la entidad actualizada y código de estado HTTP 200 (OK).
        return response()->json($pet, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pet $pet)
    {
        // Eliminación del registro mediante el ORM Eloquent.
        $pet->delete();

        // Confirmación de eliminación exitosa mediante código de estado HTTP 204 (No Content).
        return response()->json(null, 204);
    }
}
