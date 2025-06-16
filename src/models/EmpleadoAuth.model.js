// src/models/EmpleadoAuth.model.js

// Importa el pool de conexiones a la base de datos
import { pool } from '../config/db.js';
// Importa bcryptjs para comparar contraseñas (el hasheo se haría al crear el empleado via Empleado.model.js)
import bcrypt from 'bcryptjs';

class EmpleadoAuth {
    /**
     * Obtiene un empleado por su nombre de usuario para propósitos de autenticación.
     * Incluye la contraseña hasheada y el rol.
     * @param {string} username - El nombre de usuario del empleado.
     * @returns {Promise<object|null>} El objeto del empleado si se encuentra, o null si no.
     */
    static async findByUsername(username) {
        // --- CAMBIO AQUÍ: Añadir foto_perfil_url a la consulta SELECT ---
        const query = 'SELECT id_empleado, nombre, apellido, username, password, role, foto_perfil_url FROM empleados WHERE username = ?';
        try {
            const [rows] = await pool.query(query, [username]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error al buscar empleado por username para autenticación:', error.message);
            throw new Error(`No se pudo encontrar el empleado por username: ${error.message}`);
        }
    }

    /**
     * Compara una contraseña en texto plano con una contraseña hasheada.
     * @param {string} plainPassword - La contraseña en texto plano proporcionada por el usuario.
     * @param {string} hashedPassword - La contraseña hasheada almacenada en la base de datos.
     * @returns {Promise<boolean>} True si las contraseñas coinciden, false en caso contrario.
     */
    static async comparePassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
}

export default EmpleadoAuth;