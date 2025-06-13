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
        async getAllCotizaciones(filters, page, limit) {
        // Pasa los parámetros de paginación al modelo
        const { data, pagination } = await CotizacionModel.findAll(filters, page, limit);
        return { data, pagination };
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
    
    
    
    // backend/src/services/Cotizacion.service.js

// backend/src/services/Cotizacion.service.js

// backend/src/services/Cotizacion.service.js

async updateCotizacion(id_cotizacion, updateData) {
    const existingCotizacion = await CotizacionModel.findById(id_cotizacion);
    if (!existingCotizacion) {
        throw new Error('Quote not found for update.');
    }

    // --- IMPORTANTE: ELIMINAR fecha_actualizacion del payload del frontend si existe ---
    // Generalmente, fecha_actualizacion debe ser gestionada por el backend.
    if (updateData.fecha_actualizacion !== undefined) {
        delete updateData.fecha_actualizacion;
    }

    // --- Lógica de negocio para anticipo ---
    if (updateData.monto_anticipo_pagado !== undefined && updateData.monto_anticipo_pagado > existingCotizacion.monto_anticipo_pagado) {
        if (updateData.monto_anticipo_pagado > existingCotizacion.anticipo_requerido) {
            throw new Error('Paid deposit amount cannot exceed the required deposit.');
        }

        if (updateData.monto_anticipo_pagado >= existingCotizacion.anticipo_requerido && existingCotizacion.estado === 'Pendiente de Anticipo') {
            updateData.estado = 'Anticipo Pagado - Agendado';

            // Si no hay fecha de pago o no es válida, usa la fecha actual del servidor.
            if (!updateData.fecha_pago_anticipo || isNaN(new Date(updateData.fecha_pago_anticipo).getTime())) {
                updateData.fecha_pago_anticipo = new Date(); // <--- Pasa directamente el objeto Date
            } else {
                 const date = new Date(updateData.fecha_pago_anticipo);
                 if (!isNaN(date.getTime())) {
                    updateData.fecha_pago_anticipo = date; // <--- Pasa directamente el objeto Date
                 } else {
                    updateData.fecha_pago_anticipo = null;
                 }
            }
        }
    }

    // --- PRE-PROCESAMIENTO DE TODAS LAS FECHAS ANTES DE ENVIARLAS AL MODELO ---
    // Todas son TIMESTAMP, por lo que pasar objetos Date es lo mejor.
    const timestampFields = ['fecha_agendada', 'fecha_solicitud', 'fecha_pago_anticipo']; 
    
    timestampFields.forEach(field => {
        if (updateData[field] !== undefined) { 
            if (updateData[field] === null || updateData[field] === '') {
                updateData[field] = null; 
            } else {
                const date = new Date(updateData[field]); 
                if (!isNaN(date.getTime())) { 
                    updateData[field] = date; // <--- ¡Pasa el OBJETO Date directamente!
                } else {
                    updateData[field] = null; 
                }
            }
        }
    });

    // --- ESTABLECER fecha_actualizacion AQUÍ EN EL BACKEND ---
    // Esto asegura que siempre se actualice a la hora del servidor y en el formato correcto para TIMESTAMP.
    updateData.fecha_actualizacion = new Date(); // <--- Objeto Date para TIMESTAMP

    console.log('Datos finales a enviar al modelo:', updateData); 

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
