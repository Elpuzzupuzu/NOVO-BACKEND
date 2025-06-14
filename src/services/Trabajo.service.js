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
    const existingTrabajo = await Trabajo.findById(id_trabajo);
    if (!existingTrabajo) {
        throw new Error('Trabajo no encontrado para actualizar.');
    }

    // --- IMPORTANTE: ELIMINAR fecha_actualizacion del payload del frontend si existe ---
    // Generalmente, fecha_actualizacion debe ser gestionada por el backend.
    if (updateData.fecha_actualizacion !== undefined) {
        delete updateData.fecha_actualizacion;
    }

    // Validar si el empleado_id ha cambiado y si el nuevo empleado existe
    if (updateData.empleado_id && updateData.empleado_id !== existingTrabajo.empleado_id) {
        const newEmpleadoExists = await EmpleadoModel.findById(updateData.empleado_id);
        if (!newEmpleadoExists) {
            throw new Error('El nuevo empleado responsable no existe.');
        }
    }

    // --- PRE-PROCESAMIENTO DE TODAS LAS FECHAS ANTES DE ENVIARLAS AL MODELO ---
    // Ajusta los nombres de los campos de fecha según tu esquema de Trabajo
    const trabajoTimestampFields = [
        'fecha_inicio_estimada',
        'fecha_fin_estimada',
        'fecha_inicio_real',
        'fecha_fin_real'
    ];

    trabajoTimestampFields.forEach(field => {
        // Solo procesa si el campo está presente en updateData
        if (updateData[field] !== undefined) {
            // Si el valor es null o una cadena vacía, lo guardamos como null en la DB
            if (updateData[field] === null || updateData[field] === '') {
                updateData[field] = null;
            } else {
                const date = new Date(updateData[field]);
                // Verifica si la fecha es válida. isNaN(date.getTime()) es la forma más robusta.
                if (!isNaN(date.getTime())) {
                    updateData[field] = date; // Pasa el OBJETO Date directamente al modelo
                } else {
                    // Si el valor no es una fecha válida, establece como null para evitar errores en la DB
                    console.warn(`Advertencia: El campo de fecha '${field}' contenía un valor no válido: '${updateData[field]}'. Se establecerá a null.`);
                    updateData[field] = null;
                }
            }
        }
    });

    // --- ESTABLECER fecha_actualizacion AQUÍ EN EL BACKEND (si tu modelo Trabajo lo tiene) ---
    // Esto asegura que siempre se actualice a la hora del servidor y en el formato correcto para TIMESTAMP.
    // Asume que tu modelo Trabajo tiene un campo 'fecha_actualizacion'.
    updateData.fecha_actualizacion = new Date(); // <--- Objeto Date para TIMESTAMP


    console.log('Datos finales a enviar al modelo de Trabajo:', updateData);

    const success = await Trabajo.update(id_trabajo, updateData);
    if (!success) {
        throw new Error('No se pudo actualizar el trabajo.');
    }

    // Lógica para actualizar el estado de la cotización asociada si el trabajo se completa/entrega
    if (updateData.estado && (updateData.estado === 'Entregado' || updateData.estado === 'Completada')) {
        if (existingTrabajo.cotizacion_id) {
            try {
                // Asume que tu servicio de cotizaciones tiene un método para actualizar por ID
                // Y que el estado 'Completada' es válido para cotizaciones
                const quoteUpdateSuccess = await CotizacionModel.update(
                    existingTrabajo.cotizacion_id,
                    { estado: 'Completada' }
                );
                if (!quoteUpdateSuccess) {
                    console.warn(`Advertencia: No se pudo actualizar el estado de la cotización ${existingTrabajo.cotizacion_id} al completar el trabajo ${id_trabajo}.`);
                }
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
        const success = await Trabajo.delete(id_trabajo); // <-- Usa 'Trabajo' directamente
        if (!success) {
            throw new Error('Trabajo no encontrado para eliminar.');
        }
        return true;
    }
}

export default new TrabajoService();