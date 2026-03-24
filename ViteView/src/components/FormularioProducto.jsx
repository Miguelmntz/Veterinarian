import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faBox } from '@fortawesome/free-solid-svg-icons';

const FormularioProducto = ({ isOpen, onClose, initialData, onSave }) => {
    // Guardo mis datos del formulario aquí
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [minStock, setMinStock] = useState('5'); // Por defecto pido 5 unidades de alerta mínima al cajero

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // MODO EDICIÓN: Me paso el objeto entero padre y autorrelleno el formulario para modificar cómodo
                setName(initialData.name);
                setDescription(initialData.description || '');
                setPrice(initialData.price);
                setStock(initialData.stock_quantity);
                setMinStock(initialData.min_stock_alert);
            } else {
                // MODO CREAR: Limpio todo el formulario en blanco para una ficha de inventario nueva
                setName('');
                setDescription('');
                setPrice('');
                setStock('');
                setMinStock('5');
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Empaqueto los datos según me los exige el validate del Backend en ProductController
        const payload = {
            name,
            description,
            price: parseFloat(price),
            stock_quantity: parseInt(stock, 10),
            min_stock_alert: parseInt(minStock, 10)
        };

        try {
            if (initialData) {
                // Actualizo el producto metiendo sus variables en el id corrrespondiente por PUT
                const res = await axios.put(`http://localhost:8000/api/products/${initialData.id}`, payload);
                onSave(res.data, true); 
                Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Datos del artículo actualizados en el inventario.' });
            } else {
                // Creo el producto gordo nuevo desde cero mediante el verbo POST 
                const res = await axios.post('http://localhost:8000/api/products', payload);
                onSave(res.data, false);
                Swal.fire({ icon: 'success', title: 'Añadido', text: 'Nuevo material insertado en Vitrina/Almacén.' });
            }
            onClose();
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'No se pudo guardar la ficha técnica del inventario.' });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 h-full">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden shrink-0 animate-in fade-in zoom-in duration-200">
                <div className="bg-indigo-700 text-white p-5 flex justify-between items-center shadow-sm">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <FontAwesomeIcon icon={faBox} /> {initialData ? 'Editar Artículo' : 'Nuevo Artículo en Stock'}
                    </h2>
                    <button onClick={onClose} className="text-indigo-200 hover:text-white transition cursor-pointer p-1">
                        <FontAwesomeIcon icon={faTimes} size="lg" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold text-gray-700">Nombre del Medicamento / Material</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="Ej: Antibiótico Clavamox 500mg" 
                            className="p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold text-gray-700">Descripción (Opcional)</label>
                        <textarea 
                            placeholder="Formato de la caja, nombre del proveedor oficial..." 
                            className="p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 min-h-[80px]"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col gap-1 flex-1">
                            <label className="text-sm font-bold text-gray-700">Precio Venta (EUR)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                min="0"
                                required 
                                className="p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                            <label className="text-sm font-bold text-gray-700">Stock Actual Físico</label>
                            <input 
                                type="number" 
                                min="0"
                                required 
                                className="p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 w-2/3">
                        <label className="text-sm font-bold text-red-700">Aviso Stock Mínimo</label>
                        <input 
                            type="number" 
                            min="0"
                            required 
                            className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 outline-none focus:border-red-500 font-bold"
                            value={minStock}
                            onChange={(e) => setMinStock(e.target.value)}
                        />
                        <span className="text-xs text-red-400">Te avisaré cuando tengas {minStock || 0} o menos unidades.</span>
                    </div>

                    <div className="flex justify-end mt-4 pt-4 border-t border-gray-100 gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition">Cancelar</button>
                        <button type="submit" className="px-5 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-md transition">
                            <FontAwesomeIcon icon={faSave} /> {initialData ? 'Actualizar Ficha' : 'Dar de Alta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormularioProducto;
