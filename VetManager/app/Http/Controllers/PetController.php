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
        //Usanmos el With para traer todos los datos del dueño de una vez
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
        ]);

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
        $validated = $request->validate([
            'owner_id' => 'required|exists:owners,id',
            'name' => 'required|string',
            'species' => 'required|string',
            'raza' => 'nullable|string',
            'peso' => 'nullable|numeric',
            'fech_nac' => 'nullable|date',
        ]);

        $pet->update($validated);

        return response()->json($pet, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pet $pet)
    {
        $pet->delete();
        return response()->json(null, 204);
    }
}
