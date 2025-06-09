// client/src/config/axiosConfig.js
import axios from 'axios';

const axiosInstance = axios.create({
  // *** CAMBIO CLAVE AQUÍ: baseURL apunta a la raíz de tu backend ***
  // Asume que tu backend corre en http://localhost:3000 en desarrollo.
  // En producción, VITE_BACKEND_URL debería ser el dominio de tu backend (ej: https://api.tu-dominio.com)
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación a cada solicitud
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;