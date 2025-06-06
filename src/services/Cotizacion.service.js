// src/services/Cotizacion.service.js

// Import the Cotizacion model to interact with the database
import CotizacionModel from '../models/Cotizacion.model.js';
// Import other models for validation
import ClienteModel from '../models/Cliente.model.js';
import MaterialModel from '../models/Material.model.js';

class CotizacionService {
    /**
     * Creates a new quote. Includes business logic for client and material validation.
     * @param {object} cotizacionData - Quote data to create.
     * @returns {Promise<object>} The created quote object.
     * @throws {Error} If required data is missing, client/material not found, or other error.
     */
    async createCotizacion(cotizacionData) {
        // Business logic: Validate if client exists
        const clienteExists = await ClienteModel.findById(cotizacionData.cliente_id);
        if (!clienteExists) {
            throw new Error('Client not found. Cannot create quote.');
        }

        // Business logic: Validate if base material exists (if provided)
        if (cotizacionData.material_base_id) {
            const materialExists = await MaterialModel.findById(cotizacionData.material_base_id);
            if (!materialExists) {
                throw new Error('Base material not found. Cannot create quote.');
            }
        }

        // Calculate anticipo_requerido if not provided (50% of total_estimado)
        if (cotizacionData.total_estimado && !cotizacionData.anticipo_requerido) {
            cotizacionData.anticipo_requerido = cotizacionData.total_estimado * 0.50;
        } else if (!cotizacionData.total_estimado || cotizacionData.anticipo_requerido === undefined) {
             throw new Error('total_estimado and anticipo_requerido (or total_estimado to calculate it) are required.');
        }

        const newCotizacion = await CotizacionModel.create(cotizacionData);
        return newCotizacion;
    }

    /**
     * Retrieves all quotes, with optional filters.
     * @param {object} filters - Object with filters for the search.
     * @returns {Promise<Array<object>>} An array of quote objects.
     */
    async getAllCotizaciones(filters) {
        const cotizaciones = await CotizacionModel.findAll(filters);
        return cotizaciones;
    }

    /**
     * Retrieves a quote by its ID.
     * @param {string} id_cotizacion - ID of the quote.
     * @returns {Promise<object|null>} The found quote or null.
     * @throws {Error} If the quote is not found.
     */
    async getCotizacionById(id_cotizacion) {
        const cotizacion = await CotizacionModel.findById(id_cotizacion);
        if (!cotizacion) {
            throw new Error('Quote not found.');
        }
        return cotizacion;
    }

    /**
     * Updates the data of an existing quote.
     * Includes logic to handle deposit payment.
     * @param {string} id_cotizacion - ID of the quote to update.
     * @param {object} updateData - Data to update.
     * @returns {Promise<object>} The updated quote object.
     * @throws {Error} If the quote does not exist, invalid data, or error during update.
     */
    async updateCotizacion(id_cotizacion, updateData) {
        const existingCotizacion = await CotizacionModel.findById(id_cotizacion);
        if (!existingCotizacion) {
            throw new Error('Quote not found for update.');
        }

        // Business logic: If deposit is being paid
        if (updateData.monto_anticipo_pagado !== undefined && updateData.monto_anticipo_pagado > existingCotizacion.monto_anticipo_pagado) {
            // Ensure the paid amount does not exceed the required deposit
            if (updateData.monto_anticipo_pagado > existingCotizacion.anticipo_requerido) {
                throw new Error('Paid deposit amount cannot exceed the required deposit.');
            }
            // Update status if full deposit is paid
            if (updateData.monto_anticipo_pagado >= existingCotizacion.anticipo_requerido && existingCotizacion.estado === 'Pendiente de Anticipo') {
                updateData.estado = 'Anticipo Pagado - Agendado'; // Or 'En Cola' based on your logic
                updateData.fecha_pago_anticipo = new Date().toISOString(); // Set payment date
                // Optionally set fecha_agendada here if it means "ready to be scheduled"
            }
        }

        const success = await CotizacionModel.update(id_cotizacion, updateData);
        if (!success) {
            throw new Error('Could not update quote.');
        }

        const updatedCotizacion = await CotizacionModel.findById(id_cotizacion);
        return updatedCotizacion;
    }

    /**
     * Deletes a quote.
     * @param {string} id_cotizacion - ID of the quote to delete.
     * @returns {Promise<boolean>} True if deleted, false if not found.
     * @throws {Error} If the quote does not exist.
     */
    async deleteCotizacion(id_cotizacion) {
        const success = await CotizacionModel.delete(id_cotizacion);
        if (!success) {
            throw new Error('Quote not found for deletion.');
        }
        return true;
    }
}

// Export an instance of the class as a singleton
export default new CotizacionService();
