import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPhone, faMapMarkerAlt, faPencilAlt, faTrashAlt, faStethoscope } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import HistorialMascota from './HistorialMascota';

const OwnerCard = ({ owner, onUpdateOwner }) => {
    // Uso estados locales aquí para aislar el formulario. Antes, al intentar añadir una mascota,
    // se me abrían los formularios en todas las tarjetas de clientes a la vez. Al meter esto en un state
    // propio y aislarlo visualmente con un modal (showAddForm), solucioné el problema.
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingPetId, setEditingPetId] = useState(null);
    const [nuevaMascota, setNuevaMascota] = useState({
        name: '', species: 'Perro', raza: '', peso: '', fech_nac: '', photo: null
    });

    // Nuevos estados para editar dueño
    const [showEditOwnerForm, setShowEditOwnerForm] = useState(false);
    const [ownerEdicion, setOwnerEdicion] = useState({ name: '', email: '', telefono: '', direccion: '' });

    // Controlar cuándo se abre el Historial a toda pantalla y qué paciente mirar
    const [historyPet, setHistoryPet] = useState(null);

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
                // Modo Edición: spoof del method PUT de Laravel
                formData.append('_method', 'PUT');
                const res = await axios.post(`http://localhost:8000/api/pets/${editingPetId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                onUpdateOwner({
                    ...owner,
                    pets: owner.pets.map(p => (p.id || p._id) === editingPetId ? res.data : p)
                });
            } else {
                // Modo Creación
                const res = await axios.post('http://localhost:8000/api/pets', formData, {
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
            if (document.getElementById('pet-photo')) document.getElementById('pet-photo').value = "";
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al guardar la mascota' });
        }
    };

    const handleDeletePet = async (petId) => {
        const result = await Swal.fire({
            title: '¿Eliminar mascota?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
        if (!result.isConfirmed) return;

        try {
            await axios.delete(`http://localhost:8000/api/pets/${petId}`);
            onUpdateOwner({
                ...owner,
                pets: owner.pets.filter(p => (p.id || p._id) !== petId)
            });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al eliminar la mascota' });
        }
    };

    const openEditForm = (pet) => {
        setNuevaMascota({
            name: pet.name || '',
            species: pet.species || 'Perro',
            raza: pet.raza || '',
            peso: pet.peso || '',
            fech_nac: pet.fech_nac || '',
            photo: null
        });
        setEditingPetId(pet.id || pet._id);
        setShowAddForm(true);
    };

    const openAddForm = () => {
        setNuevaMascota({ name: '', species: 'Perro', raza: '', peso: '', fech_nac: '', photo: null });
        setEditingPetId(null);
        setShowAddForm(true);
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

    const handleSaveOwner = async () => {
        try {
            const ownerId = owner.id || owner._id;
            const res = await axios.put(`http://localhost:8000/api/owners/${ownerId}`, ownerEdicion);
            onUpdateOwner(res.data);
            setShowEditOwnerForm(false);
            Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Datos del cliente actualizados', timer: 1500, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'El correo debe ser único o hay campos inválidos' });
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col h-full">
            {/* Info Propietario */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                        <FontAwesomeIcon icon={faUser} />
                    </div>
                    <h2 className="text-xl font-bold">{owner.name}</h2>
                </div>
                <button 
                    onClick={openEditOwner}
                    className="text-gray-300 hover:text-indigo-600 transition"
                    title="Editar Cliente"
                >
                    <FontAwesomeIcon icon={faPencilAlt} />
                </button>
            </div>

            <div className="text-sm text-gray-500 mb-6 space-y-1">
                <p className="flex items-center gap-2"><FontAwesomeIcon icon={faPhone} /> {owner.telefono}</p>
                <p className="flex items-center gap-2"><FontAwesomeIcon icon={faMapMarkerAlt} /> {owner.direccion}</p>
            </div>

            {/* Lista de Mascotas */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 flex-grow">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mascotas</span>
                <div className="mt-3 space-y-2">
                    {owner.pets && owner.pets.length > 0 ? (
                        owner.pets.map((pet, petIdx) => (
                            <div key={pet.id || pet._id || petIdx} className="group flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100 text-sm shadow-sm hover:border-indigo-100 transition">
                                <div className="flex items-center gap-2">
                                    {pet.photo_path ? (
                                        <img src={`http://localhost:8000/storage/${pet.photo_path}`} alt={pet.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-500 font-bold flex items-center justify-center text-xs">
                                            {pet.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="font-medium align-middle">{pet.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-indigo-500 font-bold mr-2 text-xs">{pet.species}</span>
                                    {/* Botones de acción (ocultos por defecto, visibles al hacer hover) */}
                                    <button
                                        onClick={() => setHistoryPet(pet)}
                                        className="text-gray-300 hover:text-indigo-600 transition opacity-0 group-hover:opacity-100"
                                        title="Ver Historial Médico"
                                    >
                                        <FontAwesomeIcon icon={faStethoscope} />
                                    </button>
                                    <button
                                        onClick={() => openEditForm(pet)}
                                        className="text-gray-300 hover:text-indigo-500 transition opacity-0 group-hover:opacity-100"
                                        title="Editar mascota"
                                    >
                                        <FontAwesomeIcon icon={faPencilAlt} />
                                    </button>
                                    <button
                                        onClick={() => handleDeletePet(pet.id || pet._id)}
                                        className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                                        title="Eliminar mascota"
                                    >
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-gray-400 italic">Sin mascotas</p>
                    )}
                </div>
            </div>

            {/* Botón para abrir modal de crear */}
            <div className="mt-auto">
                <button
                    onClick={openAddForm}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-[10px] font-bold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all"
                >
                    + Registrar nueva mascota
                </button>
            </div>

            {/* Modal condicional (Crear / Editar) */}
            {/* Decidí usar pantalla completa con un fondo oscurecido para centrar la atención en añadir/editar la mascota,
                aislándolo del resto de las tarjetas. */}
            {showAddForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 animate-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-indigo-700 mb-4 flex items-center gap-2">
                            {editingPetId ? `Editar mascota de ${owner.name}` : `Añadir mascota a ${owner.name}`}
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text" placeholder="Nombre" className="p-3 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
                                    value={nuevaMascota.name}
                                    onChange={e => setNuevaMascota({ ...nuevaMascota, name: e.target.value })}
                                />
                                <div className="flex gap-2 relative">
                                    <select
                                        className={`p-3 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 ${['Perro', 'Gato', 'Ave'].includes(nuevaMascota.species) ? 'w-full' : 'w-1/2'}`}
                                        value={['Perro', 'Gato', 'Ave'].includes(nuevaMascota.species) ? nuevaMascota.species : 'Otro'}
                                        onChange={e => {
                                            if (e.target.value === 'Otro') {
                                                setNuevaMascota({ ...nuevaMascota, species: '' });
                                            } else {
                                                setNuevaMascota({ ...nuevaMascota, species: e.target.value });
                                            }
                                        }}
                                    >
                                        <option value="Perro">Perro</option>
                                        <option value="Gato">Gato</option>
                                        <option value="Ave">Ave</option>
                                        <option value="Otro">Otro...</option>
                                    </select>

                                    {!['Perro', 'Gato', 'Ave'].includes(nuevaMascota.species) && (
                                        <input
                                            type="text"
                                            placeholder="¿Cuál?"
                                            className="w-1/2 p-3 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 bg-white animate-in slide-in-from-right-4 duration-200"
                                            value={nuevaMascota.species}
                                            onChange={e => setNuevaMascota({ ...nuevaMascota, species: e.target.value })}
                                            autoFocus
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text" placeholder="Raza" className="p-3 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
                                    value={nuevaMascota.raza}
                                    onChange={e => setNuevaMascota({ ...nuevaMascota, raza: e.target.value })}
                                />
                                <input
                                    type="number" placeholder="Peso (Kg)" className="p-3 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
                                    value={nuevaMascota.peso}
                                    onChange={e => setNuevaMascota({ ...nuevaMascota, peso: e.target.value })}
                                />
                            </div>

                            <input
                                type="date" className="w-full p-3 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 text-gray-500"
                                value={nuevaMascota.fech_nac}
                                onChange={e => setNuevaMascota({ ...nuevaMascota, fech_nac: e.target.value })}
                            />

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 ml-1">Fotografía de la Mascota</label>
                                <input
                                    id="pet-photo"
                                    type="file" 
                                    accept="image/*"
                                    onChange={e => setNuevaMascota({ ...nuevaMascota, photo: e.target.files[0] })}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-indigo-200 file:text-xs file:font-extrabold file:bg-white file:text-indigo-600 hover:file:bg-indigo-600 hover:file:text-white transition-all bg-gray-50 p-1 border rounded-xl"
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button onClick={() => setShowAddForm(false)} className="flex-1 bg-white text-gray-500 text-sm font-medium py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
                                    Cancelar
                                </button>
                                <button onClick={handleSavePet} className="flex-1 bg-indigo-600 text-white text-sm font-bold py-3 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200">
                                    {editingPetId ? 'Guardar Cambios' : 'Guardar Mascota'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para Editar Dueño */}
            {showEditOwnerForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 animate-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-indigo-700 mb-4">Editar Cliente</h3>
                        <div className="space-y-4">
                            <input
                                type="text" placeholder="Nombre completo" className="w-full p-3 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
                                value={ownerEdicion.name}
                                onChange={e => setOwnerEdicion({ ...ownerEdicion, name: e.target.value })}
                            />
                            <input
                                type="email" placeholder="Correo Electrónico" className="w-full p-3 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
                                value={ownerEdicion.email}
                                onChange={e => setOwnerEdicion({ ...ownerEdicion, email: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text" placeholder="Teléfono" className="w-full p-3 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
                                    value={ownerEdicion.telefono}
                                    onChange={e => setOwnerEdicion({ ...ownerEdicion, telefono: e.target.value })}
                                />
                                <input
                                    type="text" placeholder="Dirección" className="w-full p-3 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
                                    value={ownerEdicion.direccion}
                                    onChange={e => setOwnerEdicion({ ...ownerEdicion, direccion: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button onClick={() => setShowEditOwnerForm(false)} className="flex-1 bg-white text-gray-500 text-sm font-medium py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
                                    Cancelar
                                </button>
                                <button onClick={handleSaveOwner} className="flex-1 bg-indigo-600 text-white text-sm font-bold py-3 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200">
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Historial Clínico Invocada aquí */}
            <HistorialMascota 
                isOpen={!!historyPet} 
                pet={historyPet} 
                onClose={() => setHistoryPet(null)} 
            />
        </div>
    );
};

export default OwnerCard;
