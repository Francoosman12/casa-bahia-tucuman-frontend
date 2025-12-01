import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    // 👇 BORRAMOS la línea de 'headers: { Content-Type... }'
    // Dejamos que Axios decida automáticamente el tipo de contenido.
});

// Interceptor (Token) - ESTO SIGUE IGUAL
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosClient;