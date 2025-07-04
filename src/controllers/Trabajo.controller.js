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
     * Permite filtrar por estado, empleado_id, cotizacion_id, y searchTerm (cliente/empleado/IDs).
     * Incluye paginación.
     * @param {object} req - Objeto de solicitud (contiene req.query para filtros, page, limit, searchTerm).
     * @param {object} res - Objeto de respuesta.
     */
    async getAllTrabajos(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const searchTerm = req.query.searchTerm || '';
            const estado = req.query.estado || '';
            const empleado_id = req.query.empleado_id || '';
            const cotizacion_id = req.query.cotizacion_id || '';

            const filters = {
                searchTerm: searchTerm,
                estado: estado,
                empleado_id: empleado_id,
                cotizacion_id: cotizacion_id,
            };

            Object.keys(filters).forEach(key => {
                if (filters[key] === '' || filters[key] === null || filters[key] === undefined) {
                    delete filters[key];
                }
            });

            const result = await TrabajoService.getAllTrabajos(filters, page, limit);
            
            // Establecer encabezados de no-caché
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');

            // Enviar la respuesta
            res.status(200).send(JSON.stringify(result));

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
            // Validar estados permitidos, incluyendo 'Completada' para sincronización con cotizaciones
            if (updateData.estado && !['Pendiente', 'En Proceso', 'En Medición', 'Listo para Entrega', 'Entregado', 'Cancelado', 'Completada'].includes(updateData.estado)) {
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

    // =========================================================
    // NUEVOS MÉTODOS PARA EL DASHBOARD
    // =========================================================

    /**
     * Obtiene el número total de trabajos activos para el dashboard.
     * GET /NOVO/trabajos/activos-count
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    async getTrabajosActivosCountController(req, res) {
        try {
            const totalActivos = await TrabajoService.getTrabajosActivosCount();
            res.status(200).json({ totalTrabajosActivos: totalActivos });
        } catch (error) {
            console.error('Error en TrabajoController.getTrabajosActivosCountController:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener el total de trabajos activos.', error: error.message });
        }
    }

    /**
     * Obtiene el número total de trabajos completados para el dashboard.
     * GET /NOVO/trabajos/completados-count
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    async getTrabajosCompletadosCountController(req, res) {
        try {
            const totalCompletados = await TrabajoService.getTrabajosCompletadosCount();
            res.status(200).json({ totalTrabajosCompletados: totalCompletados });
        } catch (error) {
            console.error('Error en TrabajoController.getTrabajosCompletadosCountController:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener el total de trabajos completados.', error: error.message });
        }
    }
}

// Exporta una instancia de la clase para que sea un singleton
export default new TrabajoController();
