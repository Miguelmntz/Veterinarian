<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MedicalRecord;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    /**
     * Genera una factura en PDF para un historial médico/consulta específica.
     */
    public function generateInvoice($medicalRecordId)
    {
        // Recuperar el historial junto con el producto, la mascota y el dueño
        $record = MedicalRecord::with(['pet.owner', 'product'])->findOrFail($medicalRecordId);

        // Precio base de consulta en el centro
        $consultationFee = 50.00; 

        // Sumar producto si se ha consumido alguno
        $productCost = $record->product ? clone $record->product->price : 0; // Se asume que el Product tiene $price
        
        $totalCost = $consultationFee + $productCost;
        $iva = $totalCost * 0.21;
        $grandTotal = $totalCost + $iva;

        $data = [
            'record' => $record,
            'owner' => $record->pet->owner,
            'pet' => $record->pet,
            'consultationFee' => $consultationFee,
            'product' => $record->product,
            'totalCost' => $totalCost,
            'iva' => $iva,
            'grandTotal' => $grandTotal,
            'date' => now()->format('d/m/Y'),
            'invoice_number' => 'FAC-' . str_pad($record->id, 6, "0", STR_PAD_LEFT)
        ];

        $pdf = Pdf::loadView('pdf.invoice', $data);
        
        // Return stream o download. Como es una API, devolvemos el binario como respuesta HTTP para que React lo parsee
        return $pdf->download('factura_' . $data['invoice_number'] . '.pdf');
    }
}
