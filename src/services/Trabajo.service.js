// src/services/Trabajo.service.js

// Importa el modelo Trabajo para interactuar con la base de datos
import TrabajoModel from '../models/Trabajo.model.js';
// Importa otros modelos para validación de claves foráneas y actualización
import CotizacionModel from '../models/Cotizacion.model.js'; // Necesitamos este modelo
import EmpleadoModel from '../models/Empleado.model.js';

class TrabajoService {
    /**
     * Crea un nuevo trabajo.
     * Incluye lógica de negocio para validar la existencia de la cotización y el empleado.
     * @param {object} trabajoData - Datos del trabajo a crear.
     * @returns {Promise<object>} El objeto del trabajo creado.
     * @throws {Error} Si la cotización o el empleado no existen, o si ya hay un trabajo para esa cotización.
     */
    async createTrabajo(trabajoData) {
        // Validación de existencia de cotización
        const cotizacionExists = await CotizacionModel.findById(trabajoData.cotizacion_id);
        if (!cotizacionExists) {
            throw new Error('Cotización no encontrada. No se puede crear el trabajo.');
        }

        // Validación de existencia de empleado (si se proporciona)
        if (trabajoData.empleado_id) {
            const empleadoExists = await EmpleadoModel.findById(trabajoData.empleado_id);
            if (!empleadoExists) {
                throw new Error('Empleado responsable no encontrado. No se puede crear el trabajo.');
            }
        }

        const newTrabajo = await TrabajoModel.create(trabajoData);
        return newTrabajo;
    }

    /**
     * Obtiene todos los trabajos, con filtros opcionales.
     * @param {object} filters - Objeto con filtros para la búsqueda.
     * @returns {Promise<Array<object>>} Un array de trabajos.
     */
    async getAllTrabajos(filters) {
        const trabajos = await TrabajoModel.findAll(filters);
        return trabajos;
    }

    /**
     * Obtiene un trabajo por su ID.
     * @param {string} id_trabajo - ID del trabajo.
     * @returns {Promise<object|null>} El trabajo encontrado o null.
     * @throws {Error} Si el trabajo no es encontrado.
     */
    async getTrabajoById(id_trabajo) {
        const trabajo = await TrabajoModel.findById(id_trabajo);
        if (!trabajo) {
            throw new Error('Trabajo no encontrado.');
        }
        return trabajo;
    }

    /**
     * Actualiza los datos de un trabajo.
     * Incluye lógica para actualizar automáticamente el estado de la cotización asociada
     * si el trabajo alcanza un estado final (Completado/Entregado).
     * @param {string} id_trabajo - ID del trabajo a actualizar.
     * @param {object} updateData - Datos a actualizar.
     * @returns {Promise<object>} El trabajo actualizado.
     * @throws {Error} Si el trabajo no existe, datos inválidos o error al actualizar.
     */
    async updateTrabajo(id_trabajo, updateData) {
        const existingTrabajo = await TrabajoModel.findById(id_trabajo);
        if (!existingTrabajo) {
            throw new Error('Trabajo no encontrado para actualizar.');
        }

        // Lógica de negocio: Validar existencia de nuevo empleado_id si se cambia
        if (updateData.empleado_id && updateData.empleado_id !== existingTrabajo.empleado_id) {
            const newEmpleadoExists = await EmpleadoModel.findById(updateData.empleado_id);
            if (!newEmpleadoExists) {
                throw new Error('El nuevo empleado responsable no existe.');
            }
        }

        const success = await TrabajoModel.update(id_trabajo, updateData);
        if (!success) {
            throw new Error('No se pudo actualizar el trabajo.');
        }

        // --- Lógica de Actualización Automática de Cotización ---
        // Si el estado del trabajo se actualiza a 'Entregado' o 'Completado'
        if (updateData.estado && (updateData.estado === 'Entregado' || updateData.estado === 'Completada')) {
            if (existingTrabajo.cotizacion_id) {
                // Actualizar el estado de la cotización asociada a 'Completada'
                const quoteUpdateSuccess = await CotizacionModel.update(
                    existingTrabajo.cotizacion_id,
                    { estado: 'Completada' }
                );
                if (!quoteUpdateSuccess) {
                    console.warn(`Advertencia: No se pudo actualizar el estado de la cotización ${existingTrabajo.cotizacion_id} al completar el trabajo ${id_trabajo}.`);
                    // Podrías lanzar un error aquí si esto es crítico, o solo registrar la advertencia.
                }
            } else {
                console.warn(`Advertencia: Trabajo ${id_trabajo} completado/entregado, pero no tiene una cotización asociada para actualizar.`);
            }
        }
        // --- Fin Lógica de Actualización Automática ---

        const updatedTrabajo = await TrabajoModel.findById(id_trabajo);
        return updatedTrabajo;
    }

    /**
     * Elimina un trabajo.
     * @param {string} id_trabajo - ID del trabajo a eliminar.
     * @returns {Promise<boolean>} True si se eliminó, false si no se encontró.
     * @throws {Error} Si el trabajo no existe.
     */
    async deleteTrabajo(id_trabajo) {
        const success = await TrabajoModel.delete(id_trabajo);
        if (!success) {
            throw new Error('Trabajo no encontrado para eliminar.');
        }
        return true;
    }
}

// Exporta una instancia de la clase para que sea un singleton
export default new TrabajoService();
