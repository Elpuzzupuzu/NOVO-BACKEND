// client/src/config/axiosConfig.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api', // Asegúrate de que esta URL coincida con tu backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Opcional: Interceptores para añadir tokens de autenticación
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Asume que guardas el token aquí
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