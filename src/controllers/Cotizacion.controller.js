// src/controllers/Cotizacion.controller.js

import CotizacionService from '../services/Cotizacion.service.js';

class CotizacionController {
    /**
     * Handles the creation of a new quote.
     * @param {object} req - Request object (contains req.body).
     * @param {object} res - Response object.
     */
    async createCotizacion(req, res) {
        try {
            const cotizacionData = req.body;

            // Basic input validation
            if (!cotizacionData.cliente_id || !cotizacionData.tipo_producto || cotizacionData.total_estimado === undefined) {
                return res.status(400).json({ message: 'Client ID, product type, and estimated total are required fields.' });
            }
            if (isNaN(cotizacionData.total_estimado) || cotizacionData.total_estimado <= 0) {
                return res.status(400).json({ message: 'Estimated total must be a positive number.' });
            }

            const newCotizacion = await CotizacionService.createCotizacion(cotizacionData);
            res.status(201).json({ message: 'Cotizacion created successfully.', cotizacion: newCotizacion });
        } catch (error) {
            console.error('Error in CotizacionController.createCotizacion:', error);
            if (error.message.includes('Client not found') || error.message.includes('Base material not found')) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('required')) {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Internal server error while creating quote.', error: error.message });
        }
    }

    /**
     * Handles retrieving all quotes.
     * Allows filtering by client_id or estado.
     * @param {object} req - Request object (contains req.query for filters).
     * @param {object} res - Response object.
     */
    async getAllCotizaciones(req, res) {
        try {
            const filters = req.query;
            
            // Extraer parámetros de paginación y convertirlos a números
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            // Eliminar 'page' y 'limit' de los filtros para no pasarlos como condiciones SQL
            delete filters.page;
            delete filters.limit;

            const { data, pagination } = await CotizacionService.getAllCotizaciones(filters, page, limit);
            
            res.status(200).json({
                data,
                pagination
            });
        } catch (error) {
            console.error('Error en CotizacionController.getAllCotizaciones:', error);
            res.status(500).json({ message: 'Internal server error while retrieving quotes.', error: error.message });
        }
    }

    /**
     * Handles retrieving a quote by its ID.
     * @param {object} req - Request object (contains req.params.id_cotizacion).
     * @param {object} res - Response object.
     */
    async getCotizacionById(req, res) {
        try {
            const { id_cotizacion } = req.params;
            const cotizacion = await CotizacionService.getCotizacionById(id_cotizacion);
            res.status(200).json(cotizacion);
        } catch (error) {
            if (error.message.includes('Quote not found')) {
                return res.status(404).json({ message: error.message });
            }
            console.error('Error in CotizacionController.getCotizacionById:', error);
            res.status(500).json({ message: 'Internal server error while retrieving quote.', error: error.message });
        }
    }

    /**
     * Handles updating a quote.
     * @param {object} req - Request object (contains req.params.id_cotizacion and req.body).
     * @param {object} res - Response object.
     */
    async updateCotizacion(req, res) {
        try {
            const { id_cotizacion } = req.params;
            const updateData = req.body;

            if (updateData.id_cotizacion) {
                return res.status(400).json({ message: 'Cannot update the quote ID.' });
            }

            const updatedCotizacion = await CotizacionService.updateCotizacion(id_cotizacion, updateData);
            res.status(200).json({ message: 'Quote updated successfully.', cotizacion: updatedCotizacion });
        } catch (error) {
            if (error.message.includes('Quote not found')) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('valid') || error.message.includes('deposit')) {
                return res.status(400).json({ message: error.message });
            }
            console.error('Error in CotizacionController.updateCotizacion:', error);
            res.status(500).json({ message: 'Internal server error while updating quote.', error: error.message });
        }
    }

    /**
     * Handles deleting a quote.
     * @param {object} req - Request object (contains req.params.id_cotizacion).
     * @param {object} res - Response object.
     */
    async deleteCotizacion(req, res) {
        try {
            const { id_cotizacion } = req.params;
            await CotizacionService.deleteCotizacion(id_cotizacion);
            res.status(200).json({ message: 'Quote deleted successfully.' });
        } catch (error) {
            if (error.message.includes('Quote not found')) {
                return res.status(404).json({ message: error.message });
            }
            console.error('Error in CotizacionController.deleteCotizacion:', error);
            res.status(500).json({ message: 'Internal server error while deleting quote.', error: error.message });
        }
    }

    // =========================================================
    // NUEVOS MÉTODOS PARA EL DASHBOARD
    // =========================================================

    /**
     * Obtiene el total de cotizaciones para el dashboard.
     * GET /NOVO/cotizaciones/total
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    async getTotalCotizacionesController(req, res) {
        try {
            const total = await CotizacionService.getTotalCotizaciones();
            res.status(200).json({ totalCotizaciones: total });
        } catch (error) {
            console.error('Error en CotizacionController.getTotalCotizacionesController:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener el total de cotizaciones.', error: error.message });
        }
    }

    /**
     * Obtiene los ingresos estimados por mes para un año dado.
     * GET /NOVO/cotizaciones/ingresos-por-mes?year=YYYY&estados=estado1,estado2
     * @param {object} req - Objeto de solicitud (contiene req.query.year y opcionalmente req.query.estados).
     * @param {object} res - Objeto de respuesta.
     */
    async getIngresosEstimadosPorMesController(req, res) {
        try {
            const { year, estados } = req.query;

            if (!year || isNaN(parseInt(year))) {
                return res.status(400).json({ message: 'El parámetro "year" es requerido y debe ser un número válido.' });
            }

            let estadosArray = [];
            if (estados) {
                estadosArray = estados.split(',').map(s => s.trim());
            }

            const data = await CotizacionService.getIngresosEstimadosPorMes(parseInt(year), estadosArray.length ? estadosArray : undefined);
            res.status(200).json({ data });
        } catch (error) {
            console.error('Error en CotizacionController.getIngresosEstimadosPorMesController:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener ingresos por mes.', error: error.message });
        }
    }
}

// Export an instance of the class as a singleton
export default new CotizacionController();
