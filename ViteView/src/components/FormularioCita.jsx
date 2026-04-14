import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const FormularioCita = ({ isOpen, onClose, onSave, onUpdate, onDelete, initialDate, initialEvent, existingEvents = [] }) => {
    const [owners, setOwners] = useState([]);
    const [loadingOwners, setLoadingOwners] = useState(true);

    // Control del buscador en vivo (ese que monté en lugar del select feo)
    const [searchOwner, setSearchOwner] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    // Mis variables de estado para el formulario. Separadas para no liarme al limpiar.
    const [ownerId, setOwnerId] = useState('');
    const [petId, setPetId] = useState('');
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTimeSlot, setStartTimeSlot] = useState('');
    const [notes, setNotes] = useState('');
    const [type, setType] = useState('consultation'); // consultation, vaccination, surgery

    useEffect(() => {
        if (isOpen) {
            axios.get('http://localhost:8000/api/owners')
                .then(res => {
                    setOwners(res.data);
                    setLoadingOwners(false);
                })
                .catch(err => {
                    console.error("Error cargando dueños:", err);
                    setLoadingOwners(false);
                });

            // Al principio me pasaba que al cerrar y abrir la modal se colaban los datos viejos, así lo limpio siempre
            setSearchOwner('');

            // Funciones de formateo puras que ignoran por completo los husos horarios
            const formatDateObj = (dateObj) => {
                const y = dateObj.getFullYear();
                const m = String(dateObj.getMonth() + 1).padStart(2, '0');
                const d = String(dateObj.getDate()).padStart(2, '0');
                
                let hr = dateObj.getHours();
                let min = dateObj.getMinutes();
                
                const remainder = min % 15;
                if (remainder !== 0) {
                    if (min < 15) min = 0;
                    else if (min < 30) min = 15;
                    else if (min < 45) min = 30;
                    else { min = 45; }
                }
                
                return { 
                    fecha: `${y}-${m}-${d}`, 
                    hora: `${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}` 
                };
            };

            const formatString = (rawStr) => {
                const cleanStr = rawStr.split('.')[0].replace('T', ' ').replace('Z', '');
                const [fecha, horaCompleta] = cleanStr.split(' ');
                return { fecha, hora: horaCompleta.substring(0, 5) };
            };

            if (initialEvent) {
                // MODO EDICIÓN: El calendario padre me ha pasado un evento. Relleno los inputs.
                setOwnerId(initialEvent.owner_id);
                setSearchOwner(initialEvent.owner?.name || '');
                setPetId(initialEvent.pet_id);
                setTitle(initialEvent.title);
                setNotes(initialEvent.notes || '');
                setType(initialEvent.type || 'consultation');
                
                // Extraemos la fecha y hora cortando cuajo el string puro sin dejar que JS aplique Zonas Horarias
                const { fecha, hora } = formatString(initialEvent.start_time);
                setStartDate(fecha);
                setStartTimeSlot(hora);
            } else if (initialDate) {
                // MODO NUEVA CITA: El calendario me pasa solo el día que han pinchado en formato Objeto Date
                setOwnerId('');
                setPetId('');
                setTitle('');
                setNotes('');
                setType('consultation');

                const { fecha, hora } = formatDateObj(initialDate);
                setStartDate(fecha);
                setStartTimeSlot(hora);
            }
        }
    }, [isOpen, initialDate, initialEvent]);

    // Filtramos sobre el array completo a medida que va escribiendo letras en el buscador
    const filteredOwners = owners.filter(o =>
        o.name.toLowerCase().includes(searchOwner.toLowerCase()) ||
        o.telefono?.includes(searchOwner)
    );

    const selectedOwner = owners.find(o => String(o.id) === String(ownerId) || String(o._id) === String(ownerId));
    const ownerPets = selectedOwner ? selectedOwner.pets : [];

    // Generar opciones de tiempo (15 mins interval)
    const timeOptions = [];
    for (let h = 8; h <= 20; h++) {
        const hourStr = h.toString().padStart(2, '0');
        timeOptions.push(`${hourStr}:00`);
        timeOptions.push(`${hourStr}:15`);
        timeOptions.push(`${hourStr}:30`);
        timeOptions.push(`${hourStr}:45`);
    }

    // Averiguar qué horas de timeOptions ya están cogidas o solapan ese mismo startDate
    const occupiedTimes = [];
    const overlappingTimes = [];

    existingEvents
        .filter(ev => ev.resource.start_time.startsWith(startDate)) // Las citas del mismo día (Tanto ISO como plano)
        .filter(ev => initialEvent ? ev.id !== initialEvent.id : true) // Si estamos editando mi cita, no cuenta como ocupada
        .forEach(ev => {
            // Laravel manda 2026-04-09T17:30:00.000000Z por norma
            const cleanStr = ev.resource.start_time.split('.')[0].replace('T', ' ').replace('Z', '');
            const timePart = cleanStr.split(' ')[1]; 
            if (!timePart) return;
            
            const exactHm = timePart.substring(0, 5); // "17:30"
            occupiedTimes.push(exactHm);

            // Calcular 3 cuartos de hora adicionales visuales (Porque el bloque dura 1h en calendario visual)
            const [h, m] = exactHm.split(':').map(Number);
            let mins = h * 60 + m;
            for (let i = 1; i <= 3; i++) {
                mins += 15;
                const newH = Math.floor(mins / 60);
                const newM = mins % 60;
                const strTime = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
                overlappingTimes.push(strTime);
            }
        });

    // Funcion maestra que lanza todo al Backend. O POST o PUT según toque.
    const handleSubmit = (e) => {
        e.preventDefault();

        const citaData = {
            owner_id: ownerId,
            pet_id: petId,
            title: title,
            start_time: `${startDate} ${startTimeSlot}:00`,
            notes: notes,
            type: type,
            status: 'scheduled'
        };

        if (initialEvent) {
            // Si hay initialEvent es que estoy editando una cita que venía de props, mando el PUT para modificar
            // Petición PUT para actualizar
            axios.put(`http://localhost:8000/api/appointments/${initialEvent.id}`, citaData)
                .then(res => {
                    onUpdate(res.data);
                    onClose();
                })
                .catch(err => {
                    const msj = err.response?.data?.message || 'Error al actualizar la cita.';
                    Swal.fire({ icon: 'error', title: 'Error', text: msj });
                });
        } else {
            // Si vengo de cero mando el POST limpio para grabar
            // Petición POST para guardar nueva
            axios.post('http://localhost:8000/api/appointments', citaData)
                .then(res => {
                    onSave(res.data);
                    onClose();
                })
                .catch(err => {
                    const msj = err.response?.data?.message || 'Error al guardar la cita.';
                    Swal.fire({ icon: 'error', title: 'Error', text: msj });
                });
        }
    };

    // Botón rojo activado. Borra directo en BD.
    const handleBorrarCita = async () => {
        const result = await Swal.fire({
            title: '¿Eliminar cita?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, borrar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            axios.delete(`http://localhost:8000/api/appointments/${initialEvent.id}`)
                .then(() => {
                    onDelete(initialEvent.id);
                    onClose();
                    Swal.fire('¡Borrada!', 'La cita ha sido eliminada.', 'success');
                })
                .catch(err => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo borrar la cita.' }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 border-b pb-2 text-indigo-700">
                    {initialEvent ? " Editar Cita" : " Nueva Cita Médica"}
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    {/* La zona del Buscador que me curré para que sea más funcional */}
                    <div className="flex flex-col gap-2 p-3 bg-indigo-50 rounded border border-indigo-100 relative">
                        <label className="text-sm font-bold text-gray-700">Buscar dueño</label>
                        <input
                            type="text"
                            placeholder="Escribe el nombre o teléfono..."
                            value={searchOwner}
                            onChange={(e) => {
                                setSearchOwner(e.target.value);
                                setShowDropdown(true);
                                setOwnerId(''); // Deseleccionar al escribir
                                setPetId(''); // Resetear mascota también
                            }}
                            onFocus={() => setShowDropdown(true)}
                            onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Delay para poder pinchar
                            className="p-2 border rounded bg-white w-full h-10"
                        />

                        {/* Lista de resultados que parece un 'select', si tocas fuera se esconde gracias al 'onBlur' */}
                        {showDropdown && searchOwner.length > 0 && (
                            <ul className="absolute top-16 left-0 w-full bg-white border border-gray-200 mt-2 max-h-40 overflow-y-auto rounded shadow-xl z-50">
                                {loadingOwners && <li className="p-2 text-sm text-gray-500">Cargando...</li>}
                                {filteredOwners.length > 0 ? (
                                    filteredOwners.map(owner => (
                                        <li
                                            key={owner.id || owner._id}
                                            onClick={() => {
                                                setOwnerId(owner.id || owner._id);
                                                setSearchOwner(owner.name);
                                                setShowDropdown(false);
                                                setPetId('');
                                            }}
                                            className="p-3 text-sm hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-0"
                                        >
                                            <span className="font-bold text-gray-800">{owner.name}</span> <span className="text-gray-500 text-xs ml-2"> Telefono: {owner.telefono}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="p-2 text-sm text-gray-500 italic">No se encontraron clientes</li>
                                )}
                            </ul>
                        )}
                        {!ownerId && <span className="text-xs text-red-500 mt-1">Por favor, elige un dueño de la lista buscada.</span>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">Mascota Paciente</label>
                        <select
                            value={petId}
                            onChange={(e) => setPetId(e.target.value)}
                            required
                            disabled={!ownerId}
                            className="p-2 border rounded bg-gray-50 h-10 disabled:opacity-50"
                        >
                            <option value="">-- Selecciona Mascota --</option>
                            {ownerPets && ownerPets.map(pet => (
                                <option key={pet.id || pet._id} value={pet.id || pet._id}>
                                    {pet.name} ({pet.species})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-sm font-bold text-gray-700">Motivo de la visita</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ej: Vacuna Rabia..."
                                required
                                className="p-2 border rounded bg-gray-50 h-10"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-1/3">
                            <label className="text-sm font-bold text-gray-700">Tipo</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="p-2 border rounded bg-gray-50 h-10"
                            >
                                <option value="consultation">Consulta</option>
                                <option value="vaccination">Vacuna</option>
                                <option value="surgery">Cirugía</option>
                                <option value="emergency">Urgencia</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-sm font-bold text-gray-700">Día de la Cita</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                                className="p-2 border rounded bg-gray-50 h-10 w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-sm font-bold text-gray-700">Hora (Módulo de 15m)</label>
                            <select
                                value={startTimeSlot}
                                onChange={(e) => setStartTimeSlot(e.target.value)}
                                required
                                className="p-2 border rounded bg-gray-50 h-10 w-full"
                            >
                                <option value="">-- Selecciona hora exacta --</option>
                                {timeOptions.map(time => {
                                    const isOccupied = occupiedTimes.includes(time);
                                    const isOverlapping = !isOccupied && overlappingTimes.includes(time);
                                    
                                    let classes = "";
                                    let suffix = "";

                                    if (isOccupied) {
                                        classes = "text-red-500 bg-red-50 font-bold";
                                        suffix = "❌ (Ocupado)";
                                    } else if (isOverlapping) {
                                        classes = "text-yellow-700 bg-yellow-50";
                                        suffix = "⚠️ (Solapado)";
                                    }

                                    return (
                                        <option 
                                            key={time} 
                                            value={time} 
                                            disabled={isOccupied}
                                            className={classes}
                                        >
                                            {time} {suffix}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">Observaciones (Opcional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Alergias previas, notas médicas..."
                            className="p-2 border rounded bg-gray-50 min-h-20"
                        />
                    </div>

                    <div className="flex justify-between mt-4">
                        {/* Condicional molón: el botón de borrado de la esquina solo sale en el modo de actualización */}
                        {initialEvent ? (
                            <button
                                type="button"
                                onClick={handleBorrarCita}
                                className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded font-bold"
                            >
                                Eliminar
                            </button>
                        ) : (
                            <div></div> // Espaciador para empujar los otros botones a la derecha
                        )}

                        <div className="flex gap-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded font-bold hover:bg-gray-400">
                                Cancelar
                            </button>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700">
                                {initialEvent ? "Actualizar Cita" : "Guardar Cita"}
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default FormularioCita;
