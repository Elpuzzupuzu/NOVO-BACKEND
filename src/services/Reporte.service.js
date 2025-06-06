// src/services/Report.service.js

// Importa el pool de conexiones a la base de datos
import { pool } from '../config/db.js';

class ReportService {
    /**
     * Obtiene un resumen de cotizaciones por estado.
     * @returns {Promise<Array<object>>} Un array con el conteo de cotizaciones por cada estado.
     */
    async getCotizacionesSummary() {
        const query = `
            SELECT
                estado,
                COUNT(id_cotizacion) AS count,
                SUM(total_estimado) AS total_estimated_sum
            FROM cotizaciones
            GROUP BY estado
            ORDER BY estado;
        `;
        try {
            const [rows] = await pool.query(query);
            return rows;
        } catch (error) {
            console.error('Error al obtener resumen de cotizaciones:', error.message);
            throw new Error('No se pudo obtener el resumen de cotizaciones.');
        }
    }

    /**
     * Obtiene un resumen de trabajos por estado.
     * @returns {Promise<Array<object>>} Un array con el conteo de trabajos por cada estado.
     */
    async getTrabajosSummary() {
        const query = `
            SELECT
                estado,
                COUNT(id_trabajo) AS count
            FROM trabajos
            GROUP BY estado
            ORDER BY estado;
        `;
        try {
            const [rows] = await pool.query(query);
            return rows;
        } catch (error) {
            console.error('Error al obtener resumen de trabajos:', error.message);
            throw new Error('No se pudo obtener el resumen de trabajos.');
        }
    }

    /**
     * Obtiene las peticiones de material con estado 'Pendiente de Compra'.
     * Incluye información básica del material.
     * @returns {Promise<Array<object>>} Un array de peticiones de material pendientes de compra.
     */
    async getMaterialesPendienteCompra() {
        const query = `
            SELECT
                pm.id_peticion_material,
                pm.cotizacion_id,
                pm.trabajo_id,
                pm.cantidad_requerida_metros,
                pm.notas,
                pm.fecha_solicitud,
                pm.gerente_notificado,
                pm.estado,
                m.nombre AS material_nombre,
                m.unidad_medida AS material_unidad_medida,
                m.costo_por_unidad AS material_costo_por_unidad
            FROM peticiones_material pm
            JOIN materiales m ON pm.material_codigo = m.id_material
            WHERE pm.estado = 'Pendiente de Compra'
            ORDER BY pm.fecha_solicitud ASC;
        `;
        try {
            const [rows] = await pool.query(query);
            return rows;
        } catch (error) {
            console.error('Error al obtener materiales pendientes de compra:', error.message);
            throw new Error('No se pudieron obtener los materiales pendientes de compra.');
        }
    }

    /**
     * Obtiene un resumen consolidado para el dashboard.
     * @returns {Promise<object>} Un objeto con diferentes resúmenes.
     */
    async getOverallDashboardSummary() {
        const [
            cotizacionesSummary,
            trabajosSummary,
            materialesPendienteCompra
        ] = await Promise.all([
            this.getCotizacionesSummary(),
            this.getTrabajosSummary(),
            this.getMaterialesPendienteCompra()
        ]);

        return {
            cotizaciones: cotizacionesSummary,
            trabajos: trabajosSummary,
            materiales_pendientes_compra: materialesPendienteCompra
        };
    }
}

// Exporta una instancia de la clase para que sea un singleton
export default new ReportService();
