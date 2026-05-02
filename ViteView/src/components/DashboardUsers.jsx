import React, { useState, useEffect } from 'react';
import api from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserShield, faUserPlus, faTrash, faSpinner, faUserNurse, faUserMd } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const DashboardUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'recepcionista'
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar la lista de personal.' });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/users', formData);
            Swal.fire({
                icon: 'success',
                title: 'Personal Añadido',
                text: 'Se ha creado el acceso al sistema correctamente.',
                confirmButtonColor: '#4f46e5'
            });
            setShowForm(false);
            setFormData({ name: '', email: '', password: '', role: 'recepcionista' });
            fetchUsers();
        } catch (error) {
            let msg = 'Error creando usuario.';
            if (error.response?.data?.errors?.email) {
                msg = 'Este email ya está en uso.';
            }
            Swal.fire({ icon: 'error', title: 'Error', text: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id, name) => {
        const confirm = await Swal.fire({
            title: `¿Revocar acceso a ${name}?`,
            text: "Esta persona ya no podrá iniciar sesión en la clínica.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar acceso'
        });

        if (confirm.isConfirmed) {
            try {
                await api.delete(`/users/${id}`);
                Swal.fire('Revocado', 'El acceso ha sido eliminado.', 'success');
                setUsers(users.filter(u => u.id !== id));
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Tú mismo o un conflicto impide este borrado.' });
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[75vh]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <FontAwesomeIcon icon={faUserShield} className="text-indigo-500" />
                    Gestión de Personal
                </h2>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 shadow-sm"
                >
                    <FontAwesomeIcon icon={faUserPlus} />
                    Alta Empleado
                </button>
            </div>

            {showForm && (
                <div className="mb-8 bg-indigo-50/50 border border-indigo-100 p-6 rounded-xl animate-in slide-in-from-top-4">
                    <h3 className="font-bold text-indigo-800 mb-4 text-lg">Nuevo Acceso al Sistema</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nombre Completo</label>
                            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email Profesional</label>
                            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Contraseña</label>
                            <input required type="password" name="password" minLength={6} value={formData.password} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nivel de Permiso</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200 bg-white">
                                <option value="recepcionista">Recepcionista (Gestión y Citas)</option>
                                <option value="veterinario">Veterinario (Control Total)</option>
                                <option value="asistente">Asistente (Apoyo Clínico)</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancelar</button>
                            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                {isSubmitting && <FontAwesomeIcon icon={faSpinner} spin />} Guardar Empleado
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-10"><FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-indigo-200" /></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-200">
                                <th className="p-4">Staff</th>
                                <th className="p-4">Email de Acceso</th>
                                <th className="p-4">Rol</th>
                                <th className="p-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                                    <td className="p-4 font-bold text-gray-800">{user.name}</td>
                                    <td className="p-4 text-gray-600">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center w-max gap-2 ${
                                            user.role === 'veterinario' ? 'bg-indigo-100 text-indigo-700' : 
                                            user.role === 'asistente' ? 'bg-emerald-100 text-emerald-700' :
                                            'bg-pink-100 text-pink-700'
                                        }`}>
                                            <FontAwesomeIcon icon={user.role === 'veterinario' ? faUserMd : faUserNurse} />
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => handleDelete(user.id, user.name)}
                                            className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition"
                                            title="Revocar acceso"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DashboardUsers;
