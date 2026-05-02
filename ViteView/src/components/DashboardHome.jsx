import React, { useState, useEffect } from 'react';
import api from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faUsers, faBoxOpen, faCalendarDay, faExclamationTriangle, faSync } from '@fortawesome/free-solid-svg-icons';

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
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/dashboard');
            setMetrics(res.data.metrics);
            setAppointments(res.data.appointments_today);
            setLowStock(res.data.low_stock_products);
            setPendingAppointments(res.data.pending_appointments || []);
        } catch (error) {
            console.error("Error fetching dashboard data", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

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
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">Bienvenido a Veterinario Mmartin</h1>
                    <p className="text-gray-500 mt-1">Resumen general de la clínica en tiempo real.</p>
                </div>
                <button
                    onClick={fetchDashboardData}
                    className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-100 hover:text-indigo-600 transition shadow-sm font-bold text-sm cursor-pointer"
                >
                    <FontAwesomeIcon icon={faSync} /> Actualizar Datos
                </button>
            </div>

            {/* FASE 7: Alerta Flash de Citas Remotas (Recepción / Vet) */}
            {pendingAppointments.length > 0 && (
                <div className="mb-8 bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-100 text-orange-500 min-w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner">
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-orange-800 tracking-tight">Citas Pendientes de Aprobación</h3>
                            <p className="text-orange-700 text-sm font-medium mt-0.5">Tienes <span className="font-black text-orange-900 bg-orange-200/50 px-2 py-0.5 rounded">{pendingAppointments.length}</span> solicitudes de clientes bloqueando el calendario que requieren asignación horaria.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onNavigate && onNavigate('calendar')}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm transition md:w-max w-full text-center whitespace-nowrap active:scale-95"
                    >
                        Ir a Gestionarlas
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
                        <p className={`text-3xl font-black leading-none ${metrics.low_stock_count > 0 ? 'text-red-600' : 'text-gray-800'}`}>{metrics.low_stock_count}</p>
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

                {/* Listado de Productos en peligro %} */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" /> Reposición Urgente
                    </h3>
                    {lowStock.length === 0 ? (
                        <p className="text-sm text-gray-500 p-6 bg-gray-50 rounded-xl text-center border-2 border-dashed border-gray-200">Todo el inventario está sano. Ningún producto por debajo de 5 unidades.</p>
                    ) : (
                        <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                            {lowStock.map(p => (
                                <div key={p.id} className="flex justify-between items-center p-4 bg-red-50/50 text-red-800 rounded-xl border border-red-100 hover:bg-red-50 transition">
                                    <div>
                                        <p className="font-bold text-sm tracking-tight">{p.name}</p>
                                        <p className="text-xs opacity-70 mt-0.5">{p.description || "Sin descripción"}</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-red-400 mb-1">Quedan</span>
                                        <span className="font-black text-2xl leading-none bg-red-100 px-3 py-1 rounded-lg text-red-600 shadow-sm">{p.stock_quantity}</span>
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
