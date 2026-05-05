<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\AppointmentConfirmed;
use App\Mail\AppointmentCancelled;

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
            'status'     => 'required|in:pending,scheduled,completed,cancelled'
        ]);

        // Verificamos si existe alguna cita a esa misma hora para evitar solapamientos (sólo si no es pendiente)
        $status = $validated['status'] ?? 'scheduled';
        if ($status !== 'pending') {
            $startParsed = \Carbon\Carbon::parse($request->start_time)->format('Y-m-d H:i:s');
            // Ignorar los pendings de otros a la hora de comprobar huecos
            if (Appointment::where('start_time', $startParsed)->where('status', '!=', 'pending')->exists()) {
                return response()->json(['message' => 'Esta hora ya está reservada por otro paciente.'], 422);
            }
        }

        $appointment = Appointment::create($validated);
        
        $appointment->load(['owner', 'pet']);

        // Sólo mandar correo si la cita se crea ya como "scheduled" directamente (por el Admin)
        if ($appointment->status === 'scheduled') {
            if ($appointment->owner && $appointment->owner->email) {
                try {
                    Mail::to($appointment->owner->email)->send(new AppointmentConfirmed($appointment));
                } catch (\Exception $e) {
                    \Log::error("Error enviando correo de confirmación: " . $e->getMessage());
                }
            }
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
            'status'     => 'required|in:pending,scheduled,completed,cancelled'
        ]);

        // Usamos el start_time del request o el que ya tiene la cita para la validación de solapamiento
        $startTime = $request->start_time ?? $appointment->start_time;
        $status = $validated['status'];

        if ($status !== 'pending' && $status !== 'cancelled') {
            $startParsed = \Carbon\Carbon::parse($startTime)->format('Y-m-d H:i:s');
            if (Appointment::where('start_time', $startParsed)
                ->where('status', '!=', 'pending')
                ->where('status', '!=', 'cancelled')
                ->where('id', '!=', $appointment->id)
                ->exists()) {
                return response()->json(['message' => 'Esta hora ya está reservada por otro paciente.'], 422);
            }
        }

        $oldStatus = $appointment->status;
        $appointment->update($validated);
        $appointment->load(['owner', 'pet']);

        // Fase 5/6: Si el admin acaba de aprobar una cita pendiente cambiándola a scheduled, disparamos el correo.
        if ($oldStatus === 'pending' && $appointment->status === 'scheduled') {
            if ($appointment->owner && $appointment->owner->email) {
                try {
                    Mail::to($appointment->owner->email)->send(new AppointmentConfirmed($appointment));
                } catch (\Exception $e) {
                    \Log::error("Error enviando correo de confirmación tras actualización: " . $e->getMessage());
                }
            }
        }

        // NUEVO: Notificar cancelación por cambio de estado
        if ($oldStatus !== 'cancelled' && $appointment->status === 'cancelled') {
            if ($appointment->owner && $appointment->owner->email) {
                try {
                    Mail::to($appointment->owner->email)->send(new AppointmentCancelled($appointment));
                } catch (\Exception $e) {
                    \Log::error("Error enviando correo de cancelación: " . $e->getMessage());
                }
            }
        }

        return response()->json($appointment);
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->load(['owner', 'pet']);
        
        // Notificamos antes de borrar si era una cita agendada
        if ($appointment->status === 'scheduled' || $appointment->status === 'pending') {
             if ($appointment->owner && $appointment->owner->email) {
                 try {
                     Mail::to($appointment->owner->email)->send(new AppointmentCancelled($appointment));
                 } catch (\Exception $e) {
                     \Log::error("Error enviando correo de cancelación tras borrado: " . $e->getMessage());
                 }
             }
        }

        $appointment->delete();
        return response()->json(null, 204);
    }
}
