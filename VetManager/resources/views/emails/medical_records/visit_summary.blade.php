<x-mail::message>
# Hola {{ $record->pet->owner->name }},

Gracias por confiar en nosotros para el cuidado de **{{ $record->pet->name }}**. Aquí tiene un resumen de la visita clínica de hoy:

**Motivo:** {{ $record->symptom_title }}

**Diagnóstico:** {{ $record->diagnosis ?? 'Pendiente' }}

**Tratamiento:** {{ $record->treatment ?? 'No requiere tratamiento específico' }}

@if($record->product)
**Medicación/Material suministrado:** {{ $record->product->name }}
@endif

Adjunto a este correo puede encontrar el archivo relacionado con la consulta (si fuese aplicable).

<x-mail::button :url="config('app.frontend_url')">
Ver Historial Completo
</x-mail::button>

Atentamente, Mmartin Clínica Veterinaria
</x-mail::message>