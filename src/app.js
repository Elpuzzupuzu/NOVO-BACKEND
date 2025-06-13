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

// Configuración de CORS
// Es mejor aplicar CORS una sola vez y de forma correcta.
// Si ya tienes un corsOptions, úsalo directamente con app.use(cors(corsOptions));
// Elimina la línea `app.use(cors());` si usas la configuración con `corsOptions`.
const corsOptions = {
  origin: 'http://localhost:5173', // O tu URL de frontend en producción
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));


// Middleware para parsear JSON en las solicitudes
app.use(express.json());

// --- NUEVO MIDDLEWARE PARA DESHABILITAR CACHÉ ---
// Aplica este middleware antes de tus rutas principales de API para asegurar
// que no se envíen encabezados de caché que puedan causar respuestas 304.
app.use((req, res, next) => {
  // Solo aplicar a rutas que comienzan con /NOVO/
  if (req.path.startsWith('/NOVO/')) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    // Si tu servidor web (nginx, apache) no está añadiendo Surrogate-Control, esta línea no es estrictamente necesaria.
    // res.set('Surrogate-Control', 'no-store'); 
  }
  next();
});
// --- FIN DEL NUEVO MIDDLEWARE ---


// --- Rutas de Prueba ---
app.get('/api/status', (req, res) => {
    res.status(200).json({
        message: 'Servidor Express de Novo funcionando correctamente!',
        timestamp: new Date().toISOString()
    });
});

/// RUTAS PRINCIPALES ///
// Rutas de autenticación (login para clientes y empleados)
app.use('/NOVO/auth', authRoutes);

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