// client/src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import cotizacionesReducer from '../features/cotizaciones/cotizacionesSlice';
import materialsReducer from '../features/materiales/materialsSlice';
import trabajosReducer from '../features/trabajos/trabajosSlice'; // ¡Importa el nuevo slice de trabajos!

const store = configureStore({
  reducer: {
    auth: authReducer,
    cotizaciones: cotizacionesReducer,
    materials: materialsReducer,
    trabajos: trabajosReducer, // ¡Registra el slice de trabajos aquí!
    // Puedes añadir más reducers aquí a medida que crees más slices
  },
  // Middleware opcional para desarrollo
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(myLogger),
  // devTools: process.env.NODE_ENV !== 'production',
});

export default store;