// src/services/Material.service.js

// Importa el modelo Material para interactuar con la base de datos
import MaterialModel from '../models/Material.model.js';

class MaterialService {
    /**
     * Crea un nuevo material.
     * Incluye lógica de negocio como verificar si el nombre o el código ya existen antes de la creación.
     * @param {object} materialData - Datos del material a crear.
     * @returns {Promise<object>} El objeto del material creado.
     * @throws {Error} Si el nombre o el código ya existen, o hay un error al crear.
     */
    async createMaterial(materialData) {
        // La validación de unicidad para 'nombre' y 'codigo' ya se maneja en el Modelo
        // a través de las restricciones UNIQUE de la base de datos, lo que es eficiente.
        // Si hay un error de duplicado, el modelo lanzará un error específico.
        const newMaterial = await MaterialModel.create(materialData);
        return newMaterial;
    }

    /**
     * Obtiene todos los materiales. Este es el método original.
     * @returns {Promise<Array<object>>} Un array de objetos de materiales.
     */
    async getAllMaterials() {
        const materials = await MaterialModel.findAll();
        return materials;
    }

    /**
     * Obtiene materiales con opciones de filtrado, búsqueda y paginación.
     * Este es el NUEVO método para la funcionalidad extendida.
     * @param {object} filters - Objeto con los filtros a aplicar (ej: { searchTerm: 'cuero' }).
     * @param {number} page - El número de página actual.
     * @param {number} limit - La cantidad de materiales por página.
     * @returns {Promise<object>} Un objeto que contiene 'data' (array de materiales) y 'pagination' (metadatos de paginación).
     */
    async getPaginatedAndFilteredMaterials(filters, page, limit) {
        const materials = await MaterialModel.findPaginatedAndFiltered(filters, page, limit);
        return materials;
    }

    /**
     * Obtiene un material por su ID.
     * @param {string} id_material - El ID único del material.
     * @returns {Promise<object|null>} El objeto del material si se encuentra, o null si no.
     * @throws {Error} Si el material no es encontrado.
     */
    async getMaterialById(id_material) {
        const material = await MaterialModel.findById(id_material);
        if (!material) {
            throw new Error('Material no encontrado.');
        }
        return material;
    }

    /**
     * Obtiene un material por su código (el código por defecto).
     * @param {string} codigo - El código por defecto del material.
     * @returns {Promise<object|null>} El objeto del material si se encuentra, o null si no.
     * @throws {Error} Si el material no es encontrado.
     */
    async getMaterialByCodigo(codigo) {
        const material = await MaterialModel.findByCodigo(codigo);
        if (!material) {
            throw new Error('Material no encontrado por el código proporcionado.');
        }
        return material;
    }

    /**
     * Actualiza los datos de un material existente.
     * Realiza validaciones de unicidad para nombre y código si se intentan actualizar.
     * @param {string} id_material - El ID del material a actualizar.
     * @param {object} updateData - Objeto con los datos a actualizar.
     * @returns {Promise<object>} El objeto del material actualizado.
     * @throws {Error} Si el material no existe, o si el nuevo nombre/código ya están en uso.
     */
    async updateMaterial(id_material, updateData) {
        // Primero, verificar que el material exista
        const existingMaterial = await MaterialModel.findById(id_material);
        if (!existingMaterial) {
            throw new Error('Material no encontrado para actualizar.');
        }

        // Lógica de negocio para verificar unicidad si se cambia el nombre o código
        if (updateData.nombre && updateData.nombre !== existingMaterial.nombre) {
            const materialWithNewName = await MaterialModel.findByName(updateData.nombre);
            if (materialWithNewName && materialWithNewName.id_material !== id_material) {
                throw new Error('El nuevo nombre del material ya está en uso.');
            }
        }
        if (updateData.codigo && updateData.codigo !== existingMaterial.codigo) {
            const materialWithNewCode = await MaterialModel.findByCodigo(updateData.codigo);
            if (materialWithNewCode && materialWithNewCode.id_material !== id_material) {
                throw new Error('El nuevo código del material ya está en uso.');
            }
        }

        const success = await MaterialModel.update(id_material, updateData);
        if (!success) {
            // Esto solo debería ocurrir si el ID no existe, lo cual ya se maneja arriba.
            // O si la actualización no afectó filas (ej. datos idénticos)
            throw new Error('No se pudo actualizar el material. Posiblemente los datos eran idénticos o el ID no existe.');
        }

        // Devolver el material actualizado para confirmación
        const updatedMaterial = await MaterialModel.findById(id_material);
        return updatedMaterial;
    }

    /**
     * Elimina un material de la base de datos.
     * @param {string} id_material - El ID del material a eliminar.
     * @returns {Promise<boolean>} True si la eliminación fue exitosa, false si no se encontró.
     * @throws {Error} Si el material no existe.
     */
    async deleteMaterial(id_material) {
        const success = await MaterialModel.delete(id_material);
        if (!success) {
            throw new Error('Material no encontrado para eliminar.');
        }
        return true;
    }
}

// Exporta una instancia de la clase para que sea un singleton
export default new MaterialService();
