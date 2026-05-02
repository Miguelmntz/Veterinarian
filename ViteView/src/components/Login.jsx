import React, { useState } from 'react';
import api from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDog, faEnvelope, faLock, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const Login = ({ onLoginSuccess }) => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/login', credentials);
            onLoginSuccess(response.data.user, response.data.token);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Acceso Denegado',
                text: error.response?.data?.message || 'Error en las credenciales. Revisa tu correo y contraseña.',
                confirmButtonColor: '#4f46e5'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
            {/* Background design */}
            <div className="absolute top-0 left-0 w-full h-[40vh] bg-indigo-700 skew-y-3 origin-top-left -z-10 shadow-lg"></div>

            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-500 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="bg-indigo-100 text-indigo-700 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner ring-4 ring-indigo-50">
                        <FontAwesomeIcon icon={faDog} size="3x" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-800 tracking-tight">Acceso Privado</h2>
                    <p className="text-gray-500 mt-2 text-sm font-medium">Clínica Veterinaria MMM</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Correo Electrónico</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <FontAwesomeIcon icon={faEnvelope} />
                            </div>
                            <input
                                type="email"
                                required
                                value={credentials.email}
                                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all text-gray-800 font-medium"
                                placeholder="ejemplo@correo.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Contraseña</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <FontAwesomeIcon icon={faLock} />
                            </div>
                            <input
                                type="password"
                                required
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all text-gray-800 font-medium"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition duration-200 flex items-center justify-center shadow-md active:scale-[0.98] disabled:opacity-75 disabled:cursor-wait"
                    >
                        {loading ? <FontAwesomeIcon icon={faSpinner} spin className="text-xl" /> : 'Iniciar Sesión Segura'}
                    </button>

                    <div className="relative mt-6 mb-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500 font-medium">O continúa con</span>
                        </div>
                    </div>

                    {/* OAuth Google Button */}
                    <a
                        href={`${import.meta.env.VITE_API_URL || ''}/auth/google`}
                        className="w-full bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl transition duration-200 flex items-center justify-center shadow-sm active:scale-[0.98] gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#EA4335" d="M12 4.187C14.186 4.187 15.932 4.957 17.228 6.1l4.49-4.49C19.349 0.057 15.904 -1 12 -1 -3.834 -1 -8.373 7.854 -4.845 13.916l5.056-4.004C1.947 7.027 6.467 4.187 12 4.187z" />
                            <path fill="#4285F4" d="M23.496 11.235H12v4.83H18.66c-.503 2.164-2.128 4.298-5.328 6.03l4.636 4.382c2.612-2.316 4.887-5.908 5.528-15.242z" />
                            <path fill="#FBBC05" d="M12 25.04c3.344 0 6.64-1.114 9.17-3.155l-4.636-4.382c-2.348 1.488-5.074 2.12-8.358 1.155-4.52-1.355-8.232-5.3-9.288-10.02L-6.168 12.64C-2.457 19.394 4.542 25.04 12 25.04z" />
                            <path fill="#34A853" d="M2.812 8.638L-2.244 12.64C-1.07 9.882 .805 7.42 2.812 5.534l5.056 4.004C6.544 10.378 5.674 11.396 5.674 12.64c0 1.24.87 2.26 2.194 3.102z" />
                        </svg>
                        Google
                    </a>

                    {/* Nota visual para recordar credenciales al testear */}
                    <div className="mt-6 text-center text-xs text-gray-400 border-t border-gray-100 pt-4 bg-gray-50/50 rounded-lg pb-1">
                        <span className="font-bold flex items-center justify-center gap-1 mb-1 text-gray-500">🔒 Credenciales de Pruebas</span>
                        <p>Vet: <span className="text-indigo-400">admin@veterinario.com</span> / password123</p>
                        <p>Tus clientes actuales usan su <span className="text-orange-400">email</span> y la clave <span className="text-orange-400">password123</span></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
