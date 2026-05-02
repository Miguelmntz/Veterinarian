import axios from 'axios';

// Creamos una instancia personalizada de Axios
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
});

// Interceptor para añadir el token automáticamente si existe
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('vet_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
