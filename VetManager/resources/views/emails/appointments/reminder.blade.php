<x-mail::message>
# Hola {{ $appointment->owner->name }},

Este es un recordatorio amable de que **{{ $appointment->pet->name }}** tiene una cita programada para mañana.

**Fecha y Hora:** {{ \Carbon\Carbon::parse($appointment->start_time)->format('d/m/Y H:i') }}
**Motivo:** {{ $appointment->title }}

Le esperamos en nuestra clínica. Si no puede asistir, por favor infórmenos lo antes posible.

<x-mail::button :url="'http://localhost:5173'">
    Ver Detalles en el Portal
</x-mail::button>

Saludos,<br>
{{ config('app.name') }}
</x-mail::message>
