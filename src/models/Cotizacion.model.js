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
     * Retrieves all quotes, with optional filters including client name/ID search.
     * @param {object} [filters={}] - Optional filters object (e.g., { cliente_id: 'abc', estado: 'Completada', searchTerm: 'Juan' }).
     * @param {number} page - The current page number for pagination.
     * @param {number} limit - The number of items per page for pagination.
     * @returns {Promise<object>} An object containing an array of quote objects and pagination info.
     */
    static async findAll(filters = {}, page = 1, limit = 10) {
        let query = `
            SELECT
                c.*,
                cl.nombre AS cliente_nombre,
                cl.apellido AS cliente_apellido,
                m.nombre AS material_nombre
            FROM
                cotizaciones c
            JOIN
                clientes cl ON c.cliente_id = cl.id_cliente
            LEFT JOIN
                materiales m ON c.material_base_id = m.id_material
        `;
        let countQuery = 'SELECT COUNT(c.id_cotizacion) as total FROM cotizaciones c JOIN clientes cl ON c.cliente_id = cl.id_cliente';

        const conditions = [];
        const values = [];
        const countValues = [];

        // Filter by cliente_id (exact match for UUIDs)
        if (filters.cliente_id) {
            conditions.push('c.cliente_id = ?');
            values.push(filters.cliente_id);
            countValues.push(filters.cliente_id);
        }
        
        // Filter by estado
        if (filters.estado) {
            conditions.push('c.estado = ?');
            values.push(filters.estado);
            countValues.push(filters.estado);
        }

        // Lógica refinada para searchTerm
        if (filters.searchTerm) {
            const cleanedSearchTerm = filters.searchTerm.trim();
            const searchTermsArray = cleanedSearchTerm.split(/\s+/).filter(s => s.length > 0);

            if (searchTermsArray.length > 0) {
                if (searchTermsArray.length > 1) {
                    const multiWordConditions = [];
                    searchTermsArray.forEach(term => {
                        const termLike = `%${term}%`;
                        multiWordConditions.push('(cl.nombre LIKE ? OR cl.apellido LIKE ?)');
                        values.push(termLike, termLike);
                        countValues.push(termLike, termLike);
                    });
                    conditions.push(`(${multiWordConditions.join(' AND ')})`);
                } else {
                    const termLike = `%${searchTermsArray[0]}%`;
                    conditions.push('(cl.nombre LIKE ? OR cl.apellido LIKE ? OR c.id_cotizacion LIKE ? OR c.cliente_id LIKE ?)');
                    values.push(termLike, termLike, termLike, termLike);
                    countValues.push(termLike, termLike, termLike, termLike);
                }
            }
        }

        if (conditions.length > 0) {
            const whereClause = ' WHERE ' + conditions.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }

        query += ' ORDER BY c.fecha_solicitud DESC';

        const offset = (page - 1) * limit;
        query += ` LIMIT ? OFFSET ?`;
        values.push(limit, offset);

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
            console.error('Error al recuperar cotizaciones:', error.message);
            throw new Error('No se pudieron recuperar las cotizaciones.');
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
                if (key === 'estado' && !['Pendiente de Anticipo', 'Anticipo Pagado - Agendado', 'Anticipo Pagado - En Cola', 'Rechazada', 'Completada', 'Cancelada'].includes(updateData[key])) {
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

    // =========================================================
    // NUEVOS MÉTODOS PARA EL DASHBOARD
    // =========================================================

    /**
     * Obtiene el número total de cotizaciones registradas.
     * @returns {Promise<number>} El número total de cotizaciones.
     */
    static async countAll() {
        const query = 'SELECT COUNT(*) AS total FROM cotizaciones;';
        try {
            const [rows] = await pool.query(query);
            return rows[0].total;
        } catch (error) {
            console.error('Error in CotizacionModel.countAll:', error.message);
            throw new Error(`Could not count all quotes: ${error.message}`);
        }
    }

    /**
     * Obtiene la suma de los totales estimados de cotizaciones por mes para un año dado.
     * Considera solo cotizaciones con estados que implican progreso o finalización.
     * @param {number} year - El año para el cual se desea obtener los datos.
     * @param {Array<string>} [estadosValidos] - Opcional. Un array de estados válidos para incluir en la suma.
     * @returns {Promise<Array<object>>} Un array de objetos con el formato { month: number, totalAmount: number }.
     */
    static async getAggregatedTotalByMonth(year, estadosValidos = ['Anticipo Pagado - Agendado', 'Anticipo Pagado - En Cola', 'Completada']) {
        let query = `
            SELECT
                MONTH(fecha_solicitud) AS month,
                SUM(total_estimado) AS totalAmount
            FROM
                cotizaciones
            WHERE
                YEAR(fecha_solicitud) = ?
        `;
        const values = [year];

        if (estadosValidos && estadosValidos.length > 0) {
            query += ` AND estado IN (${estadosValidos.map(() => '?').join(', ')})`;
            values.push(...estadosValidos);
        }

        query += `
            GROUP BY
                MONTH(fecha_solicitud)
            ORDER BY
                month;
        `;

        try {
            const [rows] = await pool.query(query, values);
            return rows;
        } catch (error) {
            console.error('Error in CotizacionModel.getAggregatedTotalByMonth:', error.message);
            throw new Error(`Could not get aggregated totals by month: ${error.message}`);
        }
    }
}

export default Cotizacion;
