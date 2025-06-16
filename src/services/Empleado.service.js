// src/services/Empleado.service.js

// Importa el modelo Empleado para interactuar con la base de datos
import EmpleadoModel from '../models/Empleado.model.js';

class EmpleadoService {
    /**
     * Crea un nuevo empleado, hasheando la contraseña y validando unicidad.
     * @param {object} empleadoData - Datos del empleado a crear (nombre, username, password, [contacto], [role], etc.).
     * @returns {Promise<object>} El objeto del empleado creado (sin la contraseña hasheada).
     * @throws {Error} Si el contacto o username del empleado ya existen o hay un error.
     */
    async createEmpleado(empleadoData) {
        // Las validaciones de unicidad y el hasheo de la contraseña se manejan en el Modelo.
        const newEmpleado = await EmpleadoModel.create(empleadoData);
        return newEmpleado;
    }

    /**
     * Obtiene todos los empleados (método original sin paginación/búsqueda).
     * @returns {Promise<Array<object>>} Un array de objetos de empleados (sin contraseñas).
     */
    async getAllEmpleados() {
        const empleados = await EmpleadoModel.findAll();
        return empleados;
    }

    /**
     * Obtiene empleados con opciones de filtrado, búsqueda y paginación.
     * Este es el NUEVO método para la funcionalidad extendida.
     * @param {object} filters - Objeto con los filtros a aplicar (ej: { searchTerm: 'juan', activo: true, role: 'empleado' }).
     * @param {number} page - El número de página actual.
     * @param {number} limit - La cantidad de empleados por página.
     * @returns {Promise<object>} Un objeto que contiene 'data' (array de empleados) y 'pagination' (metadatos de paginación).
     */
    async getPaginatedAndFilteredEmpleados(filters, page, limit) {
        const empleados = await EmpleadoModel.findPaginatedAndFiltered(filters, page, limit);
        return empleados;
    }

    /**
     * Obtiene un empleado por su ID.
     * @param {string} id_empleado - El ID único del empleado.
     * @returns {Promise<object|null>} El objeto del empleado si se encuentra, o null si no.
     * @throws {Error} Si el empleado no es encontrado.
     */
    async getEmpleadoById(id_empleado) {
        const empleado = await EmpleadoModel.findById(id_empleado);
        if (!empleado) {
            throw new Error('Empleado no encontrado.');
        }
        return empleado;
    }

    /**
     * Actualiza los datos de un empleado existente.
     * @param {string} id_empleado - El ID del empleado a actualizar.
     * @param {object} updateData - Objeto con los datos a actualizar.
     * @returns {Promise<object>} El objeto del empleado actualizado (sin contraseña hasheada si se actualizó).
     * @throws {Error} Si el empleado no existe, o si el nuevo contacto/username ya está en uso.
     */
    async updateEmpleado(id_empleado, updateData) {
        const existingEmpleado = await EmpleadoModel.findById(id_empleado);
        if (!existingEmpleado) {
            throw new Error('Empleado no encontrado para actualizar.');
        }

        // Lógica de negocio para verificar unicidad si se cambia el contacto o username
        // El modelo también maneja ER_DUP_ENTRY, pero aquí puedes añadir validación previa.
        // Si se intenta actualizar el contacto y el nuevo contacto ya está en uso
        if (updateData.contacto && updateData.contacto !== existingEmpleado.contacto) {
            // Asumiendo que tendríamos un findByContacto en EmpleadoModel si lo necesitaríamos
            // For now, let the DB constraint handle it via ER_DUP_ENTRY in the model
        }
        // Si se intenta actualizar el username y el nuevo username ya está en uso
        if (updateData.username && updateData.username !== existingEmpleado.username) {
            // Asumiendo que tendríamos un findByUsername en EmpleadoModel para la unicidad aquí
            // For now, let the DB constraint handle it via ER_DUP_ENTRY in the model
        }

        const success = await EmpleadoModel.update(id_empleado, updateData);
        if (!success) {
            throw new Error('No se pudo actualizar el empleado. Posiblemente los datos eran idénticos o el ID no existe.');
        }

        const updatedEmpleado = await EmpleadoModel.findById(id_empleado);
        return updatedEmpleado;
    }

    /**
     * Elimina un empleado de la base de datos.
     * @param {string} id_empleado - El ID del empleado a eliminar.
     * @returns {Promise<boolean>} True si la eliminación fue exitosa, false si no se encontró.
     * @throws {Error} Si el empleado no existe.
     */
    async deleteEmpleado(id_empleado) {
        const success = await EmpleadoModel.delete(id_empleado);
        if (!success) {
            throw new Error('Empleado no encontrado para eliminar.');
        }
        return true;
    }
}

// Exporta una instancia de la clase para que sea un singleton
export default new EmpleadoService();
