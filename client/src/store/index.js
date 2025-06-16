// client/src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import cotizacionesReducer from '../features/cotizaciones/cotizacionesSlice';
import materialsReducer from '../features/materiales/materialsSlice';
import trabajosReducer from '../features/trabajos/trabajosSlice'; 
import empleadosReducer from '../features/empleados/EmpleadosSlice'; // ¡Importa el slice de empleados!

const store = configureStore({
  reducer: {
    auth: authReducer,
    cotizaciones: cotizacionesReducer,
    materials: materialsReducer,
    trabajos: trabajosReducer, 
    empleados: empleadosReducer, // ¡Registra el slice de empleados aquí!
    // Puedes añadir más reducers aquí a medida que crees más slices
  },
  // Middleware opcional para desarrollo
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(myLogger),
  // devTools: process.env.NODE_ENV !== 'production',
});

export default store;
