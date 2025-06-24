// src/services/Trabajo.service.js

// Importa la clase 'Trabajo' directamente, ya que es la que exporta tu modelo MySQL.
import Trabajo from '../models/Trabajo.model.js';
import CotizacionModel from '../models/Cotizacion.model.js'; // Ya la tienes
import EmpleadoModel from '../models/Empleado.model.js'; // Ya la tienes
import CotizacionService from './Cotizacion.service.js'; // Importa el servicio de cotizaciones

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

        const newTrabajo = await Trabajo.create(trabajoData);
        return newTrabajo;
    }

    async getAllTrabajos(filters, page, limit) {
        try {
            const result = await Trabajo.findAll(filters, page, limit);
            return result;
        } catch (error) {
            console.error('Error en TrabajoService.getAllTrabajos (al obtener de DB):', error);
            throw error;
        }
    }

    async getTrabajoById(id_trabajo) {
        const trabajo = await Trabajo.findById(id_trabajo);
        if (!trabajo) {
            throw new Error('Trabajo no encontrado.');
        }
        return trabajo;
    }

    async updateTrabajo(id_trabajo, updateData) {
        const existingTrabajo = await Trabajo.findById(id_trabajo);
        if (!existingTrabajo) {
            throw new Error('Trabajo no encontrado para actualizar.');
        }

        if (updateData.fecha_actualizacion !== undefined) {
            delete updateData.fecha_actualizacion;
        }

        if (updateData.empleado_id && updateData.empleado_id !== existingTrabajo.empleado_id) {
            const newEmpleadoExists = await EmpleadoModel.findById(updateData.empleado_id);
            if (!newEmpleadoExists) {
                throw new Error('El nuevo empleado responsable no existe.');
            }
        }

        const trabajoTimestampFields = [
            'fecha_inicio_estimada',
            'fecha_fin_estimada',
            'fecha_inicio_real',
            'fecha_fin_real'
        ];

        trabajoTimestampFields.forEach(field => {
            if (updateData[field] !== undefined) {
                if (updateData[field] === null || updateData[field] === '') {
                    updateData[field] = null;
                } else {
                    const date = new Date(updateData[field]);
                    if (!isNaN(date.getTime())) {
                        updateData[field] = date;
                    } else {
                        console.warn(`Advertencia: El campo de fecha '${field}' contenía un valor no válido: '${updateData[field]}'. Se establecerá a null.`);
                        updateData[field] = null;
                    }
                }
            }
        });

        updateData.fecha_actualizacion = new Date();

        const success = await Trabajo.update(id_trabajo, updateData);
        if (!success) {
            throw new Error('No se pudo actualizar el trabajo.');
        }

        // Lógica para actualizar el estado de la cotización asociada si el trabajo se completa/entrega
        // Asume que CotizacionService tiene un método updateCotizacion
        if (updateData.estado && (updateData.estado === 'Entregado' || updateData.estado === 'Completada')) {
            if (existingTrabajo.cotizacion_id) {
                try {
                    await CotizacionService.updateCotizacion(
                        existingTrabajo.cotizacion_id,
                        { estado: 'Completada' }
                    );
                } catch (quoteError) {
                    console.error(`Error al actualizar la cotización ${existingTrabajo.cotizacion_id} para el trabajo ${id_trabajo}:`, quoteError.message);
                }
            } else {
                console.warn(`Advertencia: Trabajo ${id_trabajo} completado/entregado, pero no tiene una cotización asociada para actualizar.`);
            }
        }

        const updatedTrabajo = await Trabajo.findById(id_trabajo);
        return updatedTrabajo;
    }

    async deleteTrabajo(id_trabajo) {
        const success = await Trabajo.delete(id_trabajo);
        if (!success) {
            throw new Error('Trabajo no encontrado para eliminar.');
        }
        return true;
    }

    // =========================================================
    // NUEVOS MÉTODOS PARA EL DASHBOARD
    // =========================================================

    /**
     * Obtiene el número de trabajos activos (en proceso o pendientes).
     * @returns {Promise<number>} El número total de trabajos activos.
     */
    async getTrabajosActivosCount() {
        try {
            // Define los estados que consideras "activos"
            const activeStates = ['Pendiente', 'En Proceso', 'En Medición', 'Listo para Entrega'];
            const totalActive = await Trabajo.countByEstados(activeStates);
            return totalActive;
        } catch (error) {
            console.error('Error en TrabajoService.getTrabajosActivosCount:', error);
            throw new Error('No se pudo obtener el total de trabajos activos.');
        }
    }

    /**
     * Obtiene el número de trabajos completados o entregados.
     * @returns {Promise<number>} El número total de trabajos completados.
     */
    async getTrabajosCompletadosCount() {
        try {
            const totalCompleted = await Trabajo.countCompleted(); // Llama al nuevo método del modelo
            return totalCompleted;
        } catch (error) {
            console.error('Error en TrabajoService.getTrabajosCompletadosCount:', error);
            throw new Error('No se pudo obtener el total de trabajos completados.');
        }
    }
}

export default new TrabajoService();
