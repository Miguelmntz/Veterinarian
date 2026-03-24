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
Route::apiResource('appointments', App\Http\Controllers\AppointmentController::class);

// El gran controlador para la tabla del Historial Médico Clínico. Me viene que ni pintado un apiResource.
Route::apiResource('medical-records', App\Http\Controllers\MedicalRecordController::class);

// Rutas del inventario (almacén de medicinas y material clínico). Otro Resource enterito para mí.
Route::apiResource('products', App\Http\Controllers\ProductController::class);
// Mi apaño rápido al API para restar stock con un clic (saltándome el hacer un PUT a lo bruto de toda la ficha entera de campos)
Route::post('products/{id}/consume', [App\Http\Controllers\ProductController::class, 'consumeStock']);
