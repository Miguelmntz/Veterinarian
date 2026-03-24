<?php

namespace App\Http\Controllers;

use App\Models\MedicalRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MedicalRecordController extends Controller
{
    // Me traigo todas las consultas de una mascota concreta (útil para la ficha del paciente)
    public function index(Request $request)
    {
        // Si me pasan pet_id recojo solo las de esa mascota, si no, me las traigo todas
        // (aunque en la vida real siempre filtraré por paciente)
        $query = MedicalRecord::query();
        if ($request->has('pet_id')) {
            $query->where('pet_id', $request->pet_id);
        }
        
        // Las devuelvo ordenadas de más reciente a más antigua
        // Y precargo a la mascota y al producto consumido (si hubiese alguno)
        return response()->json($query->with(['pet', 'product'])->orderBy('created_at', 'desc')->get());
    }

    // El gordo: Guardar una nueva consulta clínica y procesar el archivo adjunto
    public function store(Request $request)
    {
        // En vez de un JSON típico, esto me va a llegar como FormData desde React porque lleva un archivo
        // El validate de Laravel escupirá un 422 si falla algo, ideal.
        $validated = $request->validate([
            'pet_id' => 'required|exists:pets,id',
            'product_id' => 'nullable|exists:products,id',
            'symptom_title' => 'required|string|max:255',
            'diagnosis' => 'nullable|string',
            'treatment' => 'nullable|string',
            // El archivo es opcional, puede ser imagen o pdf. Max 10 megas.
            'attachment' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:10240', 
        ]);

        // INTEGRAMOS MÓDULO INVENTARIO AQUÍ MISMO A PELO:
        if (!empty($validated['product_id'])) {
            $productoGastado = \App\Models\Product::find($validated['product_id']);
            // Chequeo si me intentan colar poner una inyección de algo que no queda
            if ($productoGastado && $productoGastado->stock_quantity > 0) {
                // Resto 1 de stock mecánicamente directo a base de datos de manera súper simple
                $productoGastado->decrement('stock_quantity', 1);
            } else {
                return response()->json(['message' => 'Lógica física fallida: No queda stock de este producto disponible en la estantería actual.'], 400);
            }
        }

        $recordData = [
            'pet_id' => $validated['pet_id'],
            'product_id' => $validated['product_id'] ?? null,
            'symptom_title' => $validated['symptom_title'],
            'diagnosis' => $validated['diagnosis'] ?? null,
            'treatment' => $validated['treatment'] ?? null,
        ];

        // Lógica de manipulación de ficheros
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            
            // Lo guardo en local_storage: 'storage/app/public/medical_attachments' 
            // Cuidado! Tuve que ejecutar 'php artisan storage:link' en la powershell para que React pudiera leer estas fotos.
            $path = $file->store('medical_attachments', 'public');
            
            $recordData['attachment_path'] = $path;
            
            // Qué tipo de archivo estamos manejando (image/png, application/pdf...)
            $recordData['attachment_type'] = $file->getClientMimeType(); 
        }

        // Metemos el chisme a la base de datos
        $record = MedicalRecord::create($recordData);

        return response()->json($record, 201);
    }

    // Para ver una entrada sola (Por si acaso luego la uso en alguna vista en detalle)
    public function show($id)
    {
        $medicalRecord = MedicalRecord::with(['pet', 'product'])->findOrFail($id);
        return response()->json($medicalRecord);
    }

    // Borrar una historia clínica entera (y pulverizar su archivo adjunto para no saturar el servidor inútilmente)
    public function destroy($id)
    {
        $medicalRecord = MedicalRecord::findOrFail($id);
        
        if ($medicalRecord->attachment_path) {
            // Borro físicamente la foto/pdf del disco duro local si tenía una. ¡Esto es vital para no inflar la app!
            Storage::disk('public')->delete($medicalRecord->attachment_path);
        }

        $medicalRecord->delete();

        return response()->json(null, 204);
    }
}
