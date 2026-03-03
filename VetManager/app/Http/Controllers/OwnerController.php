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
        //Listamos todos los dueños y ademas nos traemos las mascotas que este tenga
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
        //Crear un nuevo dueño validandolo
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
        return DB::transaction(function () use ($request) {
            // Creamos al dueño
            $owner = Owner::create($request->only(['name', 'email', 'telefono', 'direccion']));

            // Si hay mascotas, las creamos asociadas al dueño
            if ($request->has('pets')) {
                foreach ($request->pets as $petData) {
                    $owner->pets()->create($petData);
                }
            }

            // Devolvemos el dueño con sus mascotas cargadas para que React las vea
            return response()->json($owner->load('pets'), 201);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        //Traemos al dueño con las mascotas que tenga
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Owner $owner)
    {
        //
    }
}
