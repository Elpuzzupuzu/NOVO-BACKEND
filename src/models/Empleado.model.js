// src/models/Empleado.model.js

// Importa el pool de conexiones a la base de datos
import { pool } from '../config/db.js';
// Importa la librería uuid para generar IDs únicos (UUIDs)
import { v4 as uuidv4 } from 'uuid';
// Importa bcryptjs para hashear y comparar contraseñas
import bcrypt from 'bcryptjs';

// Define el número de 'rounds' (costo) para el hashing de bcrypt.
const SALT_ROUNDS = 10;

class Empleado {
    /**
     * Crea un nuevo empleado en la base de datos, incluyendo su rol, username y hasheando la contraseña.
     * @param {object} empleadoData - Objeto con los datos del nuevo empleado.
     * @param {string} empleadoData.nombre - Nombre del empleado.
     * @param {string} [empleadoData.apellido] - Apellido del empleado (opcional).
     * @param {string} [empleadoData.cargo] - Cargo del empleado (ej: "Diseñador").
     * @param {string} [empleadoData.contacto] - Contacto del empleado (único, ej: teléfono, email).
     * @param {string} empleadoData.username - Nombre de usuario del empleado (único).
     * @param {string} empleadoData.password - Contraseña en texto plano del empleado.
     * @param {string} [empleadoData.foto_perfil_url] - URL de la foto de perfil del empleado (opcional). // ADDED JSDOC
     * @param {string} [empleadoData.role='empleado'] - Rol del empleado (ej: 'empleado', 'gerente', 'admin').
     * @param {string} [empleadoData.fecha_contratacion] - Fecha de contratación (formato 'YYYY-MM-DD').
     * @param {boolean} [empleadoData.activo=true] - Si el empleado está activo.
     * @returns {Promise<object>} El objeto del empleado creado (sin la contraseña hasheada).
     * @throws {Error} Si el contacto o username ya existen o hay un error.
     */
    static async create(empleadoData) {
        const id_empleado = uuidv4();
        const {
            nombre,
            apellido = null,
            cargo = null,
            contacto = null,
            username, // Requerido para login
            password, // Requerido para login
            // ADDED: Include foto_perfil_url in destructuring
            foto_perfil_url = null,
            fecha_contratacion = null,
            activo = true
        } = empleadoData;
        const role = empleadoData.role || 'empleado'; // Por defecto 'empleado'

        // Hashear la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const query = `
            INSERT INTO empleados (id_empleado, nombre, apellido, cargo, contacto, username, password, foto_perfil_url, role, fecha_contratacion, activo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        // ADDED: Add foto_perfil_url to the values array
        const values = [id_empleado, nombre, apellido, cargo, contacto, username, hashedPassword, foto_perfil_url, role, fecha_contratacion, activo];

        try {
            await pool.query(query, values);
            // Retorna el empleado creado, excluyendo la contraseña hasheada por seguridad
            const { password: _, ...empleadoWithoutPassword } = empleadoData;
            return { id_empleado, role, foto_perfil_url, ...empleadoWithoutPassword }; // Ensure foto_perfil_url is returned
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                if (error.message.includes('for key \'contacto\'')) {
                    throw new Error('El contacto del empleado ya está registrado.');
                }
                if (error.message.includes('for key \'username\'')) {
                    throw new Error('El username del empleado ya está en uso.'); // Mensaje más específico
                }
            }
            console.error('Error al crear empleado:', error.message);
            throw new Error(`No se pudo crear el empleado: ${error.message}`);
        }
    }

