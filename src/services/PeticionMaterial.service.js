// src/services/PeticionMaterial.service.js

// Importa el modelo PeticionMaterial para interactuar con la base de datos
import PeticionMaterialModel from '../models/PeticionMaterial.js';
// Opcional: Si necesitas validar existencia de material_codigo en Materiales
// import MaterialModel from '../models/Material.model.js';

class PeticionMaterialService {
    /**
     * Crea una nueva petición de material.
     * Realiza validaciones adicionales si es necesario (ej. que material_codigo exista).
     * @param {object} peticionData - Datos de la petición a crear.
     * @returns {Promise<object>} La petición de material creada.
     * @throws {Error} Si faltan datos, datos inválidos o error al crear.
     */
    async createPeticionMaterial(peticionData) {
        // Validación de existencia de material_codigo (opcional pero recomendado)
        // const materialExists = await MaterialModel.findById(peticionData.material_codigo);
        // if (!materialExists) {
        //     throw new Error('El material con el código proporcionado no existe.');
        // }

        const newPeticion = await PeticionMaterialModel.create(peticionData);
        return newPeticion;
    }

    /**
     * Obtiene todas las peticiones de material, con filtros opcionales.
     * @param {object} filters - Objeto con filtros para la búsqueda.
     * @returns {Promise<Array<object>>} Un array de peticiones de material.
     */
    async getAllPeticionesMaterial(filters) {
        const peticiones = await PeticionMaterialModel.findAll(filters);
        return peticiones;
    }

    /**
     * Obtiene una petición de material por su ID.
     * @param {string} id_peticion_material - ID de la petición.
     * @returns {Promise<object|null>} La petición encontrada o null.
     * @throws {Error} Si la petición no es encontrada.
     */
    async getPeticionMaterialById(id_peticion_material) {
        const peticion = await PeticionMaterialModel.findById(id_peticion_material);
        if (!peticion) {
            throw new Error('Petición de material no encontrada.');
        }
        return peticion;
    }

    /**
     * Actualiza los datos de una petición de material.
     * @param {string} id_peticion_material - ID de la petición a actualizar.
     * @param {object} updateData - Datos a actualizar.
     * @returns {Promise<object>} La petición de material actualizada.
     * @throws {Error} Si la petición no existe, datos inválidos o error al actualizar.
     */
    async updatePeticionMaterial(id_peticion_material, updateData) {
        const existingPeticion = await PeticionMaterialModel.findById(id_peticion_material);
        if (!existingPeticion) {
            throw new Error('Petición de material no encontrada para actualizar.');
        }

        // Lógica de negocio adicional si se necesita (ej. si el estado es 'Comprado', no se puede volver a 'Pendiente')
        // if (existingPeticion.estado === 'Comprado' && updateData.estado === 'Pendiente de Compra') {
        //    throw new Error('No se puede cambiar el estado de Comprado a Pendiente de Compra.');
        // }

        const success = await PeticionMaterialModel.update(id_peticion_material, updateData);
        if (!success) {
            throw new Error('No se pudo actualizar la petición de material.');
        }

        const updatedPeticion = await PeticionMaterialModel.findById(id_peticion_material);
        return updatedPeticion;
    }

    /**
     * Elimina una petición de material.
     * @param {string} id_peticion_material - ID de la petición a eliminar.
     * @returns {Promise<boolean>} True si se eliminó, false si no se encontró.
     * @throws {Error} Si la petición no existe.
     */
    async deletePeticionMaterial(id_peticion_material) {
        const success = await PeticionMaterialModel.delete(id_peticion_material);
        if (!success) {
            throw new Error('Petición de material no encontrada para eliminar.');
        }
        return true;
    }
}

// Exporta una instancia de la clase para que sea un singleton
export default new PeticionMaterialService();
