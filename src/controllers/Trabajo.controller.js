// src/controllers/Trabajo.controller.js

// Importa el servicio Trabajo para acceder a la lógica de negocio
import TrabajoService from '../services/Trabajo.service.js';

class TrabajoController {
    /**
     * Maneja la creación de un nuevo trabajo.
     * @param {object} req - Objeto de solicitud (contiene req.body).
     * @param {object} res - Objeto de respuesta.
     */
    async createTrabajo(req, res) {
        try {
            const trabajoData = req.body;

            // Validación básica de entrada
            if (!trabajoData.cotizacion_id) {
                return res.status(400).json({ message: 'El ID de la cotización es un campo requerido para crear un trabajo.' });
            }
            // Puedes añadir más validaciones de formato de fechas, números, etc.

            const newTrabajo = await TrabajoService.createTrabajo(trabajoData);
            res.status(201).json({ message: 'Trabajo creado exitosamente.', trabajo: newTrabajo });
        } catch (error) {
            console.error('Error en TrabajoController.createTrabajo:', error);
            if (error.message.includes('Cotización no encontrada')) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('Empleado responsable no encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('Ya existe un trabajo asociado a esta cotización')) {
                return res.status(409).json({ message: error.message }); // Conflict
            }
            res.status(500).json({ message: 'Error interno del servidor al crear trabajo.', error: error.message });
        }
    }

    /**
     * Maneja la obtención de todos los trabajos.
     * Permite filtrar por estado, empleado_id o cotizacion_id.
     * @param {object} req - Objeto de solicitud (contiene req.query para filtros).
     * @param {object} res - Objeto de respuesta.
     */
    async getAllTrabajos(req, res) {
        try {
            const filters = req.query; // Los filtros se pasan como query parameters
            const trabajos = await TrabajoService.getAllTrabajos(filters);
            res.status(200).json(trabajos);
        } catch (error) {
            console.error('Error en TrabajoController.getAllTrabajos:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener trabajos.', error: error.message });
        }
    }

    /**
     * Maneja la obtención de un trabajo por su ID.
     * @param {object} req - Objeto de solicitud (contiene req.params.id_trabajo).
     * @param {object} res - Objeto de respuesta.
     */
    async getTrabajoById(req, res) {
        try {
            const { id_trabajo } = req.params;
            const trabajo = await TrabajoService.getTrabajoById(id_trabajo);
            res.status(200).json(trabajo);
        } catch (error) {
            if (error.message.includes('Trabajo no encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            console.error('Error en TrabajoController.getTrabajoById:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener trabajo.', error: error.message });
        }
    }

    /**
     * Maneja la actualización de un trabajo.
     * @param {object} req - Objeto de solicitud (contiene req.params.id_trabajo y req.body).
     * @param {object} res - Objeto de respuesta.
     */
    async updateTrabajo(req, res) {
        try {
            const { id_trabajo } = req.params;
            const updateData = req.body;

            if (updateData.id_trabajo) {
                return res.status(400).json({ message: 'No se puede actualizar el ID del trabajo.' });
            }
            if (updateData.estado && !['Pendiente', 'En Proceso', 'En Medición', 'Listo para Entrega', 'Entregado', 'Cancelado'].includes(updateData.estado)) {
                return res.status(400).json({ message: 'El estado del trabajo no es válido.' });
            }

            const updatedTrabajo = await TrabajoService.updateTrabajo(id_trabajo, updateData);
            res.status(200).json({ message: 'Trabajo actualizado exitosamente.', trabajo: updatedTrabajo });
        } catch (error) {
            if (error.message.includes('Trabajo no encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('estado del trabajo no es válido') || error.message.includes('El nuevo empleado responsable no existe')) {
                return res.status(400).json({ message: error.message });
            }
            console.error('Error en TrabajoController.updateTrabajo:', error);
            res.status(500).json({ message: 'Error interno del servidor al actualizar trabajo.', error: error.message });
        }
    }

    /**
     * Maneja la eliminación de un trabajo.
     * @param {object} req - Objeto de solicitud (contiene req.params.id_trabajo).
     * @param {object} res - Objeto de respuesta.
     */
    async deleteTrabajo(req, res) {
        try {
            const { id_trabajo } = req.params;
            await TrabajoService.deleteTrabajo(id_trabajo);
            res.status(200).json({ message: 'Trabajo eliminado exitosamente.' });
        } catch (error) {
            if (error.message.includes('Trabajo no encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            console.error('Error en TrabajoController.deleteTrabajo:', error);
            res.status(500).json({ message: 'Error interno del servidor al eliminar trabajo.', error: error.message });
        }
    }
}

// Exporta una instancia de la clase para que sea un singleton
export default new TrabajoController();
