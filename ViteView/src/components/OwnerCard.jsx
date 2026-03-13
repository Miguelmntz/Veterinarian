import React, { useState } from 'react';
import axios from 'axios';
import { User, Phone, MapPin, Pencil, Trash2 } from 'lucide-react';

const OwnerCard = ({ owner, onUpdateOwner }) => {
    // Uso estados locales aquí para aislar el formulario. Antes, al intentar añadir una mascota,
    // se me abrían los formularios en todas las tarjetas de clientes a la vez. Al meter esto en un state
    // propio y aislarlo visualmente con un modal (showAddForm), solucioné el problema.
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingPetId, setEditingPetId] = useState(null);
    const [nuevaMascota, setNuevaMascota] = useState({
        name: '', species: 'Perro', raza: '', peso: '', fech_nac: ''
    });

    const handleSavePet = async () => {
        try {
            const ownerId = owner.id || owner._id;

            if (editingPetId) {
                // Modo Edición
                const res = await axios.put(`http://localhost:8000/api/pets/${editingPetId}`, {
                    ...nuevaMascota,
                    owner_id: ownerId
                });

                onUpdateOwner({
                    ...owner,
                    pets: owner.pets.map(p => (p.id || p._id) === editingPetId ? res.data : p)
                });
            } else {
                // Modo Creación
                const res = await axios.post('http://localhost:8000/api/pets', {
                    ...nuevaMascota,
                    owner_id: ownerId
                });

                onUpdateOwner({
                    ...owner,
                    pets: [...(owner.pets || []), res.data]
                });
            }

            setShowAddForm(false);
            setEditingPetId(null);
            setNuevaMascota({ name: '', species: 'Perro', raza: '', peso: '', fech_nac: '' });
        } catch (error) {
            alert("Error al guardar la mascota");
        }
    };

    const handleDeletePet = async (petId) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta mascota?")) return;

        try {
            await axios.delete(`http://localhost:8000/api/pets/${petId}`);
            onUpdateOwner({
                ...owner,
                pets: owner.pets.filter(p => (p.id || p._id) !== petId)
            });
        } catch (error) {
            alert("Error al eliminar la mascota");
        }
    };

    const openEditForm = (pet) => {
        setNuevaMascota({
            name: pet.name || '',
            species: pet.species || 'Perro',
            raza: pet.raza || '',
            peso: pet.peso || '',
            fech_nac: pet.fech_nac || ''
        });
        setEditingPetId(pet.id || pet._id);
        setShowAddForm(true);
    };

    const openAddForm = () => {
        setNuevaMascota({ name: '', species: 'Perro', raza: '', peso: '', fech_nac: '' });
        setEditingPetId(null);
        setShowAddForm(true);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col h-full">
            {/* Info Propietario */}
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                    <User size={20} />
                </div>
                <h2 className="text-xl font-bold">{owner.name}</h2>
            </div>

            <div className="text-sm text-gray-500 mb-6 space-y-1">
                <p className="flex items-center gap-2"><Phone size={14} /> {owner.telefono}</p>
                <p className="flex items-center gap-2"><MapPin size={14} /> {owner.direccion}</p>
            </div>

            {/* Lista de Mascotas */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 flex-grow">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mascotas</span>
                <div className="mt-3 space-y-2">
                    {owner.pets && owner.pets.length > 0 ? (
                        owner.pets.map((pet, petIdx) => (
                            <div key={pet.id || pet._id || petIdx} className="group flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100 text-sm shadow-sm hover:border-indigo-100 transition">
                                <span className="font-medium">{pet.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-indigo-500 font-bold mr-2 text-xs">{pet.species}</span>
                                    {/* Botones de acción (ocultos por defecto, visibles al hacer hover) */}
                                    <button
                                        onClick={() => openEditForm(pet)}
                                        className="text-gray-300 hover:text-indigo-500 transition opacity-0 group-hover:opacity-100"
                                        title="Editar mascota"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDeletePet(pet.id || pet._id)}
                                        className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                                        title="Eliminar mascota"
                                    >
                                        <Trash2 size={14} />
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
        </div>
    );
};

export default OwnerCard;
