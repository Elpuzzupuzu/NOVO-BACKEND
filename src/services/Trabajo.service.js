// src/services/Trabajo.service.js

// Importa la clase 'Trabajo' directamente, ya que es la que exporta tu modelo MySQL.
import Trabajo from '../models/Trabajo.model.js'; // <-- ¡CAMBIO CLAVE AQUÍ!
import CotizacionModel from '../models/Cotizacion.model.js'; // Ya la tienes
import EmpleadoModel from '../models/Empleado.model.js'; // Ya la tienes

class TrabajoService {
    async createTrabajo(trabajoData) {
        const cotizacionExists = await CotizacionModel.findById(trabajoData.cotizacion_id);
        if (!cotizacionExists) {
            throw new Error('Cotización no encontrada. No se puede crear el trabajo.');
        }

        if (trabajoData.empleado_id) {
            const empleadoExists = await EmpleadoModel.findById(trabajoData.empleado_id);
            if (!empleadoExists) {
                throw new Error('Empleado responsable no encontrado. No se puede crear el trabajo.');
            }
        }

        const newTrabajo = await Trabajo.create(trabajoData); // <-- Usa 'Trabajo' directamente
        return newTrabajo;
    }

    async getAllTrabajos(filters, page, limit) {
        console.log('--- ENTRA EN TrabajoService.getAllTrabajos ---');
        console.log('Filtros recibidos en el servicio:', filters);
        console.log('Paginación recibida en el servicio:', { page, limit });

        try {
            // Llama al método estático 'findAll' de la clase 'Trabajo'
            const result = await Trabajo.findAll(filters, page, limit); // <-- Usa 'Trabajo' directamente
            
            console.log('Resultado del Trabajo.findAll (a devolver al controlador):', JSON.stringify(result, null, 2));
            console.log('--- SALE DE TrabajoService.getAllTrabajos ---');
            return result;

        } catch (error) {
            console.error('--- ERROR en TrabajoService.getAllTrabajos (al obtener de DB) ---:', error);
            throw error;
        }
    }

    async getTrabajoById(id_trabajo) {
        const trabajo = await Trabajo.findById(id_trabajo); // <-- Usa 'Trabajo' directamente
        if (!trabajo) {
            throw new Error('Trabajo no encontrado.');
        }
        return trabajo;
    }

    async updateTrabajo(id_trabajo, updateData) {
        const existingTrabajo = await Trabajo.findById(id_trabajo); // <-- Usa 'Trabajo' directamente
        if (!existingTrabajo) {
            throw new Error('Trabajo no encontrado para actualizar.');
        }

        if (updateData.empleado_id && updateData.empleado_id !== existingTrabajo.empleado_id) {
            const newEmpleadoExists = await EmpleadoModel.findById(updateData.empleado_id);
            if (!newEmpleadoExists) {
                throw new Error('El nuevo empleado responsable no existe.');
            }
        }

        const success = await Trabajo.update(id_trabajo, updateData); // <-- Usa 'Trabajo' directamente
        if (!success) {
            throw new Error('No se pudo actualizar el trabajo.');
        }

        if (updateData.estado && (updateData.estado === 'Entregado' || updateData.estado === 'Completada')) {
            if (existingTrabajo.cotizacion_id) {
                const quoteUpdateSuccess = await CotizacionModel.update(
                    existingTrabajo.cotizacion_id,
                    { estado: 'Completada' }
                );
                if (!quoteUpdateSuccess) {
                    console.warn(`Advertencia: No se pudo actualizar el estado de la cotización ${existingTrabajo.cotizacion_id} al completar el trabajo ${id_trabajo}.`);
                }
            } else {
                console.warn(`Advertencia: Trabajo ${id_trabajo} completado/entregado, pero no tiene una cotización asociada para actualizar.`);
            }
        }

        const updatedTrabajo = await Trabajo.findById(id_trabajo); // <-- Usa 'Trabajo' directamente
        return updatedTrabajo;
    }

    async deleteTrabajo(id_trabajo) {
        const success = await Trabajo.delete(id_trabajo); // <-- Usa 'Trabajo' directamente
        if (!success) {
            throw new Error('Trabajo no encontrado para eliminar.');
        }
        return true;
    }
}

export default new TrabajoService();