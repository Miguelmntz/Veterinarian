<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;

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
            'end_time'   => 'required|date|after_or_equal:start_time',
            'notes'      => 'nullable|string',
            'type'       => 'nullable|string',
            'status'     => 'nullable|in:scheduled,completed,cancelled'
        ]);

        $appointment = Appointment::create($validated);
        
        $appointment->load(['owner', 'pet']);

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
            'end_time'   => 'sometimes|date|after_or_equal:start_time',
            'notes'      => 'nullable|string',
            'type'       => 'nullable|string',
            'status'     => 'nullable|in:scheduled,completed,cancelled'
        ]);

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
