<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // Carga todo el almacén de un plumazo. Ideal para rellenar mi Datatable de React.
    public function index()
    {
        // Me los traigo en la API ordenados alfabéticamente para que sea fácil buscarlos y listarlos
        return response()->json(Product::orderBy('name', 'asc')->get());
    }

    // Registrar una medicina o material nuevo en caja
    public function store(Request $request)
    {
        // La barrera de seguridad de Laravel actuando de escolta.
        // Si meten un "TRES" en el precio, escupe error 422 automático. Un chollo.
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            // Pongo 5 unidades de alerta mínima por defecto para avisar a recepción
            'min_stock_alert' => 'required|integer|min:0', 
        ]);

        $product = Product::create($validated);
        return response()->json($product, 201);
    }

    // Visualizar la ficha de un solo producto a nivel individual
    public function show(Product $product)
    {
        return response()->json($product);
    }

    // Editar la ficha (ej: cambiar el proveedor en info, o han subido los precios en la aduana)
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

    // Funcionalidad extra que me he maquinado: 
    // Restar de inventario super rápido simulando que hemos cogido una jeringuilla de la estantería de enfermería,
    // sin necesidad de enviarle a Axios todo el mamotreto de objeto entero con su descripción.
    public function consumeStock(Request $request, $id)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $product = Product::findOrFail($id);

        // Control simple: no puedo restar jeringuillas que no tengo físicamente
        if ($product->stock_quantity >= $validated['quantity']) {
            $product->stock_quantity -= $validated['quantity'];
            $product->save();
            return response()->json(['message' => 'Stock actualizado al instante', 'product' => $product], 200);
        } else {
            return response()->json(['message' => 'Lógica física insalvable: no hay suficiente stock material para descontar en el mueble.'], 400);
        }
    }

    // Botón destructivo: para material o medicinas descatalogadas (ej: han prohibido la Aspirina genérica)
    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(null, 204); // Manda código puro vacío al aire "Borrado Guay"
    }
}
