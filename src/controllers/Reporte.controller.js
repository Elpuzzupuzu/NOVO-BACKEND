// src/controllers/Report.controller.js

// Importa el servicio de reportes
import ReportService from '../services/Reporte.service.js';

class ReportController {
    /**
     * Maneja la obtención del resumen de cotizaciones.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    async getCotizacionesSummary(req, res) {
        try {
            const summary = await ReportService.getCotizacionesSummary();
            res.status(200).json(summary);
        } catch (error) {
            console.error('Error en ReportController.getCotizacionesSummary:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener resumen de cotizaciones.', error: error.message });
        }
    }

    /**
     * Maneja la obtención del resumen de trabajos.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    async getTrabajosSummary(req, res) {
        try {
            const summary = await ReportService.getTrabajosSummary();
            res.status(200).json(summary);
        } catch (error) {
            console.error('Error en ReportController.getTrabajosSummary:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener resumen de trabajos.', error: error.message });
        }
    }

    /**
     * Maneja la obtención de materiales pendientes de compra.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    async getMaterialesPendienteCompra(req, res) {
        try {
            const materials = await ReportService.getMaterialesPendienteCompra();
            res.status(200).json(materials);
        } catch (error) {
            console.error('Error en ReportController.getMaterialesPendienteCompra:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener materiales pendientes de compra.', error: error.message });
        }
    }

    /**
     * Maneja la obtención del resumen consolidado del dashboard.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    async getOverallDashboardSummary(req, res) {
        try {
            const summary = await ReportService.getOverallDashboardSummary();
            res.status(200).json(summary);
        } catch (error) {
            console.error('Error en ReportController.getOverallDashboardSummary:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener resumen general del dashboard.', error: error.message });
        }
    }
}

// Exporta una instancia de la clase para que sea un singleton
export default new ReportController();
