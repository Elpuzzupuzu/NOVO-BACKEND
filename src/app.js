// src/app.js

// Importa Express, el framework web para Node.js
import express from 'express';
// Importa CORS para permitir peticiones desde diferentes orígenes (frontend)
import cors from 'cors';

// Crea una instancia de la aplicación Express
const app = express();

// --- Middleware ---
// Habilita CORS para todas las peticiones
// Esto es importante para que tu frontend (ej. React, Vue) pueda comunicarse con este backend
app.use(cors());

// Habilita el parser de JSON para que Express pueda leer cuerpos de peticiones en formato JSON
// Esto es esencial para recibir datos de un frontend, como al crear una cotización
app.use(express.json());

// --- Rutas de Prueba ---
// Define una ruta simple para verificar que el servidor está funcionando
// Cuando accedas a http://localhost:3000/api/status, verás el mensaje de estado
app.get('/api/status', (req, res) => {
    res.status(200).json({
        message: 'Servidor Express de Novo funcionando correctamente!',
        timestamp: new Date().toISOString()
    });
});

// Exporta la instancia de la aplicación Express
// Otros archivos, como server.js, podrán importarla y usarla
export default app;