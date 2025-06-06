// src/controllers/Cotizacion.controller.js

// Import the CotizacionService to access business logic
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
            if (error.message.includes('required')) { // For calculated fields error
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
            const filters = req.query; // Filters are passed as query parameters
            const cotizaciones = await CotizacionService.getAllCotizaciones(filters);
            res.status(200).json(cotizaciones);
        } catch (error) {
            console.error('Error in CotizacionController.getAllCotizaciones:', error);
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
            if (error.message.includes('valid') || error.message.includes('deposit')) { // For ENUM status or deposit validation
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
}

// Export an instance of the class as a singleton
export default new CotizacionController();
