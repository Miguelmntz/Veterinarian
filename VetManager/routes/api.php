<?php

use App\Http\Controllers\PetController;
use App\Http\Controllers\OwnerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
// Rutas de la API generadas con apiResource. 
// Esto crea automáticamente todas las rutas CRUD estándar (index, store, show, update, destroy)
// para Mascotas (pets) y sus Dueños (owners) sin tener que escribirlas una por una.
Route::apiResource('pets', PetController::class);
Route::apiResource('owners', OwnerController::class);
