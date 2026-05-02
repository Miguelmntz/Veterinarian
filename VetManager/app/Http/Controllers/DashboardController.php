<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use App\Models\Owner;
use App\Models\Appointment;
use App\Models\Product;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Agrupa y devuelve las métricas esenciales para la pantalla inicial "Home" de la clínica.
     */
    public function getMetrics()
    {
        $today = Carbon::today();

        // Citas programadas estrictamente para el día de hoy (excluye pendientes de aprobación)
        $appointmentsToday = Appointment::with(['pet', 'owner'])
            ->whereDate('start_time', $today)
            ->where('status', '!=', 'pending')
            ->orderBy('start_time', 'asc')
            ->get();

        // FASE 7: Solicitudes remotas pendientes de confirmación
        $pendingAppointments = Appointment::with(['pet', 'owner'])
            ->where('status', 'pending')
            ->orderBy('start_time', 'asc')
            ->get();

        // Alerta: productos que se están agotando físicamente en el almacén (<= 5 uds)
        $lowStockProducts = Product::where('stock_quantity', '<=', 5)->get();

        return response()->json([
            'metrics' => [
                'total_pets' => Pet::count(),
                'total_owners' => Owner::count(),
                'total_products' => Product::count(),
                'appointments_today_count' => $appointmentsToday->count(),
                'low_stock_count' => $lowStockProducts->count(),
            ],
            'appointments_today' => $appointmentsToday,
            'low_stock_products' => $lowStockProducts,
            'pending_appointments' => $pendingAppointments
        ], 200);
    }
}
