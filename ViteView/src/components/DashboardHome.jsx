import React, { useState, useEffect } from 'react';
import api from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faUsers, faBoxOpen, faCalendarDay, faExclamationTriangle, faSync, faChartLine, faChartPie } from '@fortawesome/free-solid-svg-icons';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const DashboardHome = ({ onNavigate }) => {
    const [metrics, setMetrics] = useState({
        total_pets: 0,
        total_owners: 0,
        total_products: 0,
        appointments_today_count: 0,
        low_stock_count: 0
    });
    const [appointments, setAppointments] = useState([]);
    const [pendingAppointments, setPendingAppointments] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [chartData, setChartData] = useState({
        appointments_weekly: [],
        species_distribution: []
    });
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/dashboard');
            setMetrics(res.data.metrics);
            setAppointments(res.data.appointments_today);
            setLowStock(res.data.low_stock_products);
            setPendingAppointments(res.data.pending_appointments || []);
            setChartData(res.data.charts || { appointments_weekly: [], species_distribution: [] });
        } catch (error) {
            console.error("Error fetching dashboard data", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Recuento exacto de alertas reales (críticas vs advertencia)
    const criticalStockCount = lowStock.filter(p => p.stock_quantity === 0).length;
    const warningStockCount = lowStock.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length;

    if (loading) {
        return (
            <div className="flex-1 p-8 flex items-center justify-center">
                <p className="text-gray-500 font-bold animate-pulse text-xl">Cargando métricas de la clínica...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">Panel de Control</h1>
                    <p className="text-gray-500 mt-1 font-medium italic">Clínica Veterinaria Mmartin - Gestión Integral</p>
                </div>
                <button
                    onClick={fetchDashboardData}
                    className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-100 hover:text-indigo-600 transition shadow-sm font-bold text-sm cursor-pointer"
                >
                    <FontAwesomeIcon icon={faSync} /> Sincronizar
                </button>
            </div>

            {/* FASE 7: Alerta Flash de Citas Remotas */}
            {pendingAppointments.length > 0 && (
                <div className="mb-8 bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-100 text-orange-500 min-w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner">
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-orange-800 tracking-tight">Solicitudes Pendientes</h3>
                            <p className="text-orange-700 text-sm font-medium mt-0.5">Tienes <span className="font-black text-orange-900 bg-orange-200/50 px-2 py-0.5 rounded">{pendingAppointments.length}</span> citas solicitadas por clientes que esperan tu confirmación.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onNavigate && onNavigate('calendar')}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm transition md:w-max w-full text-center whitespace-nowrap active:scale-95"
                    >
                        Gestionar Citas
                    </button>
                </div>
            )}

            {/* Tarjetas de Estadísticas Puras (KPIs) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div 
                    onClick={() => onNavigate && onNavigate('owners')}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 border-l-4 border-l-indigo-500 hover:shadow-md transition cursor-pointer hover:bg-indigo-50/30"
                >
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center text-2xl shadow-sm">
                        <FontAwesomeIcon icon={faUsers} />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dueños</p>
                        <p className="text-3xl font-black text-gray-800 leading-none">{metrics.total_owners}</p>
                    </div>
                </div>

                <div 
                    onClick={() => onNavigate && onNavigate('owners')}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 border-l-4 border-l-pink-500 hover:shadow-md transition cursor-pointer hover:bg-pink-50/30"
                >
                    <div className="w-14 h-14 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center text-2xl shadow-sm">
                        <FontAwesomeIcon icon={faPaw} />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pacientes</p>
                        <p className="text-3xl font-black text-gray-800 leading-none">{metrics.total_pets}</p>
                    </div>
                </div>

                <div 
                    onClick={() => onNavigate && onNavigate('calendar')}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 border-l-4 border-l-blue-500 hover:shadow-md transition cursor-pointer hover:bg-blue-50/30"
                >
                    <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-2xl shadow-sm">
                        <FontAwesomeIcon icon={faCalendarDay} />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Citas (Hoy)</p>
                        <p className="text-3xl font-black text-gray-800 leading-none">{metrics.appointments_today_count}</p>
                    </div>
                </div>

                <div 
                    onClick={() => onNavigate && onNavigate('inventory')}
                    className={`bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-5 hover:shadow-md transition cursor-pointer border-l-4 ${metrics.low_stock_count > 0 ? 'border-l-red-500 border-gray-100 hover:bg-red-50/30' : 'border-l-green-500 border-gray-100 hover:bg-green-50/30'}`}
                >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-sm ${metrics.low_stock_count > 0 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                        <FontAwesomeIcon icon={metrics.low_stock_count > 0 ? faExclamationTriangle : faBoxOpen} />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Alertas Stock</p>
                        <div className="flex items-baseline gap-2">
                            <p className={`text-3xl font-black leading-none ${metrics.low_stock_count > 0 ? 'text-red-600' : 'text-gray-800'}`}>{metrics.low_stock_count}</p>
                            {criticalStockCount > 0 && <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-black">!</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* FASE GRÁFICOS: El toque Maestro para la Presentación */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                
                {/* Gráfico de Evolución de Citas */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FontAwesomeIcon icon={faChartLine} className="text-indigo-500" /> Actividad de Citas (Última Semana)
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData.appointments_weekly}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{fill: '#f1f5f9'}}
                                />
                                <Bar dataKey="citas" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Gráfico de Distribución de Especies */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FontAwesomeIcon icon={faChartPie} className="text-pink-500" /> Pacientes por Especie
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData.species_distribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.species_distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Contenedores Grandes (Listas) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Listado de Citas Rápidas */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
                        <FontAwesomeIcon icon={faCalendarDay} className="text-blue-500" /> Agenda Diaria
                    </h3>
                    {appointments.length === 0 ? (
                        <p className="text-sm text-gray-500 p-6 bg-gray-50 rounded-xl text-center border-2 border-dashed border-gray-200">No hay citas programadas para el día de hoy. ¡Día libre!</p>
                    ) : (
                        <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                            {appointments.map(app => (
                                <div key={app.id} className="flex justify-between items-center p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition border border-transparent hover:border-blue-100">
                                    <div>
                                        <p className="font-bold text-gray-800">{app.pet?.name || 'Mascota eliminada'} <span className="text-xs text-gray-400 font-normal">({app.pet?.species})</span></p>
                                        <p className="text-xs text-gray-500 mt-0.5">{app.title}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-blue-700 bg-blue-100 px-3 py-1.5 rounded-lg shadow-sm">
                                            {new Date(app.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Listado de Productos en peligro */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" /> Reposición Urgente
                        {criticalStockCount > 0 && <span className="ml-auto bg-red-600 text-white text-[10px] px-2 py-1 rounded-full animate-bounce">¡Crítico: {criticalStockCount}!</span>}
                    </h3>
                    {lowStock.length === 0 ? (
                        <p className="text-sm text-gray-500 p-6 bg-gray-50 rounded-xl text-center border-2 border-dashed border-gray-200">Todo el inventario está sano. Ningún producto por debajo de 5 unidades.</p>
                    ) : (
                        <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                            {lowStock.map(p => (
                                <div key={p.id} className={`flex justify-between items-center p-4 rounded-xl border transition ${p.stock_quantity === 0 ? 'bg-red-100 border-red-200 text-red-900' : 'bg-red-50/50 border-red-100 text-red-800 hover:bg-red-50'}`}>
                                    <div>
                                        <p className="font-bold text-sm tracking-tight">{p.name} {p.stock_quantity === 0 && '🛑'}</p>
                                        <p className="text-xs opacity-70 mt-0.5">{p.description || "Sin descripción"}</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <span className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${p.stock_quantity === 0 ? 'text-red-700' : 'text-red-400'}`}>Quedan</span>
                                        <span className={`font-black text-2xl leading-none px-3 py-1 rounded-lg shadow-sm ${p.stock_quantity === 0 ? 'bg-red-600 text-white' : 'bg-red-100 text-red-600'}`}>{p.stock_quantity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default DashboardHome;
