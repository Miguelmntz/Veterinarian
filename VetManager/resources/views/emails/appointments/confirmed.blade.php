<x-mail::message>
# Hola {{ $appointment->owner->name }},

Le confirmamos que hemos reservado una cita para su mascota **{{ $appointment->pet->name }}** en la Clínica Veterinaria Veterinario Mmartin.

A continuación tiene los detalles de su reserva:

**Motivo de la consulta:** {{ $appointment->title }}

**Fecha y Hora:** {{ \Carbon\Carbon::parse($appointment->start_time)->format('Y-m-d H:i') }}

Le rogamos máxima puntualidad. Recuerde que si necesita cancelar o reprogramar, debe avisarnos con antelación.

<x-mail::button :url="config('app.frontend_url')">
Entrar a la Plataforma
</x-mail::button>

Atentamente, Mmartin Clínica Veterinaria<br>
</x-mail::message>