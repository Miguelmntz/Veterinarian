<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\AppointmentConfirmed;

class AppointmentController extends Controller
{
    public function index()
    {
        $appointments = Appointment::with(['owner', 'pet'])->get();
        return response()->json($appointments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'owner_id'   => 'required|exists:owners,id',
            'pet_id'     => 'required|exists:pets,id',
            'title'      => 'required|string|max:255',
            'start_time' => 'required|date',
            'notes'      => 'nullable|string',
            'type'       => 'nullable|string',
            'status'     => 'nullable|in:scheduled,completed,cancelled'
        ]);

        // Verificamos si existe alguna cita a esa misma hora para evitar solapamientos
        $startParsed = \Carbon\Carbon::parse($request->start_time)->format('Y-m-d H:i:s');
        if (Appointment::where('start_time', $startParsed)->exists()) {
            return response()->json(['message' => 'Esta hora ya está reservada por otro paciente.'], 422);
        }

        $appointment = Appointment::create($validated);
        
        $appointment->load(['owner', 'pet']);

        // Fase 3: Disparar notificación por correo al cliente.
        // Como estamos en entorno local, el email se "enviará" escribiéndose en storage/logs/laravel.log
        if ($appointment->owner && $appointment->owner->email) {
            Mail::to($appointment->owner->email)->send(new AppointmentConfirmed($appointment));
        }

        return response()->json($appointment, 201);
    }

    public function show(Appointment $appointment)
    {
        $appointment->load(['owner', 'pet']);
        return response()->json($appointment);
    }

    public function update(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'owner_id'   => 'sometimes|exists:owners,id',
            'pet_id'     => 'sometimes|exists:pets,id',
            'title'      => 'sometimes|string|max:255',
            'start_time' => 'sometimes|date',
            'notes'      => 'nullable|string',
            'type'       => 'nullable|string',
            'status'     => 'nullable|in:scheduled,completed,cancelled'
        ]);

        $startParsed = \Carbon\Carbon::parse($request->start_time)->format('Y-m-d H:i:s');
        if (Appointment::where('start_time', $startParsed)->where('id', '!=', $appointment->id)->exists()) {
            return response()->json(['message' => 'Esta hora ya está reservada por otro paciente.'], 422);
        }

        $appointment->update($validated);
        $appointment->load(['owner', 'pet']);

        return response()->json($appointment);
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->delete();
        return response()->json(null, 204);
    }
}
