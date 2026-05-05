<x-mail::message>
    # Hola {{ $appointment->owner->name }},

    Le confirmamos que hemos reservado una cita para su mascota **{{ $appointment->pet->name }}** en la Clínica
    Veterinaria Veterinario Mmartin.

    A continuación tiene los detalles de su reserva:

    **Motivo de la consulta:** {{ $appointment->title }}
    **Fecha y Hora:** {{ \Carbon\Carbon::parse($appointment->start_time)->format('Y-m-d H:i') }}

    Le rogamos máxima puntualidad. Recuerde que si necesita cancelar o reprogramar, debe avisarnos con antelación.

    <x-mail::button :url="'http://localhost:5173'">
        Entrar a la Plataforma
    </x-mail::button>

    Gracias por confiar en nosotros,<br>
    El equipo de {{ config('app.name') }}
</x-mail::message>