    /**
     * Obtiene un empleado por su ID. No incluye la contraseña hasheada por defecto.
     * @param {string} id_empleado - El ID del empleado a buscar.
     * @returns {Promise<object|null>} El objeto del empleado si se encuentra, o null si no.
     */
    static async findById(id_empleado) {
        // ADDED: Include foto_perfil_url in the SELECT statement
        const query = 'SELECT id_empleado, nombre, apellido, cargo, contacto, username, foto_perfil_url, role, fecha_contratacion, activo, fecha_creacion, fecha_actualizacion FROM empleados WHERE id_empleado = ?';
        try {
            const [rows] = await pool.query(query, [id_empleado]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error al buscar empleado por ID:', error.message);
            throw new Error(`No se pudo encontrar el empleado: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los empleados de la base de datos sin filtros ni paginación (método original).
     * No incluye contraseñas.
     * @returns {Promise<Array<object>>} Un array de objetos de empleados.
     */
    static async findAll() {
        // ADDED: Include foto_perfil_url in the SELECT statement
        const query = 'SELECT id_empleado, nombre, apellido, cargo, contacto, username, foto_perfil_url, role, fecha_contratacion, activo, fecha_creacion, fecha_actualizacion FROM empleados';
        try {
            const [rows] = await pool.query(query);
            return rows;
        } catch (error) {
            console.error('Error al obtener todos los empleados (original):', error.message);
            throw new Error('No se pudieron obtener los empleados (original).');
        }
    }

    /**
     * Obtiene empleados con filtros, búsqueda y paginación.
     * Este es el NUEVO método para la funcionalidad extendida.
     * @param {object} filters - Objeto con filtros (ej: { searchTerm: 'juan', activo: true, role: 'empleado' }).
     * @param {number} page - Número de página actual.
     * @param {number} limit - Cantidad de elementos por página.
     * @returns {Promise<object>} Un objeto que contiene 'data' (array de empleados) y 'pagination' (metadatos).
     * @throws {Error} Si hay un error en la base de datos al recuperar los empleados.
     */
    static async findPaginatedAndFiltered(filters = {}, page = 1, limit = 10) {
        let query = `
            SELECT
                id_empleado, nombre, apellido, cargo, contacto, username, foto_perfil_url, role, fecha_contratacion, fecha_baja, activo, fecha_creacion, fecha_actualizacion
            FROM
                empleados
        `;
        let countQuery = 'SELECT COUNT(id_empleado) as total FROM empleados';

        const conditions = [];
        const values = [];
        const countValues = [];

        // Filtro por 'activo'
        if (typeof filters.activo !== 'undefined') {
            conditions.push('activo = ?');
            values.push(filters.activo);
            countValues.push(filters.activo);
        }

        // Filtro por 'role'
        if (filters.role) {
            conditions.push('role = ?');
            values.push(filters.role);
            countValues.push(filters.role);
        }

        // Lógica de búsqueda por searchTerm (id_empleado, nombre, apellido, username, cargo, contacto)
        if (filters.searchTerm) {
            const cleanedSearchTerm = filters.searchTerm.trim();
            const termLike = `%${cleanedSearchTerm}%`;

            // Buscar en múltiples campos con LIKE
            conditions.push(`
                (id_empleado LIKE ? OR
                nombre LIKE ? OR
                apellido LIKE ? OR
                username LIKE ? OR
                cargo LIKE ? OR
                contacto LIKE ?)
            `);
            values.push(termLike, termLike, termLike, termLike, termLike, termLike);
            countValues.push(termLike, termLike, termLike, termLike, termLike, termLike);
        }

        if (conditions.length > 0) {
            const whereClause = ' WHERE ' + conditions.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }

        // Ordenar por nombre y apellido ascendente por defecto
        query += ' ORDER BY nombre ASC, apellido ASC';

        const offset = (page - 1) * limit;
        query += ` LIMIT ? OFFSET ?`;
        values.push(limit, offset);

        // --- Debugging (opcional, puedes quitarlo en producción) ---
        console.log("--- Debugging Empleado.findPaginatedAndFiltered (Backend) ---");
        console.log("Final Data Query:", query);
        console.log("Values for Data Query:", values);
        console.log("Final Count Query:", countQuery);
        console.log("Values for Count Query:", countValues);
        console.log("--- End Debugging ---");

        try {
            const [rows] = await pool.query(query, values);
            const [countResult] = await pool.query(countQuery, countValues);

            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            return {
                data: rows,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
            };
        } catch (error) {
            console.error('Error al recuperar empleados (paginados/filtrados):', error.message);
            throw new Error('No se pudieron recuperar los empleados (paginados/filtrados).');
        }
    }

    /**
     * Actualiza los datos de un empleado existente.
     * Permite actualizar la contraseña, hasheándola si se proporciona.
     * @param {string} id_empleado - El ID del empleado a actualizar.
     * @param {object} updateData - Objeto con los datos a actualizar.
     * @param {string} [updateData.password] - Nueva contraseña en texto plano (se hasheará).
     * @param {string} [updateData.foto_perfil_url] - URL de la nueva foto de perfil. // ADDED JSDOC
     * @returns {Promise<boolean>} True si la actualización fue exitosa, false si no se encontró el empleado.
     * @throws {Error} Si el contacto o username a actualizar ya existe en otro empleado.
     */
    static async update(id_empleado, updateData) {
        const fields = [];
        const values = [];

        for (const key in updateData) {
            if (updateData.hasOwnProperty(key) && key !== 'id_empleado') { // No permitir actualizar el ID
                if (key === 'password') {
                    // Si la contraseña se está actualizando, hashearla
                    values.push(await bcrypt.hash(updateData[key], SALT_ROUNDS));
                } else {
                    values.push(updateData[key]);
                }
                fields.push(`${key} = ?`);
            }
        }

        if (fields.length === 0) {
            return false; // No hay datos para actualizar
        }

        values.push(id_empleado); // Añade el ID del empleado al final de los valores

        const query = `UPDATE empleados SET ${fields.join(', ')} WHERE id_empleado = ?`;
        try {
            const [result] = await pool.query(query, values);
            if (result.affectedRows === 0) {
                return false; // No se encontró el empleado o no se actualizó nada
            }
            return true;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                if (error.message.includes('for key \'contacto\'')) {
                    throw new Error('El nuevo contacto del empleado ya está en uso.');
                }
                if (error.message.includes('for key \'username\'')) {
                    throw new Error('El nuevo username del empleado ya está en uso.');
                }
            }
            console.error('Error al actualizar empleado:', error.message);
            throw new Error(`No se pudo actualizar el empleado: ${error.message}`);
        }
    }

    /**
     * Elimina un empleado de la base de datos.
     * @param {string} id_empleado - El ID del empleado a eliminar.
     * @returns {Promise<boolean>} True si la eliminación fue exitosa, false si no se encontró el empleado.
     */
    static async delete(id_empleado) {
        const query = 'DELETE FROM empleados WHERE id_empleado = ?';
        try {
            const [result] = await pool.query(query, [id_empleado]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error al eliminar empleado:', error.message);
            throw new Error(`No se pudo eliminar el empleado: ${error.message}`);
        }
    }
}

export default Empleado;