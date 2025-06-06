// src/app.js

// Importa Express, el framework web para Node.js
import express from 'express';
// Importa CORS para permitir peticiones desde diferentes orígenes (frontend)
import cors from 'cors';

/// --- Rutas ---
// ¡IMPORTANTE! Esta línea es la que te falta.
// Importa las rutas de clientes desde su archivo correspondiente.
import clienteRoutes from './routes/cliente.routes.js';


// Crea una instancia de la aplicación Express
const app = express();

// --- Middleware ---
// Habilita CORS para todas las peticiones
app.use(cors());

// Habilita el parser de JSON para que Express pueda leer cuerpos de peticiones en formato JSON
app.use(express.json());

// --- Rutas de Prueba ---
// Define una ruta simple para verificar que el servidor está funcionando
// Cuando accedes a http://localhost:3000/api/status
app.get('/api/status', (req, res) => {
    res.status(200).json({
        message: 'Servidor Express de Novo funcionando correctamente!',
        timestamp: new Date().toISOString()
    });
});


/// RUTAS PRINCIPALES ///
// --- Integración de Rutas de Clientes ---
// Todas las rutas definidas en cliente.routes.js serán prefijadas con '/NOVO/clientes'
// Ahora clienteRoutes ya estará definido gracias a la importación de arriba.
app.use('/NOVO/clientes', clienteRoutes);

// Exporta la instancia de la aplicación Express
export default app;
