<?php

use App\Http\Controllers\PetController;
use App\Http\Controllers\OwnerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::apiResource('pets', PetController::class);
Route::apiResource('owners', OwnerController::class);


