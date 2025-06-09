// client/src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice'; // Importaremos este slice en el siguiente paso

const store = configureStore({
  reducer: {
    auth: authReducer, // Aquí registraremos nuestro slice de autenticación
    // Puedes añadir más reducers aquí a medida que crees más slices
  },
  // Middleware opcional para desarrollo (desactivar en producción si no es necesario)
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(myLogger),
  // devTools: process.env.NODE_ENV !== 'production', // Habilitar Redux DevTools solo en desarrollo
});

export default store;