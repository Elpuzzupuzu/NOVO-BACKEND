// Importa el pool de conexiones a la base de datos
import { pool } from '../config/db.js';
// Importa la librería uuid para generar IDs únicos (UUIDs)
import { v4 as uuidv4 } from 'uuid';

// Helper function to format date for MySQL
const formatDateTimeForMySQL = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    // Check for invalid date
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format provided: ${dateString}`);
    }
    // Format to YYYY-MM-DD HH:MM:SS
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

class Trabajo {
    /**
     * Crea un nuevo trabajo en la base de datos.
     * @param {object} trabajoData - Objeto con los datos del nuevo trabajo.
     * @param {string} trabajoData.cotizacion_id - ID de la cotización asociada. (Único).
     * @param {string} [trabajoData.empleado_id] - ID del empleado responsable (opcional).
     * @param {string} [trabajoData.fecha_inicio_estimada] - Fecha estimada de inicio (formato ISO string).
     * @param {string} [trabajoData.fecha_inicio_real] - Fecha real de inicio (formato ISO string).
     * @param {string} [trabajoData.fecha_fin_estimada] - Fecha estimada de fin (formato ISO string).
     * @param {string} [trabajoData.fecha_fin_real] - Fecha real de fin (formato ISO string).
     * @param {object} [trabajoData.materiales_usados] - Objeto JSON de materiales usados (se convertirá a string).
     * @param {string} [trabajoData.estado='Pendiente'] - Estado actual del trabajo.
     * @param {number} [trabajoData.horas_hombre_estimadas] - Horas hombre estimadas.
     * @param {number} [trabajoData.costo_mano_obra] - Costo de mano de obra.
     * @param {string} [trabajoData.notas] - Notas adicionales.
     * @returns {Promise<object>} El objeto del trabajo creado.
     * @throws {Error} Si la cotizacion_id ya está en uso por otro trabajo o error de base de datos.
     */
    static async create(trabajoData) {
        const id_trabajo = uuidv4();
        const {
            cotizacion_id,
            empleado_id = null,
            materiales_usados = null, // Se espera un objeto, se convertirá a string
            estado = 'Pendiente',
            horas_hombre_estimadas = null,
            costo_mano_obra = null,
            notas = null
        } = trabajoData;

        // Formatear las fechas para MySQL
        const fecha_inicio_estimada_mysql = formatDateTimeForMySQL(trabajoData.fecha_inicio_estimada);
        const fecha_inicio_real_mysql = formatDateTimeForMySQL(trabajoData.fecha_inicio_real);
        const fecha_fin_estimada_mysql = formatDateTimeForMySQL(trabajoData.fecha_fin_estimada);
        const fecha_fin_real_mysql = formatDateTimeForMySQL(trabajoData.fecha_fin_real);

        // Convertir el objeto materiales_usados a string JSON si existe
        const materialesUsadosString = materiales_usados ? JSON.stringify(materiales_usados) : null;

        const query = `
            INSERT INTO trabajos (
                id_trabajo, cotizacion_id, empleado_id, fecha_inicio_estimada, fecha_inicio_real,
                fecha_fin_estimada, fecha_fin_real, materiales_usados, estado,
                horas_hombre_estimadas, costo_mano_obra, notas
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            id_trabajo, cotizacion_id, empleado_id, fecha_inicio_estimada_mysql, fecha_inicio_real_mysql,
            fecha_fin_estimada_mysql, fecha_fin_real_mysql, materialesUsadosString, estado,
            horas_hombre_estimadas, costo_mano_obra, notas
        ];

        try {
            await pool.query(query, values);
            return {
                id_trabajo,
                ...trabajoData,
                materiales_usados: materiales_usados,
                fecha_inicio_estimada: trabajoData.fecha_inicio_estimada,
                fecha_inicio_real: trabajoData.fecha_inicio_real,
                fecha_fin_estimada: trabajoData.fecha_fin_estimada,
                fecha_fin_real: trabajoData.fecha_fin_real
            };
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY' && error.message.includes('for key \'cotizacion_id\'')) {
                throw new Error('Ya existe un trabajo asociado a esta cotización.');
            }
            console.error('Error al crear trabajo:', error.message);
            throw new Error(`No se pudo crear el trabajo: ${error.message}`);
        }
    }

    /**
     * Obtiene un trabajo por su ID.
     * @param {string} id_trabajo - El ID del trabajo a buscar.
     * @returns {Promise<object|null>} El objeto del trabajo si se encuentra, o null si no.
     */
    static async findById(id_trabajo) {
        const query = `
            SELECT 
                t.*,
                cl.nombre AS cliente_nombre,
                cl.apellido AS cliente_apellido,
                e.nombre AS empleado_nombre,
                e.apellido AS empleado_apellido
            FROM 
                trabajos t
            LEFT JOIN 
                cotizaciones co ON t.cotizacion_id = co.id_cotizacion
            LEFT JOIN
                clientes cl ON co.cliente_id = cl.id_cliente
            LEFT JOIN
                empleados e ON t.empleado_id = e.id_empleado
            WHERE t.id_trabajo = ?
        `;
        try {
            const [rows] = await pool.query(query, [id_trabajo]);
            if (rows[0]) {
                if (rows[0].materiales_usados) {
                    rows[0].materiales_usados = JSON.parse(rows[0].materiales_usados);
                }
                if (rows[0].fecha_inicio_estimada) rows[0].fecha_inicio_estimada = rows[0].fecha_inicio_estimada.toISOString();
                if (rows[0].fecha_inicio_real) rows[0].fecha_inicio_real = rows[0].fecha_inicio_real.toISOString();
                if (rows[0].fecha_fin_estimada) rows[0].fecha_fin_estimada = rows[0].fecha_fin_estimada.toISOString();
                if (rows[0].fecha_fin_real) rows[0].fecha_fin_real = rows[0].fecha_fin_real.toISOString();
                if (rows[0].fecha_creacion) rows[0].fecha_creacion = rows[0].fecha_creacion.toISOString();
                if (rows[0].fecha_actualizacion) rows[0].fecha_actualizacion = rows[0].fecha_actualizacion.toISOString();
            }
            return rows[0] || null;
        } catch (error) {
            console.error('Error al buscar trabajo por ID:', error.message);
            throw new Error(`No se pudo encontrar el trabajo: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los trabajos, con opciones de filtrado y paginación.
     * @param {object} [filters={}] - Objeto con filtros opcionales (ej: { estado: 'En Proceso', empleado_id: 'abc', searchTerm: 'algo' }).
     * @param {number} page - Número de página actual (por defecto 1).
     * @param {number} limit - Número de resultados por página (por defecto 10).
     * @returns {Promise<object>} Un objeto con los datos de los trabajos y la información de paginación.
     */
    static async findAll(filters = {}, page = 1, limit = 10) {
        let query = `
            SELECT
                t.*,
                cl.nombre AS cliente_nombre,
                cl.apellido AS cliente_apellido,
                e.nombre AS empleado_nombre,
                e.apellido AS empleado_apellido
            FROM
                trabajos t
            LEFT JOIN
                cotizaciones co ON t.cotizacion_id = co.id_cotizacion
            LEFT JOIN
                clientes cl ON co.cliente_id = cl.id_cliente
            LEFT JOIN
                empleados e ON t.empleado_id = e.id_empleado
        `;
        let countQuery = `
            SELECT COUNT(t.id_trabajo) as total 
            FROM trabajos t
            LEFT JOIN cotizaciones co ON t.cotizacion_id = co.id_cotizacion
            LEFT JOIN clientes cl ON co.cliente_id = cl.id_cliente
            LEFT JOIN empleados e ON t.empleado_id = e.id_empleado
        `;

        const conditions = [];
        const values = [];
        const countValues = [];

        if (filters.estado) {
            conditions.push('t.estado = ?');
            values.push(filters.estado);
            countValues.push(filters.estado);
        }
        if (filters.empleado_id) {
            conditions.push('t.empleado_id = ?');
            values.push(filters.empleado_id);
            countValues.push(filters.empleado_id);
        }
        if (filters.cotizacion_id) {
            conditions.push('t.cotizacion_id = ?');
            values.push(filters.cotizacion_id);
            countValues.push(filters.cotizacion_id);
        }

        if (filters.searchTerm) {
            const cleanedSearchTerm = filters.searchTerm.trim();
            const searchTermsArray = cleanedSearchTerm.split(/\s+/).filter(s => s.length > 0);

            if (searchTermsArray.length > 0) {
                const searchConditions = [];
                const searchValues = [];

                searchTermsArray.forEach(term => {
                    const termLike = `%${term}%`;
                    searchConditions.push(`
                        (
                            cl.nombre LIKE ? OR cl.apellido LIKE ? OR
                            e.nombre LIKE ? OR e.apellido LIKE ? OR
                            t.id_trabajo LIKE ? OR
                            t.cotizacion_id LIKE ? OR
                            t.empleado_id LIKE ? OR
                            co.cliente_id LIKE ? 
                        )
                    `);
                    searchValues.push(termLike, termLike, termLike, termLike, termLike, termLike, termLike, termLike);
                });
                conditions.push(`(${searchConditions.join(' AND ')})`);
                values.push(...searchValues);
                countValues.push(...searchValues);
            }
        }

        if (conditions.length > 0) {
            const whereClause = ' WHERE ' + conditions.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }

        query += ' ORDER BY t.fecha_creacion DESC';

        const offset = (page - 1) * limit;
        query += ` LIMIT ? OFFSET ?`;
        values.push(limit, offset);

        try {
            const [rows] = await pool.query(query, values);
            const [countResult] = await pool.query(countQuery, countValues);

            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            const processedRows = rows.map(row => {
                if (row.materiales_usados) {
                    try {
                        row.materiales_usados = JSON.parse(row.materiales_usados);
                    } catch (e) {
                        console.error('Error parsing materiales_usados JSON for row:', row.id_trabajo, e);
                        row.materiales_usados = null;
                    }
                }
                if (row.fecha_inicio_estimada) row.fecha_inicio_estimada = row.fecha_inicio_estimada.toISOString();
                if (row.fecha_inicio_real) row.fecha_inicio_real = row.fecha_inicio_real.toISOString();
                if (row.fecha_fin_estimada) row.fecha_fin_estimada = row.fecha_fin_estimada.toISOString();
                if (row.fecha_fin_real) row.fecha_fin_real = row.fecha_fin_real.toISOString();
                if (row.fecha_creacion) row.fecha_creacion = row.fecha_creacion.toISOString();
                if (row.fecha_actualizacion) row.fecha_actualizacion = row.fecha_actualizacion.toISOString();
                return row;
            });

            return {
                data: processedRows,
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
            console.error('Error al obtener trabajos:', error.message);
            throw new Error('No se pudieron obtener los trabajos.');
        }
    }

    /**
     * Actualiza los datos de un trabajo existente.
     * @param {string} id_trabajo - El ID del trabajo a actualizar.
     * @param {object} updateData - Objeto con los datos a actualizar.
     * @returns {Promise<boolean>} True si la actualización fue exitosa, false si no se encontró el trabajo.
     */
    static async update(id_trabajo, updateData) {
        const fields = [];
        const values = [];

        if (updateData.materiales_usados !== undefined && typeof updateData.materiales_usados === 'object' && updateData.materiales_usados !== null) {
            updateData.materiales_usados = JSON.stringify(updateData.materiales_usados);
        } else if (updateData.materiales_usados === null) {
            updateData.materiales_usados = null;
        }

        if (updateData.fecha_inicio_estimada !== undefined) updateData.fecha_inicio_estimada = formatDateTimeForMySQL(updateData.fecha_inicio_estimada);
        if (updateData.fecha_inicio_real !== undefined) updateData.fecha_inicio_real = formatDateTimeForMySQL(updateData.fecha_inicio_real);
        if (updateData.fecha_fin_estimada !== undefined) updateData.fecha_fin_estimada = formatDateTimeForMySQL(updateData.fecha_fin_estimada);
        if (updateData.fecha_fin_real !== undefined) updateData.fecha_fin_real = formatDateTimeForMySQL(updateData.fecha_fin_real);

        for (const key in updateData) {
            if (updateData.hasOwnProperty(key) && key !== 'id_trabajo') {
                if (key === 'estado' && !['Pendiente', 'En Proceso', 'En Medición', 'Listo para Entrega', 'Entregado', 'Cancelado', 'Completada'].includes(updateData[key])) {
                    throw new Error(`El estado '${updateData[key]}' no es válido.`);
                }
                fields.push(`${key} = ?`);
                values.push(updateData[key]);
            }
        }

        if (fields.length === 0) {
            return false;
        }

        values.push(id_trabajo);

        const query = `UPDATE trabajos SET ${fields.join(', ')} WHERE id_trabajo = ?`;
        try {
            const [result] = await pool.query(query, values);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error al actualizar trabajo:', error.message);
            throw new Error(`No se pudo actualizar el trabajo: ${error.message}`);
        }
    }

    /**
     * Elimina un trabajo de la base de datos.
     * @param {string} id_trabajo - El ID del trabajo a eliminar.
     * @returns {Promise<boolean>} True si la eliminación fue exitosa, false si no se encontró el trabajo.
     */
    static async delete(id_trabajo) {
        const query = 'DELETE FROM trabajos WHERE id_trabajo = ?';
        try {
            const [result] = await pool.query(query, [id_trabajo]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error al eliminar trabajo:', error.message);
            throw new Error(`No se pudo eliminar el trabajo: ${error.message}`);
        }
    }

    /**
     * Cuenta el número de trabajos que se encuentran en uno o varios estados específicos.
     * @param {Array<string>} estados - Un array de estados por los cuales filtrar los trabajos.
     * @returns {Promise<number>} El número total de trabajos en los estados especificados.
     */
    static async countByEstados(estados) {
        if (!estados || estados.length === 0) {
            throw new Error('Se requiere al menos un estado para contar trabajos.');
        }

        const placeholders = estados.map(() => '?').join(',');
        const query = `SELECT COUNT(*) AS total FROM trabajos WHERE estado IN (${placeholders});`;

        try {
            const [rows] = await pool.query(query, estados);
            return rows[0].total;
        } catch (error) {
            console.error('Error in TrabajoModel.countByEstados:', error.message);
            throw new Error(`Could not count jobs by status: ${error.message}`);
        }
    }

    // =========================================================
    // NUEVO MÉTODO PARA EL DASHBOARD: CONTEO DE TRABAJOS COMPLETADOS
    // =========================================================

    /**
     * Cuenta el número total de trabajos que se han completado o entregado.
     * @returns {Promise<number>} El número total de trabajos completados.
     */
    static async countCompleted() {
        // Los estados que consideramos "completados" o "finalizados"
        const completedStates = ['Entregado', 'Completada']; 
        
        // Reutilizamos el método countByEstados
        return await this.countByEstados(completedStates);
    }
}

export default Trabajo;
