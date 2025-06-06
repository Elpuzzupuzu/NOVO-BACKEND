// src/app.js

import express from 'express';
import cors from 'cors';
import clienteRoutes from './routes/Cliente.routes.js';
import materialRoutes from './routes/Material.routes.js';
import empleadoRoutes from './routes/Empleado.routes.js';
import peticionMaterialRoutes from './routes/PeticionMaterial.routes.js';

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

export default app;
