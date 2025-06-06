// src/models/PeticionMaterial.model.js

// Importa el pool de conexiones a la base de datos
import { pool } from '../config/db.js';
// Importa la librería uuid para generar IDs únicos (UUIDs)
import { v4 as uuidv4 } from 'uuid';

class PeticionMaterial {
    /**
     * Crea una nueva petición de material en la base de datos.
     * @param {object} peticionData - Objeto con los datos de la nueva petición.
     * @param {string} [peticionData.cotizacion_id] - ID de la cotización asociada (opcional).
     * @param {string} [peticionData.trabajo_id] - ID del trabajo asociado (opcional).
     * @param {string} peticionData.material_codigo - ID del material que se necesita.
     * @param {number} peticionData.cantidad_requerida_metros - Cantidad de material requerida.
     * @param {string} [peticionData.notas] - Notas adicionales sobre la petición (opcional).
     * @param {boolean} [peticionData.gerente_notificado=false] - Si el gerente ha sido notificado (por defecto false).
     * @param {string} [peticionData.estado='Pendiente de Compra'] - Estado de la petición.
     * @returns {Promise<object>} El objeto de la petición de material creada.
     * @throws {Error} Si faltan datos requeridos o hay un error de base de datos.
     */
    static async create(peticionData) {
        const id_peticion_material = uuidv4();
        const {
            cotizacion_id = null,
            trabajo_id = null,
            material_codigo,
            cantidad_requerida_metros,
            notas = null,
            gerente_notificado = false,
            estado = 'Pendiente de Compra'
        } = peticionData;

        // Validación de la restricción CHECK de la base de datos (cotizacion_id IS NOT NULL OR trabajo_id IS NOT NULL)
        if (!cotizacion_id && !trabajo_id) {
            throw new Error('Una petición de material debe estar asociada a una cotización o a un trabajo.');
        }

        const query = `
            INSERT INTO peticiones_material (id_peticion_material, cotizacion_id, trabajo_id, material_codigo, cantidad_requerida_metros, notas, gerente_notificado, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            id_peticion_material,
            cotizacion_id,
            trabajo_id,
            material_codigo,
            cantidad_requerida_metros,
            notas,
            gerente_notificado,
            estado
        ];

        try {
            await pool.query(query, values);
            return { id_peticion_material, ...peticionData };
        } catch (error) {
            console.error('Error al crear petición de material:', error.message);
            throw new Error(`No se pudo crear la petición de material: ${error.message}`);
        }
    }

    /**
     * Obtiene una petición de material por su ID.
     * @param {string} id_peticion_material - El ID de la petición a buscar.
     * @returns {Promise<object|null>} El objeto de la petición si se encuentra, o null si no.
     */
    static async findById(id_peticion_material) {
        const query = 'SELECT * FROM peticiones_material WHERE id_peticion_material = ?';
        try {
            const [rows] = await pool.query(query, [id_peticion_material]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error al buscar petición de material por ID:', error.message);
            throw new Error(`No se pudo encontrar la petición de material: ${error.message}`);
        }
    }

    /**
     * Obtiene todas las peticiones de material, con opciones de filtrado.
     * @param {object} [filters={}] - Objeto con filtros opcionales (ej: { estado: 'Pendiente de Compra', cotizacion_id: 'abc' }).
     * @returns {Promise<Array<object>>} Un array de objetos de peticiones de material.
     */
    static async findAll(filters = {}) {
        let query = 'SELECT * FROM peticiones_material';
        const conditions = [];
        const values = [];

        if (filters.estado) {
            conditions.push('estado = ?');
            values.push(filters.estado);
        }
        if (filters.cotizacion_id) {
            conditions.push('cotizacion_id = ?');
            values.push(filters.cotizacion_id);
        }
        if (filters.trabajo_id) {
            conditions.push('trabajo_id = ?');
            values.push(filters.trabajo_id);
        }
        if (filters.gerente_notificado !== undefined) {
            conditions.push('gerente_notificado = ?');
            values.push(filters.gerente_notificado);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY fecha_solicitud DESC'; // Ordenar por fecha de solicitud

        try {
            const [rows] = await pool.query(query, values);
            return rows;
        } catch (error) {
            console.error('Error al obtener peticiones de material:', error.message);
            throw new Error('No se pudieron obtener las peticiones de material.');
        }
    }

    /**
     * Actualiza los datos de una petición de material existente.
     * @param {string} id_peticion_material - El ID de la petición a actualizar.
     * @param {object} updateData - Objeto con los datos a actualizar.
     * @returns {Promise<boolean>} True si la actualización fue exitosa, false si no se encontró la petición.
     */
    static async update(id_peticion_material, updateData) {
        const fields = [];
        const values = [];

        for (const key in updateData) {
            if (updateData.hasOwnProperty(key) && key !== 'id_peticion_material') {
                // Validación para el campo 'estado' si es un ENUM
                if (key === 'estado' && !['Pendiente de Compra', 'Comprado', 'En Uso'].includes(updateData[key])) {
                    throw new Error(`El estado '${updateData[key]}' no es válido.`);
                }
                fields.push(`${key} = ?`);
                values.push(updateData[key]);
            }
        }

        if (fields.length === 0) {
            return false; // No hay datos para actualizar
        }

        values.push(id_peticion_material); // Añade el ID de la petición al final

        const query = `UPDATE peticiones_material SET ${fields.join(', ')} WHERE id_peticion_material = ?`;
        try {
            const [result] = await pool.query(query, values);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error al actualizar petición de material:', error.message);
            throw new Error(`No se pudo actualizar la petición de material: ${error.message}`);
        }
    }

    /**
     * Elimina una petición de material de la base de datos.
     * @param {string} id_peticion_material - El ID de la petición a eliminar.
     * @returns {Promise<boolean>} True si la eliminación fue exitosa, false si no se encontró.
     */
    static async delete(id_peticion_material) {
        const query = 'DELETE FROM peticiones_material WHERE id_peticion_material = ?';
        try {
            const [result] = await pool.query(query, [id_peticion_material]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error al eliminar petición de material:', error.message);
            throw new Error(`No se pudo eliminar la petición de material: ${error.message}`);
        }
    }
}

export default PeticionMaterial;
