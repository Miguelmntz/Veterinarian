<?php

namespace App\Http\Controllers;

use App\Models\MedicalRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use App\Mail\MedicalVisitSummary;

class MedicalRecordController extends Controller
{
    // Recupera todos los registros médicos asociados a una mascota específica (utilizado en la vista de ficha de paciente)
    public function index(Request $request)
    {
        // Filtrado condicional: si se proporciona 'pet_id', se restringe la consulta; de lo contrario, retorna la colección completa
        // Nota arquitectónica: En el flujo estándar de la aplicación siempre se aplicará este filtro
        $query = MedicalRecord::query();
        if ($request->has('pet_id')) {
            $query->where('pet_id', $request->pet_id);
        }
        
        // Retorna la colección ordenada cronológicamente de forma descendente,
        // incluyendo las relaciones 'pet' y 'product' mediante eager loading
        return response()->json($query->with(['pet', 'product'])->orderBy('created_at', 'desc')->get());
    }

    // Almacenar nuevo registro médico y procesar el archivo adjunto
    public function store(Request $request)
    {
        // Procesamiento de la petición: Se espera un objeto FormData desde el frontend para soportar subida de archivos
        // La validación retornará un código HTTP 422 en caso de incumplir las reglas definidas
        $validated = $request->validate([
            'pet_id' => 'required|exists:pets,id',
            'product_id' => 'nullable|exists:products,id',
            'symptom_title' => 'required|string|max:255',
            'diagnosis' => 'nullable|string',
            'treatment' => 'nullable|string',
            // El archivo adjunto es opcional. Formatos admitidos: imagen o PDF. Tamaño máximo: 10MB
            'attachment' => 'nullable|file|mimes:jpeg,png,jpg,webp,pdf|max:10240', 
        ]);

        // Integración con el módulo de control de inventario:
        if (!empty($validated['product_id'])) {
            $productoGastado = \App\Models\Product::find($validated['product_id']);
            // Verificación de disponibilidad de stock previo a la deducción
            if ($productoGastado && $productoGastado->stock_quantity > 0) {
                // Deducción de una unidad de stock en la base de datos
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

        // Lógica de procesamiento y almacenamiento de archivos adjuntos
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            
            // Almacenamiento en disco local: 'storage/app/public/medical_attachments' 
            // Requiere la configuración previa del enlace simbólico mediante 'php artisan storage:link' para accesibilidad pública
            $path = $file->store('medical_attachments', 'public');
            
            $recordData['attachment_path'] = $path;
            
            // Registro del tipo MIME del archivo adjunto para su posterior renderizado
            $recordData['attachment_type'] = $file->getClientMimeType(); 
        }

        // Persistencia del registro médico en la base de datos
        $record = MedicalRecord::create($recordData);

        // ENVIAR NOTIFICACIÓN AUTOMÁTICA AL DUEÑO
        $record->load(['pet.owner', 'product']);
        if ($record->pet && $record->pet->owner && $record->pet->owner->email) {
            try {
                Mail::to($record->pet->owner->email)->send(new MedicalVisitSummary($record));
            } catch (\Exception $e) {
                \Log::error("Error enviando resumen médico por correo: " . $e->getMessage());
            }
        }

        return response()->json($record, 201);
    }

    // Recupera un registro médico específico por su identificador (preparado para vistas detalladas individuales)
    public function show($id)
    {
        $medicalRecord = MedicalRecord::with(['pet', 'product'])->findOrFail($id);
        return response()->json($medicalRecord);
    }

    // Elimina permanentemente un registro médico y su archivo adjunto asociado del sistema de almacenamiento
    public function destroy($id)
    {
        $medicalRecord = MedicalRecord::findOrFail($id);
        
        if ($medicalRecord->attachment_path) {
            // Eliminación física del archivo en el disco local para optimizar el espacio de almacenamiento del servidor
            Storage::disk('public')->delete($medicalRecord->attachment_path);
        }

        $medicalRecord->delete();

        return response()->json(null, 204);
    }
}
