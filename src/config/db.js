// src/config/db.js

// Importa el módulo dotenv para cargar variables de entorno
import dotenv from 'dotenv';
dotenv.config();

// Importa el paquete mysql2 para interactuar con MySQL
// Usaremos la opción de 'createPool' para gestionar múltiples conexiones eficientemente
import mysql from 'mysql2/promise';

// Configuración del pool de conexiones a la base de datos
// Los valores se toman de las variables de entorno para mayor seguridad y flexibilidad
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true, // Espera si no hay conexiones disponibles en el pool
    connectionLimit: 10,     // Número máximo de conexiones en el pool
    queueLimit: 0            // Sin límite de cola para solicitudes (0 significa ilimitado)
});

// Función para probar la conexión a la base de datos
const testDbConnection = async () => {
    try {
        const connection = await pool.getConnection(); // Intenta obtener una conexión del pool
        console.log('✅ Conexión exitosa a la base de datos MySQL.');
        connection.release(); // Libera la conexión de vuelta al pool
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos MySQL:', error.message);
        // Opcional: Salir del proceso si la conexión inicial falla
        // process.exit(1);
    }
};

// Exporta el pool de conexiones y la función de prueba
export { pool, testDbConnection };
