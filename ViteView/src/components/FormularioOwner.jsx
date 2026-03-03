import React, { useState } from 'react';
import axios from 'axios';
import { Save, Plus, Trash2 } from 'lucide-react';

const FormularioOwner = ({ onOwnerAdded }) => {
    const [nuevoOwner, setNuevoOwner] = useState({
        name: '',
        email: '',
        telefono: '',
        direccion: '',
        pets: []
    });

    // Inicializamos la mascota con todos los campos requeridos para tu examen [cite: 2026-02-11]
    const agregarMascotaForm = () => {
        setNuevoOwner({
            ...nuevoOwner,
            pets: [...nuevoOwner.pets, {
                name: '',
                species: 'Perro',
                raza: '',
                peso: '',
                fech_nac: ''
            }]
        });
    };

    // Función para eliminar una mascota del formulario antes de enviar
    const eliminarMascotaForm = (index) => {
        const nuevasPets = nuevoOwner.pets.filter((_, i) => i !== index);
        setNuevoOwner({ ...nuevoOwner, pets: nuevasPets });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8000/api/owners', nuevoOwner);
            onOwnerAdded(res.data);
            setNuevoOwner({ name: '', email: '', telefono: '', direccion: '', pets: [] });
            alert("Cliente y mascotas registrados correctamente");
        } catch (error) {
            alert("Error: " + (error.response?.data?.message || "Error al guardar"));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border mb-8 animate-in fade-in duration-500">
            <h2 className="text-xl font-bold mb-4 text-indigo-700">Datos del Propietario</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input type="text" placeholder="Nombre" className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={nuevoOwner.name} onChange={e => setNuevoOwner({ ...nuevoOwner, name: e.target.value })} required />
                <input type="email" placeholder="Email" className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={nuevoOwner.email} onChange={e => setNuevoOwner({ ...nuevoOwner, email: e.target.value })} required />
                <input type="text" placeholder="Telefono" className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={nuevoOwner.telefono} onChange={e => setNuevoOwner({ ...nuevoOwner, telefono: e.target.value })} required />
                <input type="text" placeholder="Direccion" className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={nuevoOwner.direccion} onChange={e => setNuevoOwner({ ...nuevoOwner, direccion: e.target.value })} required />
            </div>

            <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-700">Mascotas a registrar</h3>
                    <button type="button" onClick={agregarMascotaForm} className="flex items-center gap-1 text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full hover:bg-indigo-100 transition">
                        <Plus size={16} /> Añadir Mascota
                    </button>
                </div>

                {nuevoOwner.pets.map((pet, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-200 relative">
                        <button type="button" onClick={() => eliminarMascotaForm(index)} className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                            <Trash2 size={18} />
                        </button>

                        {/* Fila 1: Nombre y Especie */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <input type="text" placeholder="Nombre Mascota" className="p-2 border rounded-lg bg-white" value={pet.name} onChange={e => {
                                const nuevasPets = [...nuevoOwner.pets];
                                nuevasPets[index].name = e.target.value;
                                setNuevoOwner({ ...nuevoOwner, pets: nuevasPets });
                            }} required />

                            <select className="p-2 border rounded-lg bg-white" value={pet.species} onChange={e => {
                                const nuevasPets = [...nuevoOwner.pets];
                                nuevasPets[index].species = e.target.value;
                                setNuevoOwner({ ...nuevoOwner, pets: nuevasPets });
                            }}>
                                <option value="Perro">Perro</option>
                                <option value="Gato">Gato</option>
                                <option value="Ave">Ave</option>
                                <option value="Exótico">Exótico</option>
                            </select>
                        </div>

                        {/* Fila 2: Raza, Peso y Fecha Nacimiento */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input type="text" placeholder="Raza" className="p-2 border rounded-lg bg-white" value={pet.raza} onChange={e => {
                                const nuevasPets = [...nuevoOwner.pets];
                                nuevasPets[index].raza = e.target.value;
                                setNuevoOwner({ ...nuevoOwner, pets: nuevasPets });
                            }} />

                            <input type="number" step="0.1" placeholder="Peso (kg)" className="p-2 border rounded-lg bg-white" value={pet.peso} onChange={e => {
                                const nuevasPets = [...nuevoOwner.pets];
                                nuevasPets[index].peso = e.target.value;
                                setNuevoOwner({ ...nuevoOwner, pets: nuevasPets });
                            }} />

                            <input type="date" className="p-2 border rounded-lg bg-white text-gray-600" value={pet.fech_nac} onChange={e => {
                                const nuevasPets = [...nuevoOwner.pets];
                                nuevasPets[index].fech_nac = e.target.value;
                                setNuevoOwner({ ...nuevoOwner, pets: nuevasPets });
                            }} />
                        </div>
                    </div>
                ))}

                {nuevoOwner.pets.length === 0 && (
                    <p className="text-sm text-gray-400 italic text-center py-4">No has añadido ninguna mascota todavía.</p>
                )}
            </div>

            <button type="submit" className="mt-6 bg-green-600 text-white px-4 py-3 rounded-xl w-full font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-md">
                <Save size={20} /> Guardar Cliente y Mascotas
            </button>
        </form>
    );
};

export default FormularioOwner;