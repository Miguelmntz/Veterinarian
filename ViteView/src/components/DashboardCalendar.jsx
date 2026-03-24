import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

const DashboardCalendar = () => {
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null); // Aquí guardaré la cita entera de la BBDD si es que la pinchan // Nuevo estado para la cita a editar
    
    useEffect(() => {
        axios.get('http://localhost:8000/api/appointments')
            .then(res => {
                const formattedEvents = res.data.map(apt => ({
                    id: apt.id,
                    title: `${apt.title} - ${apt.pet?.name || 'Mascota'}`,
                    start: new Date(apt.start_time),
                    end: new Date(apt.end_time),
                    resource: apt
                }));
                setEvents(formattedEvents);
            })
            .catch(err => console.error(err));
    }, []);

    // Cuando hacen clic arrastrando en los cuadros de días vacíos, disparo esto para crear hueco
    const handleSelectSlot = (slotInfo) => {
        setSelectedDate(slotInfo.start);
        setSelectedEvent(null); // Limpio esto sí o sí para garantizar abrir siempre un form vacío
        setIsModalOpen(true);
    };

    // Si lo que pinchas es una pastilla de color azul (una cita que ya existía)
    const handleSelectEvent = (event) => {
        setSelectedEvent(event.resource); // Pasamos toda la información de la base de datos
        setSelectedDate(null);
        setIsModalOpen(true);
    };

    // El modal hijo me ha respondido que se guardó guay, actualizo estado sin F5
    const handleSaveCita = (nuevaCita) => {
        const nuevoEvento = {
            id: nuevaCita.id,
            title: `${nuevaCita.title} - ${nuevaCita.pet.name}`,
            start: new Date(nuevaCita.start_time),
            end: new Date(nuevaCita.end_time),
            resource: nuevaCita
        };
        setEvents([...events, nuevoEvento]);
    };

    // Lo mismo pero mapeando el mismo id con la info fresca del form de la modal
    const handleUpdateCita = (citaActualizada) => {
        setEvents(events.map(ev => ev.id === citaActualizada.id ? {
            id: citaActualizada.id,
            title: `${citaActualizada.title} - ${citaActualizada.pet.name}`,
            start: new Date(citaActualizada.start_time),
            end: new Date(citaActualizada.end_time),
            resource: citaActualizada
        } : ev));
    };

    // A tomar viento la cita del calendario visualmente
    const handleDeleteCita = (idBorrar) => {
        setEvents(events.filter(ev => ev.id !== idBorrar));
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
                  onSelectSlot={handleSelectSlot}
                  onSelectEvent={handleSelectEvent}
                  messages={{
                    next: ">",
                    previous: "<",
                    today: "Hoy",
                    month: "Mes",
                    week: "Semana",
                    day: "Día"
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
            />
        </div>
    );
};

export default DashboardCalendar;
