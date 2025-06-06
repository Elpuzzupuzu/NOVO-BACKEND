// src/server.js

// ¡IMPORTANTE! Asegúrate de que esta línea esté al principio
// Importa el módulo dotenv para cargar variables de entorno desde el archivo .env
import dotenv from 'dotenv';
dotenv.config(); // Ahora dotenv está definido y puedes llamar a config()

// Importa la aplicación Express que configuramos en app.js
import app from './app.js';
// Importa la función para probar la conexión a la base de datos
import { testDbConnection } from './config/db.js';

// Define el puerto donde escuchará el servidor
const PORT = process.env.PORT || 3000;

// Antes de iniciar el servidor, prueba la conexión a la base de datos
testDbConnection().then(() => {
    // Si la conexión es exitosa, inicia el servidor de Express
    app.listen(PORT, () => {
        console.log(`🚀 Servidor de Novo Peticiones escuchando en el puerto ${PORT}`);
        console.log(`Accede a http://localhost:${PORT}/api/status para verificar el estado.`);
    });
}).catch(error => {
    // Si la conexión falla, muestra el error y no inicia el servidor
    console.error('🚨 Fallo al iniciar el servidor debido a un problema de conexión a la base de datos:', error);
    process.exit(1); // Sale del proceso con un código de error
});
