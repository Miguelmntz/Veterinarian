import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDog } from '@fortawesome/free-solid-svg-icons';
import FormularioOwner from './FormularioOwner';
import OwnerCard from './OwnerCard';

const DashboardOwners = () => {
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // useEffect se ejecuta solo una vez al cargar el componente (por el array vacío [])
    // Aquí hago la petición a la API de Laravel para traer los dueños y sus mascotas.
    useEffect(() => {
        axios.get('http://localhost:8000/api/owners')
            .then(res => {
                setOwners(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleOwnerAdded = (newOwner) => {
        setOwners([newOwner, ...owners]);
        setShowForm(false);
    };

    const handleUpdateOwner = (updatedOwner, updatedIndex) => {
        setOwners(owners.map((o, i) => i === updatedIndex ? updatedOwner : o));
    };

    if (loading) return <div className="p-20 text-center font-bold">Cargando...</div>;

    return (
        <div className="min-h-screen w-full bg-gray-50 p-8 text-gray-800">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold text-indigo-700 flex items-center gap-2">
                        <FontAwesomeIcon icon={faDog} /> Clinica Veterinaria
                    </h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`px-6 py-2 rounded-lg text-white font-bold transition ${showForm ? 'bg-red-500' : 'bg-indigo-600'}`}
                    >
                        {showForm ? 'Cancelar' : '+ Nuevo Cliente'}
                    </button>
                </header>

                {showForm && <FormularioOwner onOwnerAdded={handleOwnerAdded} />}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {owners.map((owner, index) => {
                        // Utilizo una key única basada en el ID. Fue un problema al principio porque si no, React se liaba
                        // al actualizar el estado de una tarjeta en concreto (por ejemplo al añadir una mascota a un dueño).
                        const uniqueKey = owner.id ? `id-${owner.id}` : owner._id ? `_id-${owner._id}` : `idx-${index}-${owner.name}`;
                        return (
                            <OwnerCard
                                key={uniqueKey}
                                owner={owner}
                                onUpdateOwner={(updatedOwner) => handleUpdateOwner(updatedOwner, index)}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DashboardOwners;