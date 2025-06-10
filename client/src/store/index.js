import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import cotizacionesReducer from '../features/cotizaciones/cotizacionesSlice'; // ¡Importa tu nuevo slice!

const store = configureStore({
  reducer: {
    auth: authReducer, // El slice de autenticación
    cotizaciones: cotizacionesReducer, // ¡Aquí registras el slice de cotizaciones!
    // Puedes añadir más reducers aquí a medida que crees más slices
  },
  // Middleware opcional para desarrollo (desactivar en producción si no es necesario)
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(myLogger),
  // devTools: process.env.NODE_ENV !== 'production', // Habilitar Redux DevTools solo en desarrollo
});

export default store;