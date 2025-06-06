// src/controllers/Empleado.controller.js

// Importa el servicio Empleado para acceder a la lógica de negocio
import EmpleadoService from '../services/Empleado.service.js';

class EmpleadoController {
    /**
     * Maneja la creación de un nuevo empleado.
     * @param {object} req - Objeto de solicitud (contiene req.body).
     * @param {object} res - Objeto de respuesta.
     */
    async createEmpleado(req, res) {
        try {
            const empleadoData = req.body;

            // Validación básica de entrada
            if (!empleadoData.nombre || !empleadoData.username || !empleadoData.password) {
                return res.status(400).json({ message: 'Nombre, username y password del empleado son campos requeridos.' });
            }
            // Asegúrate de que el rol sea uno válido para empleados si se envía
            if (empleadoData.role && !['empleado', 'gerente', 'admin'].includes(empleadoData.role)) {
                return res.status(400).json({ message: 'El rol del empleado no es válido.' });
            }


            const newEmpleado = await EmpleadoService.createEmpleado(empleadoData);
            res.status(201).json({ message: 'Empleado creado exitosamente.', empleado: newEmpleado });
        } catch (error) {
            if (error.message.includes('contacto del empleado ya está registrado')) {
                return res.status(409).json({ message: error.message }); // 409 Conflict
            }
            if (error.message.includes('username del empleado ya está en uso')) {
                return res.status(409).json({ message: error.message }); // 409 Conflict
            }
            console.error('Error en EmpleadoController.createEmpleado:', error);
            res.status(500).json({ message: 'Error interno del servidor al crear empleado.', error: error.message });
        }
    }

    /**
     * Maneja la obtención de todos los empleados.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    async getAllEmpleados(req, res) {
        try {
            const empleados = await EmpleadoService.getAllEmpleados();
            res.status(200).json(empleados);
        } catch (error) {
            console.error('Error en EmpleadoController.getAllEmpleados:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener empleados.', error: error.message });
        }
    }

    /**
     * Maneja la obtención de un empleado por su ID.
     * @param {object} req - Objeto de solicitud (contiene req.params.id_empleado).
     * @param {object} res - Objeto de respuesta.
     */
    async getEmpleadoById(req, res) {
        try {
            const { id_empleado } = req.params;
            const empleado = await EmpleadoService.getEmpleadoById(id_empleado);
            res.status(200).json(empleado);
        } catch (error) {
            if (error.message.includes('Empleado no encontrado')) {
                return res.status(404).json({ message: error.message }); // 404 Not Found
            }
            console.error('Error en EmpleadoController.getEmpleadoById:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener empleado.', error: error.message });
        }
    }

    /**
     * Maneja la actualización de un empleado.
     * @param {object} req - Objeto de solicitud (contiene req.params.id_empleado y req.body).
     * @param {object} res - Objeto de respuesta.
     */
    async updateEmpleado(req, res) {
        try {
            const { id_empleado } = req.params;
            const updateData = req.body;

            // No permitir actualizar el ID del empleado
            if (updateData.id_empleado) {
                return res.status(400).json({ message: 'No se puede actualizar el ID del empleado.' });
            }
            // Asegúrate de que el rol sea uno válido si se intenta actualizar
            if (updateData.role && !['empleado', 'gerente', 'admin'].includes(updateData.role)) {
                return res.status(400).json({ message: 'El rol del empleado no es válido para la actualización.' });
            }

            const updatedEmpleado = await EmpleadoService.updateEmpleado(id_empleado, updateData);
            res.status(200).json({ message: 'Empleado actualizado exitosamente.', empleado: updatedEmpleado });
        } catch (error) {
            if (error.message.includes('Empleado no encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('contacto del empleado ya está en uso') || error.message.includes('username del empleado ya está en uso')) {
                return res.status(409).json({ message: error.message });
            }
            console.error('Error en EmpleadoController.updateEmpleado:', error);
            res.status(500).json({ message: 'Error interno del servidor al actualizar empleado.', error: error.message });
        }
    }

    /**
     * Maneja la eliminación de un empleado.
     * @param {object} req - Objeto de solicitud (contiene req.params.id_empleado).
     * @param {object} res - Objeto de respuesta.
     */
    async deleteEmpleado(req, res) {
        try {
            const { id_empleado } = req.params;
            await EmpleadoService.deleteEmpleado(id_empleado);
            res.status(200).json({ message: 'Empleado eliminado exitosamente.' });
        } catch (error) {
            if (error.message.includes('Empleado no encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            console.error('Error en EmpleadoController.deleteEmpleado:', error);
            res.status(500).json({ message: 'Error interno del servidor al eliminar empleado.', error: error.message });
        }
    }
}

// Exporta una instancia de la clase para que sea un singleton
export default new EmpleadoController();
