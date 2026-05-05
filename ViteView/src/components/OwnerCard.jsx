import React, { useState } from 'react';
import api from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPhone, faMapMarkerAlt, faPencilAlt, faTrashAlt, faStethoscope, faPlus, faTimes, faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import HistorialMascota from './HistorialMascota';

const OwnerCard = ({ owner, onUpdateOwner }) => {
    // Estados para Modales
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditOwnerForm, setShowEditOwnerForm] = useState(false);
    const [zoomImage, setZoomImage] = useState(null);
    const [historyPet, setHistoryPet] = useState(null);

    // Estados para formularios
    const [editingPetId, setEditingPetId] = useState(null);
    const [nuevaMascota, setNuevaMascota] = useState({
        name: '', species: 'Perro', raza: '', peso: '', fech_nac: '', photo: null
    });
    const [ownerEdicion, setOwnerEdicion] = useState({ name: '', email: '', telefono: '', direccion: '' });

    // --- FUNCIONES DE MASCOTAS ---

    const handleSavePet = async () => {
        try {
            const ownerId = owner.id || owner._id;
            const formData = new FormData();
            formData.append('owner_id', ownerId);
            formData.append('name', nuevaMascota.name);
            formData.append('species', nuevaMascota.species);
            if (nuevaMascota.raza) formData.append('raza', nuevaMascota.raza);
            if (nuevaMascota.peso) formData.append('peso', nuevaMascota.peso);
            if (nuevaMascota.fech_nac) formData.append('fech_nac', nuevaMascota.fech_nac);
            if (nuevaMascota.photo) formData.append('photo', nuevaMascota.photo);

            if (editingPetId) {
                formData.append('_method', 'PUT');
                const res = await api.post(`/pets/${editingPetId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                onUpdateOwner({
                    ...owner,
                    pets: owner.pets.map(p => (p.id || p._id) === editingPetId ? res.data : p)
                });
            } else {
                const res = await api.post('/pets', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                onUpdateOwner({
                    ...owner,
                    pets: [...(owner.pets || []), res.data]
                });
            }

            setShowAddForm(false);
            setEditingPetId(null);
            setNuevaMascota({ name: '', species: 'Perro', raza: '', peso: '', fech_nac: '', photo: null });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al guardar la mascota' });
        }
    };

    const handleDeletePet = async (petId) => {
        const result = await Swal.fire({
            title: '¿Eliminar mascota?',
            text: "Si es la última mascota, el cliente también se borrará.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            try {
                const res = await api.delete(`/pets/${petId}`);
                if (res.status === 200 && res.data.message?.includes('dueño eliminados')) {
                    Swal.fire('Eliminado', 'Cliente y mascota eliminados por falta de pacientes.', 'success');
                    onUpdateOwner(null); // Notificamos que el dueño ya no existe
                } else {
                    onUpdateOwner({
                        ...owner,
                        pets: owner.pets.filter(p => (p.id || p._id) !== petId)
                    });
                    Swal.fire('Eliminado', 'Mascota eliminada correctamente', 'success');
                }
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar la mascota', 'error');
            }
        }
    };

    // --- FUNCIONES DE DUEÑO ---

    const handleSaveOwner = async () => {
        try {
            const res = await api.put(`/owners/${owner.id || owner._id}`, ownerEdicion);
            onUpdateOwner(res.data);
            setShowEditOwnerForm(false);
            Swal.fire({ icon: 'success', title: 'Actualizado', timer: 1500, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al actualizar datos' });
        }
    };

    const openEditOwner = () => {
        setOwnerEdicion({
            name: owner.name || '',
            email: owner.email || '',
            telefono: owner.telefono || '',
            direccion: owner.direccion || ''
        });
        setShowEditOwnerForm(true);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col h-full hover:shadow-md transition duration-300">
            {/* Header del Cliente */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                        <FontAwesomeIcon icon={faUser} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{owner.name}</h2>
                </div>
                <div className="flex gap-2">
                    <button onClick={openEditOwner} className="text-gray-300 hover:text-indigo-600 transition p-1" title="Editar Cliente">
                        <FontAwesomeIcon icon={faPencilAlt} />
                    </button>
                </div>
            </div>

            <div className="text-sm text-gray-500 mb-6 space-y-1">
                <p className="flex items-center gap-2"><FontAwesomeIcon icon={faPhone} className="w-4" /> {owner.telefono}</p>
                <p className="flex items-center gap-2"><FontAwesomeIcon icon={faMapMarkerAlt} className="w-4" /> {owner.direccion || 'Sin dirección'}</p>
            </div>

            {/* Listado de Mascotas */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 flex-grow">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pacientes</span>
                <div className="mt-3 space-y-2">
                    {owner.pets && owner.pets.length > 0 ? (
                        owner.pets.map((pet) => (
                            <div key={pet.id} className="group flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100 text-sm shadow-sm hover:border-indigo-100 transition">
                                <div className="flex items-center gap-2">
                                    <div className="relative cursor-pointer" onClick={() => setZoomImage(pet.photo_path)}>
                                        {pet.photo_path ? (
                                            <img src={`https://veterinaria.martinezyelamosabogados.es/storage/${pet.photo_path}`} alt={pet.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-500 font-bold flex items-center justify-center text-xs">
                                                {pet.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                            <FontAwesomeIcon icon={faSearchPlus} className="text-white text-[10px]" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 leading-tight">{pet.name}</p>
                                        <p className="text-[10px] text-indigo-500 font-bold">{pet.species}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setHistoryPet(pet)} className="p-2 text-gray-300 hover:text-indigo-600 transition opacity-0 group-hover:opacity-100" title="Historial">
                                        <FontAwesomeIcon icon={faStethoscope} />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setNuevaMascota({ ...pet, photo: null });
                                            setEditingPetId(pet.id);
                                            setShowAddForm(true);
                                        }} 
                                        className="p-2 text-gray-300 hover:text-indigo-500 transition opacity-0 group-hover:opacity-100" title="Editar">
                                        <FontAwesomeIcon icon={faPencilAlt} />
                                    </button>
                                    <button onClick={() => handleDeletePet(pet.id)} className="p-2 text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100" title="Eliminar">
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-gray-400 italic text-center py-2">Sin mascotas registradas</p>
                    )}
                </div>
            </div>

            <button
                onClick={() => {
                    setNuevaMascota({ name: '', species: 'Perro', raza: '', peso: '', fech_nac: '', photo: null });
                    setEditingPetId(null);
                    setShowAddForm(true);
                }}
                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-[10px] font-bold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all"
            >
                + Registrar nueva mascota
            </button>

            {/* MODAL: Añadir/Editar Mascota */}
            {showAddForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">{editingPetId ? 'Editar Paciente' : 'Nuevo Paciente'}</h3>
                        <div className="space-y-4">
                            <input
                                type="text" placeholder="Nombre" className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                value={nuevaMascota.name}
                                onChange={e => setNuevaMascota({ ...nuevaMascota, name: e.target.value })}
                            />
                            <select
                                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                value={nuevaMascota.species}
                                onChange={e => setNuevaMascota({ ...nuevaMascota, species: e.target.value })}
                            >
                                <option value="Perro">Perro</option>
                                <option value="Gato">Gato</option>
                                <option value="Ave">Ave</option>
                                <option value="Otros">Otros</option>
                            </select>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text" placeholder="Raza" className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={nuevaMascota.raza}
                                    onChange={e => setNuevaMascota({ ...nuevaMascota, raza: e.target.value })}
                                />
                                <input
                                    type="number" placeholder="Peso (kg)" className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={nuevaMascota.peso}
                                    onChange={e => setNuevaMascota({ ...nuevaMascota, peso: e.target.value })}
                                />
                            </div>
                            <input
                                type="file" className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-600 font-bold"
                                onChange={e => setNuevaMascota({ ...nuevaMascota, photo: e.target.files[0] })}
                            />
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowAddForm(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">Cancelar</button>
                                <button onClick={handleSavePet} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100">Guardar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: Editar Cliente */}
            {showEditOwnerForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Editar Cliente</h3>
                        <div className="space-y-4">
                            <input
                                type="text" placeholder="Nombre" className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                value={ownerEdicion.name}
                                onChange={e => setOwnerEdicion({ ...ownerEdicion, name: e.target.value })}
                            />
                            <input
                                type="email" placeholder="Email" className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                value={ownerEdicion.email}
                                onChange={e => setOwnerEdicion({ ...ownerEdicion, email: e.target.value })}
                            />
                            <input
                                type="text" placeholder="Teléfono" className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                value={ownerEdicion.telefono}
                                onChange={e => setOwnerEdicion({ ...ownerEdicion, telefono: e.target.value })}
                            />
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowEditOwnerForm(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">Cancelar</button>
                                <button onClick={handleSaveOwner} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">Actualizar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: Zoom Foto */}
            {zoomImage && (
                <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4" onClick={() => setZoomImage(null)}>
                    <button className="absolute top-6 right-6 text-white text-3xl hover:text-indigo-400 transition">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                    <img 
                        src={`https://veterinaria.martinezyelamosabogados.es/storage/${zoomImage}`} 
                        alt="Zoom" 
                        className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl border-4 border-white/10 animate-in zoom-in duration-300"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Historial Clínico */}
            <HistorialMascota isOpen={!!historyPet} pet={historyPet} onClose={() => setHistoryPet(null)} />
        </div>
    );
};

export default OwnerCard;
