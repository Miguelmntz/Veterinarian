<?php

use App\Http\Controllers\OwnerController;
use App\Http\Controllers\PetController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
