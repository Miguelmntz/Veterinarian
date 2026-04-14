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
        // Devuelvo todos los dueños desde la base de datos.
        // Uso 'with("pets")' para traerme también sus mascotas asociadas de una vez y optimizar las consultas.
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
        // Primero, valido los datos que llegan desde el formulario de React para asegurar que son correctos antes de guardarlos.
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

        // Uso una transacción de base de datos. Así si falla algo al guardar la mascota, tampoco se guarda el dueño a medias.
        return DB::transaction(function () use ($request) {
            // Creo el registro del dueño con los datos validados
            $owner = Owner::create($request->only(['name', 'email', 'telefono', 'direccion']));

            // Si desde React me han enviado mascotas en la creación inicial, las recorro y las asocio al dueño automáticamente
            if ($request->has('pets')) {
                foreach ($request->pets as $petData) {
                    $owner->pets()->create($petData);
                }
            }

            // Devuelvo al frontend el dueño creado, cargando sus relaciones ('pets') para que React actualice el estado sin tener que recargar.
            return response()->json($owner->load('pets'), 201);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        // Busco un dueño específico por su ID. Aquí también me traigo sus mascotas para la vista de detalle.
        // findOrFail() me devuelve un error 404 automáticamente si no existe en la base de datos.
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
        // Actualización de Dueños (Clientes)
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            // Ojo: Validar que el email sea único, pero ignoro el ID de este propio dueño para no duplicar error
            'email' => 'required|email|unique:owners,email,' . $owner->id,
            'telefono' => 'required|string',
            'direccion' => 'nullable|string',
        ]);

        $owner->update($validated);

        // Envío el dueño actualizado a React, con sus mascotas para no romper el Front.
        return response()->json($owner->load('pets'), 200);    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Owner $owner)
    {
        //
    }
}
