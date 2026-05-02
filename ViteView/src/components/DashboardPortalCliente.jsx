import React, { useState, useEffect } from 'react';
import api from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDog, faSyringe, faStethoscope, faNotesMedical, faSpinner, faCalendarPlus, faClock, faUsers } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import HistorialMascota from './HistorialMascota';

const DashboardPortalCliente = ({ currentUser, onLogout }) => {
    const [ownerData, setOwnerData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal de Historial Clínico
    const [selectedPetHistory, setSelectedPetHistory] = useState(null);

    // Formulario de Solicitud de Cita Remota
    const [requestingPet, setRequestingPet] = useState(null);
    const [fechaCita, setFechaCita] = useState('');
    const [turno, setTurno] = useState('09:00'); // Valor predeterminado de turno (Sujeto a confirmación)
    const [motivo, setMotivo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estado del formulario de auto-registro
    const [newProfile, setNewProfile] = useState({ 
        name: currentUser.name || '', 
        telefono: '', 
        direccion: '',
        petName: '',
        petSpecies: 'Perro',
        petRaza: '',
        petPeso: '',
        petFechNac: ''
    });

    useEffect(() => {
        if (!currentUser.owner_id) {
            setLoading(false);
            return; // No owner linked
        }

        api.get(`/owners/${currentUser.owner_id}`)
            .then(res => {
                setOwnerData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [currentUser]);

    const handleSolicitarCita = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        let notesStr = `Solicitado desde portal web. Pendiente de confirmación del veterinario.`;
        if (turno === '09:00') notesStr += ' Preferencia: Por la mañana.';
        else if (turno === '16:00') notesStr += ' Preferencia: Por la tarde.';
        else notesStr += ' Preferencia: Me es indiferente la hora.';

        const payload = {
            owner_id: currentUser.owner_id,
            pet_id: requestingPet.id,
            title: motivo,
            start_time: `${fechaCita} ${turno === 'any' ? '12:00' : turno}:00`, 
            notes: notesStr,
            type: 'consultation',
            status: 'pending' // Estado inicial: En cola de pendientes de confirmación
        };

        try {
            await api.post('/appointments', payload);
            Swal.fire({
                icon: 'success',
                title: 'Solicitud Enviada',
                text: 'Tu petición de cita ha sido recibida. El veterinario te confirmará la hora exacta en breve.',
                confirmButtonColor: '#4f46e5'
            });
            setRequestingPet(null); // Reset del estado del formulario
            setFechaCita('');
            setMotivo('');
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Ups', text: 'Error enviando solicitud.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-10 text-center"><FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-indigo-300" /></div>;

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post('/owners', {
                name: newProfile.name,
                email: currentUser.email,
                telefono: newProfile.telefono,
                direccion: newProfile.direccion || 'Dirección no especificada',
                pets: [{
                    name: newProfile.petName,
                    species: newProfile.petSpecies,
                    raza: newProfile.petRaza || 'Mestizo / No especificada',
                    peso: parseFloat(newProfile.petPeso) || 1.0,
                    fech_nac: newProfile.petFechNac || new Date().toISOString().split('T')[0]
                }]
            });
            Swal.fire({
                icon: 'success', 
                title: 'Perfil Completado', 
                text: 'Los datos de tu ficha clínica han sido vinculados correctamente.'
            }).then(() => {
                // Actualización del estado persistente local post-registro
                const savedUser = JSON.parse(localStorage.getItem('vet_user'));
                if (savedUser) {
                    savedUser.owner_id = res.data.id;
                    localStorage.setItem('vet_user', JSON.stringify(savedUser));
                }
                window.location.reload();
            });
        } catch(error) {
            console.error("Detalle del fallo:", error.response);
            const serverMessage = error.response?.data?.message || error.message;
            const validationErrors = error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : '';
            
            Swal.fire({ 
                icon: 'error', 
                title: 'Error de Servidor', 
                text: `${serverMessage} \n\n ${validationErrors}`
            });
            setIsSubmitting(false);
        }
    };

    if (!ownerData) {
        return (
            <div className="bg-white p-6 md:p-10 rounded-2xl border border-gray-100 mt-10 max-w-2xl mx-auto shadow-xl">
                <div className="text-center mb-8">
                    <div className="bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FontAwesomeIcon icon={faDog} size="2x" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">Completar Registro</h2>
                    <p className="text-gray-500 font-medium">Necesitamos tus datos de contacto para abrirte tu ficha médica clínica oficial.</p>
                </div>
                
                <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-indigo-800 border-b pb-2 flex items-center gap-2">
                                <FontAwesomeIcon icon={faUsers} /> Tus Datos
                            </h3>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Tu Correo Institucional</label>
                                <input type="text" readOnly value={currentUser.email} className="w-full p-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-400 font-bold cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Nombre Completo</label>
                                <input type="text" required value={newProfile.name} onChange={e => setNewProfile({...newProfile, name: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 font-medium" placeholder="P. Ej: Juan Carlos Gómez" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Teléfono</label>
                                <input type="tel" required value={newProfile.telefono} onChange={e => setNewProfile({...newProfile, telefono: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 font-medium" placeholder="600 123 456" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Dirección Postal (Opcional)</label>
                                <input type="text" value={newProfile.direccion} onChange={e => setNewProfile({...newProfile, direccion: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 font-medium" placeholder="Calle Falsa 123, Madrid" />
                            </div>
                        </div>

                        <div className="space-y-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                            <h3 className="text-sm font-black text-indigo-800 border-b border-indigo-200 pb-2 flex items-center gap-2">
                                <FontAwesomeIcon icon={faDog} /> Datos de tu Mascota
                            </h3>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Nombre de la Mascota</label>
                                <input type="text" required value={newProfile.petName} onChange={e => setNewProfile({...newProfile, petName: e.target.value})} className="w-full p-4 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-400 font-medium" placeholder="Ej: Toby" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Especie</label>
                                <select required value={newProfile.petSpecies} onChange={e => setNewProfile({...newProfile, petSpecies: e.target.value})} className="w-full p-4 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-400 font-medium text-gray-700">
                                    <option value="Perro">Perro</option>
                                    <option value="Gato">Gato</option>
                                    <option value="Exótico">Exótico / Otro</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Peso (kg)</label>
                                    <input type="number" step="0.1" required value={newProfile.petPeso} onChange={e => setNewProfile({...newProfile, petPeso: e.target.value})} className="w-full p-4 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-400 font-medium" placeholder="Ej: 5.4" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Nacimiento</label>
                                    <input type="date" required max={new Date().toISOString().split('T')[0]} value={newProfile.petFechNac} onChange={e => setNewProfile({...newProfile, petFechNac: e.target.value})} className="w-full p-4 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-400 font-medium text-gray-700" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Raza (Opcional)</label>
                                <input type="text" value={newProfile.petRaza} onChange={e => setNewProfile({...newProfile, petRaza: e.target.value})} className="w-full p-4 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-400 font-medium" placeholder="Ej: Pastor Alemán" />
                            </div>
                        </div>
                    </div>
                    
                    <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-75 disabled:cursor-wait">
                        {isSubmitting ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Crear Ficha de Cliente Oficial'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="bg-transparent flex flex-col gap-6">
            
            {/* Cabecera del Portal Cliente */}
            <div className="bg-gradient-to-r from-indigo-800 to-indigo-600 rounded-2xl p-8 flex justify-between items-center text-white shadow-lg overflow-hidden relative">
                <FontAwesomeIcon icon={faDog} size="10x" className="absolute -right-10 -top-10 opacity-10" />
                <div>
                   <h1 className="text-3xl font-black mb-2 tracking-tight">Bienvenido, {ownerData.name}</h1>
                   <p className="text-indigo-200 font-medium tracking-wide">Área privada • Mis Mascotas</p>
                </div>
            </div>

            {/* Listado de Mascotas Propias */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ownerData.pets?.map(pet => (
                    <div key={pet.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow flex flex-col justify-between hover:shadow-lg transition">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faDog} className="text-indigo-400" /> {pet.name}
                                </h2>
                                <p className="text-gray-500 font-medium text-sm mt-1">{pet.species} • {pet.raza}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button 
                                onClick={() => setSelectedPetHistory(pet)}
                                className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-bold py-2 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-sm"
                            >
                                <FontAwesomeIcon icon={faNotesMedical} /> Ver Historial
                            </button>
                            <button 
                                onClick={() => setRequestingPet(pet)}
                                className="flex-1 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white font-bold py-2 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-sm"
                            >
                                <FontAwesomeIcon icon={faCalendarPlus} /> Pedir Cita
                            </button>
                        </div>
                    </div>
                ))}

                {(!ownerData.pets || ownerData.pets.length === 0) && (
                    <div className="col-span-full text-center p-10 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400">
                        No hay mascotas asignadas a tu cuenta.
                    </div>
                )}
            </div>

            {/* Formulario Inline de Pedir Cita */}
            {requestingPet && (
                <div className="mt-8 bg-white p-8 rounded-2xl shadow-lg border border-indigo-100 animate-in slide-in-from-bottom-5">
                    <h3 className="text-2xl font-black text-indigo-800 mb-6 flex items-center gap-3">
                        <FontAwesomeIcon icon={faCalendarPlus} /> Solicitar cita para {requestingPet.name}
                    </h3>

                    <form onSubmit={handleSolicitarCita} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Día deseado</label>
                                <input 
                                    type="date" 
                                    required 
                                    min={new Date().toISOString().split('T')[0]} // Restricción de selección a fechas futuras
                                    value={fechaCita} 
                                    onChange={e => setFechaCita(e.target.value)}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white text-gray-700 font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Preferencia Horaria</label>
                                <div className="flex bg-gray-50 rounded-xl border border-gray-200 p-1">
                                    <button 
                                        type="button" 
                                        onClick={() => setTurno('09:00')} 
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-lg font-bold text-xs transition ${turno === '09:00' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <FontAwesomeIcon icon={faClock} /> Mañana
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setTurno('16:00')} 
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-lg font-bold text-xs transition ${turno === '16:00' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <FontAwesomeIcon icon={faClock} /> Tarde
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setTurno('any')} 
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-lg font-bold text-xs transition ${turno === 'any' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                                        title="Me es indiferente"
                                    >
                                        <FontAwesomeIcon icon={faClock} /> Cualquiera
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Motivo de la Visita</label>
                            <input 
                                type="text" 
                                required 
                                placeholder="Ej: Revisión general, Vacuna antirrábica, Vómitos..." 
                                value={motivo} 
                                onChange={e => setMotivo(e.target.value)}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white text-gray-700 font-medium"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button 
                                type="button" 
                                onClick={() => setRequestingPet(null)}
                                className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-75 disabled:cursor-wait flex items-center gap-2"
                            >
                                {isSubmitting && <FontAwesomeIcon icon={faSpinner} spin />}
                                Enviar Solicitud de Cita al Veterinario
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Renderizado condicional del modal de historial clínico (Acceso restringido por sesión) */}
            <HistorialMascota 
                isOpen={!!selectedPetHistory} 
                onClose={() => setSelectedPetHistory(null)} 
                pet={selectedPetHistory} 
                currentUser={currentUser}
            />
        </div>
    );
};

export default DashboardPortalCliente;
