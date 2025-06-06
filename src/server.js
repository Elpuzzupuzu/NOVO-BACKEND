// src/server.js

// Importa el módulo dotenv para cargar variables de entorno desde el archivo .env
// Asegúrate de que esta línea sea una de las primeras en tu archivo de inicio
import dotenv from 'dotenv';
dotenv.config();

// Importa la aplicación Express que configuramos en app.js
import app from './app.js';

// Define el puerto donde escuchará el servidor
// Toma el valor de la variable de entorno PORT, si no existe, usa 3000 por defecto
const PORT = process.env.PORT || 3000;

// Inicia el servidor de Express
app.listen(PORT, () => {
    // Imprime un mensaje en la consola cuando el servidor se ha iniciado exitosamente
    console.log(`🚀 Servidor de Novo Peticiones escuchando en el puerto ${PORT}`);
    console.log(`Accede a http://localhost:${PORT}/api/status para verificar el estado.`);
});
