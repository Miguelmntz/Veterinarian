import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen, faPlus, faPills, faExclamationTriangle, faPencilAlt, faTrashAlt, faMinus, faEuroSign } from '@fortawesome/free-solid-svg-icons';
import FormularioProducto from './FormularioProducto';

const DashboardInventory = () => {
    // Array tocho que contendrá todas mis cajas de material de almacén
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados para controlar la ventana modal emergente de edición/creación
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [search, setSearch] = useState('');

    // Nada más se monte mi componente Inventory, pido al Backend que me dé el catálogo actual en crudo
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/products');
            setProducts(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Fallo central', text: 'No pudimos descargar el inventario desde el backend.' });
            setLoading(false);
        }
    };

    // Mi endpoint estrella 'consume' en acción. Cuando alguien gaste 1 unidad, se descuenta haciendo un solo click sin abrir modales enteras.
    const handleConsumeOne = async (product) => {
        if (product.stock_quantity <= 0) {
            Swal.fire({ icon: 'warning', title: 'Vacío', text: 'Imposible restar. Ya te has quedado sin stock físico de este material.' });
            return;
        }

        try {
            const res = await axios.post(`http://localhost:8000/api/products/${product.id}/consume`, { quantity: 1 });
            // Re-mapeo el array para buscar la ficha de producto que he alterado e inyectarle la nueva bajada de stock instantáneamente en la web.
            setProducts(products.map(p => p.id === product.id ? res.data.product : p));
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Error de base de datos al descontar el producto' });
        }
    };

    // Esto elimina sin compasión una ficha de la vitrina (ej: Aspirina genérica que ya no fabrica el proveedor)
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Seguro que quieres descatalogarlo?',
            text: "Quitarás este producto totalmente de la vitrina y no saldrá nunca más en las listas.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, borrar del mapa',
            cancelButtonText: 'No, perdona'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:8000/api/products/${id}`);
                setProducts(products.filter(p => p.id !== id));
                Swal.fire({ icon: 'success', title: '¡Fulminado!', text: 'Producto descatalogado y pulverizado permanentemente.' });
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar de la base de datos MySQL por algún motivo raro.' });
            }
        }
    };

    // Funciones esclavas para abrir la modal de formularios según el modo
    const openNewForm = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const openEditForm = (producto) => {
        setEditingProduct(producto);
        setIsFormOpen(true);
    };

    // Un Hook inverso. Este evento lo escupe la modal FormularioProducto.jsx por props para avisarme que ha acabado su parte exitosamente.
    const handleFormSave = (savedProduct, isUpdate) => {
        if (isUpdate) {
            // Cambio mi array interno machacando el elemento antiguo con el actualizado al vuelo sin recargar
            setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
        } else {
            // Añado el recién parido producto a la familia al final de la lista reactiva
            setProducts([...products, savedProduct]);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[70vh]">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <FontAwesomeIcon icon={faBoxOpen} className="text-indigo-600" /> Inventario de Clínica
                </h2>
                <div className="flex items-center gap-4">
                    <input 
                        type="text" 
                        placeholder="Buscar material o desc..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition shadow-sm"
                    />
                    <button 
                        onClick={openNewForm}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl transition shadow-md flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faPlus} /> Añadir Artículo
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="p-8 text-center text-gray-500 font-bold">Rescatando estanterías del almacén central en Laravel...</div>
            ) : products.length === 0 ? (
                <div className="text-center p-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 mt-4">
                    <FontAwesomeIcon icon={faBoxOpen} size="3x" className="mb-4 text-gray-300" />
                    <p className="text-lg">Tu almacén virtual está diáfano por ahora. Empieza a crear fichas.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm relative mt-4">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-indigo-50 text-indigo-900 text-sm">
                            <tr>
                                <th className="p-4 font-extrabold uppercase tracking-wider border-b border-indigo-100"><FontAwesomeIcon icon={faPills} className="text-indigo-400 mr-2" /> Artículo</th>
                                <th className="p-4 font-extrabold uppercase tracking-wider border-b border-indigo-100">Stock Base</th>
                                <th className="p-4 font-extrabold uppercase tracking-wider border-b border-indigo-100"><FontAwesomeIcon icon={faEuroSign} className="text-indigo-400 mr-2" /> P.V.P</th>
                                <th className="p-4 font-extrabold uppercase tracking-wider border-b border-indigo-100">Consumo Rápido</th>
                                <th className="p-4 font-extrabold uppercase tracking-wider border-b border-indigo-100 text-right">Mantenimiento</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {products
                                .filter(p => 
                                    p.name.toLowerCase().includes(search.toLowerCase()) || 
                                    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
                                )
                                .map(p => {
                                // Variable super útil que avisa si se pasa de límite: pita rojo
                                const isLowStock = p.stock_quantity <= p.min_stock_alert;

                                return (
                                    <tr key={p.id} className="hover:bg-indigo-50/20 transition group">
                                        <td className="p-4">
                                            <p className="font-bold text-gray-800 text-lg">{p.name}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-sm mt-1">{p.description || 'Sin descripción detallada'}</p>
                                        </td>
                                        <td className="p-4 content-center">
                                            {/* Renderizado condicional para llamar bien la atención al jefe de que hay que hacer pedido */}
                                            {isLowStock ? (
                                                <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-sm font-black border border-red-200 animate-pulse-slow">
                                                    <FontAwesomeIcon icon={faExclamationTriangle} /> {p.stock_quantity} ud. (Bajo)
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-green-200">
                                                    {p.stock_quantity} ud. (Ok)
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 font-black text-gray-700 content-center text-lg">
                                            {/* Truco: Parseo el precio numérico puro con .toFixed(2) para que nunca falte el céntimo, a lo cajera guay */}
                                            {parseFloat(p.price).toFixed(2)} €
                                        </td>
                                        <td className="p-4 content-center">
                                            <button 
                                                onClick={() => handleConsumeOne(p)}
                                                className="text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 hover:text-orange-800 border border-orange-200 px-4 py-2 rounded-lg transition flex items-center gap-1 shadow-sm active:scale-95 disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:border-1"
                                                title="Le resto 1 frasco a la base de datos sin preguntar mil cosas"
                                                disabled={p.stock_quantity <= 0}
                                            >
                                                <FontAwesomeIcon icon={faMinus} /> 1 unidad
                                            </button>
                                        </td>
                                        <td className="p-4 content-center">
                                            <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition duration-300">
                                                <button 
                                                    onClick={() => openEditForm(p)}
                                                    className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white h-10 w-10 rounded-xl flex items-center justify-center transition border border-indigo-100 shadow-sm"
                                                    title="Modificar valores de la ficha"
                                                >
                                                    <FontAwesomeIcon icon={faPencilAlt} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(p.id)}
                                                    className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white h-10 w-10 rounded-xl flex items-center justify-center transition border border-red-100 shadow-sm"
                                                    title="Descatalogar producto perennemente"
                                                >
                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <FormularioProducto 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                initialData={editingProduct}
                onSave={handleFormSave}
            />
        </div>
    );
};

export default DashboardInventory;
