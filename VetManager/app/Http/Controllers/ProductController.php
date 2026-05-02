<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // Recuperación integral del inventario de productos (diseñado para la inicialización de vistas tabulares en el frontend).
    public function index()
    {
        // Retorna la colección serializada ordenando alfabéticamente por nombre para optimizar su indexación visual.
        return response()->json(Product::orderBy('name', 'asc')->get());
    }

    // Registro de un nuevo artículo en el catálogo de inventario.
    public function store(Request $request)
    {
        // Implementación de validación estricta de tipos de datos.
        // Garantiza que el precio y stock sean valores numéricos válidos, retornando HTTP 422 en caso contrario.
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            // Definición del umbral mínimo de stock para la activación de notificaciones de reabastecimiento.
            'min_stock_alert' => 'required|integer|min:0', 
        ]);

        $product = Product::create($validated);
        return response()->json($product, 201);
    }

    // Recuperación detallada de un registro de producto individual.
    public function show(Product $product)
    {
        return response()->json($product);
    }

    // Actualización de los metadatos y valores comerciales de un producto existente.
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'stock_quantity' => 'sometimes|integer|min:0',
            'min_stock_alert' => 'sometimes|integer|min:0',
        ]);

        $product->update($validated);
        return response()->json($product);
    }

    // Operación atómica personalizada para deducción de stock.
    // Optimiza el consumo de red requiriendo únicamente el ID y la cantidad a descontar,
    // mitigando la necesidad de actualizar el objeto completo desde el cliente.
    public function consumeStock(Request $request, $id)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $product = Product::findOrFail($id);

        // Validación de integridad de negocio: previene reducciones que generarían inventario negativo.
        if ($product->stock_quantity >= $validated['quantity']) {
            $product->stock_quantity -= $validated['quantity'];
            $product->save();
            return response()->json(['message' => 'Actualización de inventario completada exitosamente.', 'product' => $product], 200);
        } else {
            return response()->json(['message' => 'Infracción de reglas de negocio: el stock actual es insuficiente para la deducción solicitada.'], 400);
        }
    }

    // Eliminación física del registro del producto en el catálogo (usado para artículos descatalogados).
    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(null, 204); // Retorna código de estado HTTP 204 indicando operación de eliminación exitosa.
    }
}
