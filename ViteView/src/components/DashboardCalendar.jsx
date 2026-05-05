import React, { useState, useEffect } from 'react';
import api from '../api';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import FormularioCita from './FormularioCita';

const locales = {
    'es': es,
}

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
})

const CustomEvent = ({ event }) => {
    return (
        <div className="flex items-center gap-1.5 overflow-hidden w-full h-full p-0.5">
            {event.resource.pet?.photo_path ? (
                <img
                    src={`https://veterinaria.martinezyelamosabogados.es/storage/${event.resource.pet.photo_path}`}
                    alt="avatar"
                    className="w-5 h-5 rounded-full object-cover flex-shrink-0 bg-white"
                />
            ) : (
                <div className="w-5 h-5 rounded-full bg-white text-blue-600 font-bold flex flex-shrink-0 items-center justify-center text-[10px]">
                    {event.resource.pet?.name ? event.resource.pet.name.charAt(0).toUpperCase() : 'M'}
                </div>
            )}
            <span className="text-xs truncate font-bold">{event.resource.pet.name}</span>
            
        </div>
    );
};

const DashboardCalendar = () => {
    const [events, setEvents] = useState([]);
    const [view, setView] = useState('month');
    const [date, setDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Función auxiliar para parsear fechas asegurando la zona horaria local e ignorando UTC
    const parseLocal = (dateString) => {
        if (!dateString) return new Date();
        const cleanStr = dateString.split('.')[0].replace('T', ' ').replace('Z', '');
        const [dt, time] = cleanStr.split(' ');
        const [y, m, d] = dt.split('-');
        const [H, M, S] = (time || '00:00:00').split(':');
        return new Date(y, m - 1, d, H, M, S);
    };

    useEffect(() => {
        api.get('/appointments')
            .then(res => {
                const formattedEvents = res.data.map(apt => ({
                    id: apt.id,
                    title: `${apt.title} - ${apt.pet?.name || 'Mascota'}`,
                    start: parseLocal(apt.start_time),
                    end: new Date(parseLocal(apt.start_time).getTime() + 60 * 60 * 1000), // Renderizado visual de 1h
                    resource: apt
                }));
                setEvents(formattedEvents);
            })
            .catch(err => console.error(err));
    }, []);

    // Controlador de eventos para la selección de celdas vacías del calendario (creación de nueva cita)
    const handleSelectSlot = (slotInfo) => {
        setSelectedDate(slotInfo.start);
        setSelectedEvent(null); // Reinicio del estado del evento para asegurar que el formulario de creación esté vacío
        setIsModalOpen(true);
    };

    // Controlador de eventos para la selección de una cita existente en el calendario
    const handleSelectEvent = (event) => {
        setSelectedEvent(event.resource); // Asignación de los datos completos del registro seleccionado
        setSelectedDate(null);
        setIsModalOpen(true);
    };

    // Actualización del estado local tras la confirmación de guardado desde el componente hijo (FormularioCita)
    const handleSaveCita = (nuevaCita) => {
        const nuevoEvento = {
            id: nuevaCita.id,
            title: `${nuevaCita.title} - ${nuevaCita.pet?.name || 'Mascota'}`,
            start: parseLocal(nuevaCita.start_time),
            end: new Date(parseLocal(nuevaCita.start_time).getTime() + 60 * 60 * 1000),
            resource: nuevaCita
        };
        setEvents([...events, nuevoEvento]);
    };

    // Actualización del estado local mapeando el ID modificado con los datos actualizados del formulario
    const handleUpdateCita = (citaActualizada) => {
        setEvents(events.map(ev => ev.id === citaActualizada.id ? {
            id: citaActualizada.id,
            title: `${citaActualizada.title} - ${citaActualizada.pet?.name || 'Mascota'}`,
            start: parseLocal(citaActualizada.start_time),
            end: new Date(parseLocal(citaActualizada.start_time).getTime() + 60 * 60 * 1000),
            resource: citaActualizada
        } : ev));
    };

    // Eliminación visual de la cita en el estado local del calendario
    const handleDeleteCita = (idBorrar) => {
        setEvents(events.filter(ev => ev.id !== idBorrar));
    };

    // Configuración de estilos condicionales: asignación de color según el estado de la cita (pendiente/confirmada)
    const eventStyleGetter = (event) => {
        let backgroundColor = '#4f46e5'; 
        if (event.resource.status === 'pending') backgroundColor = '#f97316';
        if (event.resource.status === 'cancelled') backgroundColor = '#ef4444';
        if (event.resource.status === 'completed') backgroundColor = '#10b981';
        return { style: { backgroundColor, borderRadius: '8px', border: 'none' } };
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 font-sans">Calendario de Citas</h2>

            <div style={{ height: '700px' }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    culture="es"
                    selectable={true}
                    views={['month', 'week', 'day', 'agenda']}
                    view={view}
                    onView={(newView) => setView(newView)}
                    date={date}
                    onNavigate={(newDate) => setDate(newDate)}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    messages={{
                        next: ">",
                        previous: "<",
                        today: "Hoy",
                        month: "Mes",
                        week: "Semana",
                        day: "Día"
                    }}
                    components={{
                        event: CustomEvent
                    }}
                    style={{ height: '100%' }}
                />
            </div>

            <FormularioCita
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveCita}
                onUpdate={handleUpdateCita}
                onDelete={handleDeleteCita}
                initialDate={selectedDate}
                initialEvent={selectedEvent}
                existingEvents={events}
            />
        </div>
    );
};

export default DashboardCalendar;
