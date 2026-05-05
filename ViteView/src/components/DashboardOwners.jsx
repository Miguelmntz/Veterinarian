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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Inicialización del componente: Carga inicial de datos
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
        if (updatedOwner === null) {
            setOwners(owners.filter((_, i) => i !== updatedIndex));
        } else {
            setOwners(owners.map((o, i) => i === updatedIndex ? updatedOwner : o));
        }
    };

    if (loading) return <div className="p-20 text-center font-bold">Cargando...</div>;

    // Filtrado y Paginación
    const filteredOwners = owners.filter(o => 
        o.name.toLowerCase().includes(search.toLowerCase()) || 
        (o.telefono && o.telefono.includes(search)) || 
        (o.email && o.email.toLowerCase().includes(search.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredOwners.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredOwners.slice(indexOfFirstItem, indexOfLastItem);

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
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1); // Volver a la página 1 al buscar
                            }}
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {currentItems.map((owner, index) => {
                        // El índice real en el array original para el handleUpdateOwner
                        const realIndex = indexOfFirstItem + index;
                        const uniqueKey = owner.id ? `id-${owner.id}` : owner._id ? `_id-${owner._id}` : `idx-${realIndex}`;
                        return (
                            <OwnerCard
                                key={uniqueKey}
                                owner={owner}
                                onUpdateOwner={(updatedOwner) => handleUpdateOwner(updatedOwner, realIndex)}
                            />
                        );
                    })}
                </div>

                {/* Controles de Paginación */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-100 transition"
                        >
                            Anterior
                        </button>
                        <span className="text-sm font-bold text-gray-500">
                            Página <span className="text-indigo-600">{currentPage}</span> de {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-100 transition"
                        >
                            Siguiente
                        </button>
                    </div>
                )}

                {filteredOwners.length === 0 && !loading && (
                    <div className="text-center py-20 text-gray-400 italic bg-white rounded-3xl border-2 border-dashed border-gray-100">
                        No se han encontrado clientes con esos criterios.
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardOwners;