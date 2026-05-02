import React, { useEffect, useState } from 'react';
import api from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDog, faUser } from '@fortawesome/free-solid-svg-icons';
import FormularioOwner from './FormularioOwner';
import OwnerCard from './OwnerCard';

const DashboardOwners = () => {
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');

    // Inicialización del componente: Carga inicial de datos
    // Petición a la API para obtener el listado completo de clientes y mascotas asociadas
    useEffect(() => {
        api.get('/owners')
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
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-indigo-700 flex items-center gap-2">
                        <FontAwesomeIcon icon={faUser} /> Clientes
                    </h1>
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full md:w-auto">
                        <input 
                            type="text" 
                            placeholder="Buscar cliente, teléfono o email..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition shadow-sm"
                        />
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className={`px-6 py-2 rounded-lg w-full sm:w-auto text-white font-bold transition ${showForm ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'} shadow-sm`}
                        >
                            {showForm ? 'Cancelar' : '+ Nuevo Cliente'}
                        </button>
                    </div>
                </header>

                {showForm && <FormularioOwner onOwnerAdded={handleOwnerAdded} />}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {owners
                        .filter(o => 
                            o.name.toLowerCase().includes(search.toLowerCase()) || 
                            (o.telefono && o.telefono.includes(search)) || 
                            (o.email && o.email.toLowerCase().includes(search.toLowerCase()))
                        )
                        .map((owner, index) => {
                            const uniqueKey = owner.id ? `id-${owner.id}` : owner._id ? `_id-${owner._id}` : `idx-${index}-${owner.name}`;
                            return (
                                <OwnerCard
                                    key={uniqueKey}
                                    owner={owner}
                                    onUpdateOwner={(updatedOwner) => handleUpdateOwner(updatedOwner, index)}
                                />
                            );
                        })
                    }
                </div>
            </div>
        </div>
    );
};

export default DashboardOwners;