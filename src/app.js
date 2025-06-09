// src/app.js

import express from 'express';
import cors from 'cors';
import clienteRoutes from './routes/Cliente.routes.js';
import materialRoutes from './routes/Material.routes.js';
import empleadoRoutes from './routes/Empleado.routes.js';
import peticionMaterialRoutes from './routes/PeticionMaterial.routes.js';
import cotizacionRoutes from './routes/Cotizacion.routes.js';
import trabajoRoutes from './routes/Trabajo.routes.js';
import reporteRoutes from './routes/Reporte.routes.js';




// Importa las nuevas rutas de autenticación
import authRoutes from './routes/Auth.routes.js';


const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Rutas de Prueba ---
app.get('/api/status', (req, res) => {
    res.status(200).json({
        message: 'Servidor Express de Novo funcionando correctamente!',
        timestamp: new Date().toISOString()
    });
});

const corsOptions = {
  origin: 'http://localhost:5173', // O 'http://localhost:5173' para desarrollo
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Si usas cookies, encabezados de autorización, etc.
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

/// RUTAS PRINCIPALES ///
// Rutas de autenticación (login para clientes y empleados)
app.use('/NOVO/auth', authRoutes); // Prefijo '/NOVO/auth' <----ESTOS SON PARA LOS EMPLEADOS OJO

// Rutas de clientes (registro y CRUD protegido)
app.use('/NOVO/clientes', clienteRoutes);

// Rutas de materiales (CRUD protegido)
app.use('/NOVO/materiales', materialRoutes);

// Rutas de empleados (CRUD protegido)
app.use('/NOVO/empleados', empleadoRoutes);

// Todas las rutas de peticiones de material serán prefijadas con '/NOVO/peticiones-material'
app.use('/NOVO/peticiones-material', peticionMaterialRoutes)


// rutas para cotizar '/NOVO/cotizaciones'
app.use('/NOVO/cotizaciones', cotizacionRoutes);

// --- Integración de Rutas de Trabajos ---
// Todas las rutas de trabajos serán prefijadas con '/NOVO/trabajos'
app.use('/NOVO/trabajos', trabajoRoutes);

// Todas las rutas de reportes serán prefijadas con '/NOVO/reports'
app.use('/NOVO/reports', reporteRoutes);

export default app;
