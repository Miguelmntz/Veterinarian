<x-mail::message>
# Hola {{ $appointment->owner->name }},

Le informamos que su cita programada para **{{ $appointment->pet->name }}** el día **{{ \Carbon\Carbon::parse($appointment->start_time)->format('d/m/Y H:i') }}** ha sido cancelada.

**Motivo de la cita:** {{ $appointment->title }}

Si cree que esto es un error o desea reprogramar su visita, por favor póngase en contacto con nosotros lo antes posible.

<x-mail::button :url="config('app.frontend_url')">
Volver al Portal
</x-mail::button>

Atentamente, Mmartin Clínica Veterinaria<br>
</x-mail::message>