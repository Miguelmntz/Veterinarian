<?php

use App\Http\Controllers\PetController;
use App\Http\Controllers\OwnerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    // Calculamos el owner_id exactamente igual que en el AuthController para que React pueda leerlo
    $user = $request->user();
    if ($user->role === 'client') {
        $owner = \App\Models\Owner::where('email', $user->email)->first();
        if ($owner) {
            $user->owner_id = $owner->id;
        } else {
            $user->owner_id = null;
        }
    }
    return $user;
})->middleware('auth:sanctum');

// FASE 6: Rutas de Autenticación Clásica
Route::post('/login', [App\Http\Controllers\AuthController::class, 'login']);
Route::post('/logout', [App\Http\Controllers\AuthController::class, 'logout'])->middleware('auth:sanctum');

// Login con Google
Route::get('/auth/google', [\App\Http\Controllers\GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [\App\Http\Controllers\GoogleAuthController::class, 'callback']);

Route::get('/list-owners', function() {
    return \App\Models\Owner::select('name', 'email')->get();
});
// Rutas de la API generadas con apiResource. 
// Esto crea automáticamente todas las rutas CRUD estándar (index, store, show, update, destroy)
// para Mascotas (pets) y sus Dueños (owners) sin tener que escribirlas una por una.
Route::apiResource('pets', PetController::class);
Route::apiResource('owners', OwnerController::class);
Route::apiResource('appointments', App\Http\Controllers\AppointmentController::class);
Route::apiResource('users', App\Http\Controllers\UserController::class);

// El gran controlador para la tabla del Historial Médico Clínico. Me viene que ni pintado un apiResource.
Route::apiResource('medical-records', App\Http\Controllers\MedicalRecordController::class);

// Rutas del inventario (almacén de medicinas y material clínico). Otro Resource enterito para mí.
Route::apiResource('products', App\Http\Controllers\ProductController::class);
// Mi apaño rápido al API para restar stock con un clic (saltándome el hacer un PUT a lo bruto de toda la ficha entera de campos)
Route::post('products/{id}/consume', [App\Http\Controllers\ProductController::class, 'consumeStock']);

// Ruta de Facturación final en PDF (Fase 4) - Descarga directa
Route::get('invoices/{medicalRecordId}/download', [App\Http\Controllers\InvoiceController::class, 'generateInvoice']);

// Fase 3: Ruta para las estadísticas globales (Home Dashboard)
Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'getMetrics']);
