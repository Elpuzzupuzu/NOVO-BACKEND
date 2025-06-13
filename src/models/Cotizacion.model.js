// src/models/Cotizacion.model.js

// Import the database connection pool
import { pool } from '../config/db.js';
// Import uuid library for generating unique IDs (UUIDs)
import { v4 as uuidv4 } from 'uuid';

class Cotizacion {
    /**
     * Creates a new quote in the database.
     * @param {object} cotizacionData - Object with the new quote's data.
     * @param {string} cotizacionData.cliente_id - ID of the associated client.
     * @param {string} cotizacionData.tipo_producto - Type of product (e.g., 'Funda de asiento').
     * @param {string} [cotizacionData.material_base_id] - ID of the base material (optional).
     * @param {string} [cotizacionData.color_tela] - Fabric color (optional).
     * @param {number} [cotizacionData.metros_estimados] - Estimated meters of material (optional).
     * @param {boolean} [cotizacionData.diseno_personalizado=false] - Whether a custom design is required.
     * @param {string} [cotizacionData.descripcion_diseno] - Description of the custom design (optional).
     * @param {number} [cotizacionData.precio_diseno_personalizado=0.00] - Additional cost for custom design.
     * @param {number} cotizacionData.total_estimado - Estimated total amount of the quote.
     * @param {number} cotizacionData.anticipo_requerido - Required deposit (50% of total_estimado).
     * @param {string} [cotizacionData.estado='Pendiente de Anticipo'] - Current status of the quote.
     * @param {string} [cotizacionData.fecha_agendada] - Scheduled date (optional).
     * @param {string} [cotizacionData.notas_adicionales] - Additional notes (optional).
     * @returns {Promise<object>} The created quote object.
     * @throws {Error} If required data is missing or a database error occurs.
     */
    static async create(cotizacionData) {
        const id_cotizacion = uuidv4();
        const {
            cliente_id,
            tipo_producto,
            material_base_id = null,
            color_tela = null,
            metros_estimados = null,
            diseno_personalizado = false,
            descripcion_diseno = null,
            precio_diseno_personalizado = 0.00,
            total_estimado,
            anticipo_requerido,
            monto_anticipo_pagado = 0.00,
            metodo_pago_anticipo = null,
            fecha_pago_anticipo = null,
            estado = 'Pendiente de Anticipo',
            fecha_agendada = null,
            notas_adicionales = null
        } = cotizacionData;

        const query = `
            INSERT INTO cotizaciones (
                id_cotizacion, cliente_id, tipo_producto, material_base_id, color_tela,
                metros_estimados, diseno_personalizado, descripcion_diseno, precio_diseno_personalizado,
                total_estimado, anticipo_requerido, monto_anticipo_pagado, metodo_pago_anticipo,
                fecha_pago_anticipo, estado, fecha_agendada, notas_adicionales
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            id_cotizacion, cliente_id, tipo_producto, material_base_id, color_tela,
            metros_estimados, diseno_personalizado, descripcion_diseno, precio_diseno_personalizado,
            total_estimado, anticipo_requerido, monto_anticipo_pagado, metodo_pago_anticipo,
            fecha_pago_anticipo, estado, fecha_agendada, notas_adicionales
        ];

        try {
            await pool.query(query, values);
            return { id_cotizacion, ...cotizacionData };
        } catch (error) {
            console.error('Error creating quote:', error.message);
            throw new Error(`Could not create quote: ${error.message}`);
        }
    }

    /**
     * Retrieves a quote by its ID.
     * @param {string} id_cotizacion - The ID of the quote to retrieve.
     * @returns {Promise<object|null>} The quote object if found, or null otherwise.
     */
    static async findById(id_cotizacion) {
        const query = 'SELECT * FROM cotizaciones WHERE id_cotizacion = ?';
        try {
            const [rows] = await pool.query(query, [id_cotizacion]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding quote by ID:', error.message);
            throw new Error(`Could not find quote: ${error.message}`);
        }
    }

    /**
     * Retrieves all quotes, with optional filters.
     * @param {object} [filters={}] - Optional filters object (e.g., { cliente_id: 'abc', estado: 'Completada' }).
     * @returns {Promise<Array<object>>} An array of quote objects.
     */
    static async findAll(filters = {}) {
        let query = 'SELECT * FROM cotizaciones';
        const conditions = [];
        const values = [];

        if (filters.cliente_id) {
            conditions.push('cliente_id = ?');
            values.push(filters.cliente_id);
        }
        if (filters.estado) {
            conditions.push('estado = ?');
            values.push(filters.estado);
        }
        // Add more filters as needed (e.g., date ranges, material_base_id)

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY fecha_solicitud DESC'; // Order by request date

        try {
            const [rows] = await pool.query(query, values);
            return rows;
        } catch (error) {
            console.error('Error retrieving quotes:', error.message);
            throw new Error('Could not retrieve quotes.');
        }
    }









    

    /**
     * Updates an existing quote's data.
     * @param {string} id_cotizacion - The ID of the quote to update.
     * @param {object} updateData - Object with the data to update.
     * @returns {Promise<boolean>} True if the update was successful, false if the quote was not found.
     */
    static async update(id_cotizacion, updateData) {
        const fields = [];
        const values = [];

        for (const key in updateData) {
            if (updateData.hasOwnProperty(key) && key !== 'id_cotizacion') {
                // Validation for 'estado' field if it's an ENUM
                if (key === 'estado' && !['Pendiente de Anticipo', 'Anticipo Pagado - Agendado', 'Anticipo Pagado - En Cola', 'Rechazada', 'Completada'].includes(updateData[key])) {
                    throw new Error(`The status '${updateData[key]}' is not valid.`);
                }
                fields.push(`${key} = ?`);
                values.push(updateData[key]);
            }
        }

        if (fields.length === 0) {
            return false; // No data to update
        }

        values.push(id_cotizacion); // Add the quote ID to the end for the WHERE clause

        const query = `UPDATE cotizaciones SET ${fields.join(', ')} WHERE id_cotizacion = ?`;
        try {
            const [result] = await pool.query(query, values);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating quote:', error.message);
            throw new Error(`Could not update quote: ${error.message}`);
        }
    }

    /**
     * Deletes a quote from the database.
     * @param {string} id_cotizacion - The ID of the quote to delete.
     * @returns {Promise<boolean>} True if the deletion was successful, false if the quote was not found.
     */
    static async delete(id_cotizacion) {
        const query = 'DELETE FROM cotizaciones WHERE id_cotizacion = ?';
        try {
            const [result] = await pool.query(query, [id_cotizacion]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting quote:', error.message);
            throw new Error(`Could not delete quote: ${error.message}`);
        }
    }
}

export default Cotizacion;
