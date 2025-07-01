// client/src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import cotizacionesReducer from '../features/cotizaciones/cotizacionesSlice.js';
import materialsReducer from '../features/materiales/materialsSlice.js';
import trabajosReducer from '../features/trabajos/trabajosSlice.js'; 
import empleadosReducer from '../features/empleados/EmpleadosSlice.js'; 
import clientesReducer from '../features/clientes/ClientesSlice.js'; // ¡Importa el slice de clientes!

const store = configureStore({
  reducer: {
    auth: authReducer,
    cotizaciones: cotizacionesReducer,
    materials: materialsReducer,
    trabajos: trabajosReducer, 
    empleados: empleadosReducer, 
    clientes: clientesReducer, // ¡Registra el slice de clientes aquí!
    // Puedes añadir más reducers aquí a medida que crees más slices
  },
  // Middleware opcional para desarrollo
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(myLogger),
  // devTools: process.env.NODE_ENV !== 'production',
});

export default store;
