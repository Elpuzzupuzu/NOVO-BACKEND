// src/controllers/PeticionMaterial.controller.js

// Importa el servicio PeticionMaterial para acceder a la lógica de negocio
import PeticionMaterialService from '../services/PeticionMaterial.service.js';

class PeticionMaterialController {
    /**
     * Maneja la creación de una nueva petición de material.
     * @param {object} req - Objeto de solicitud (contiene req.body).
     * @param {object} res - Objeto de respuesta.
     */
    async createPeticionMaterial(req, res) {
        try {
            const peticionData = req.body;

            // Validación básica de entrada
            if (!peticionData.material_codigo || !peticionData.cantidad_requerida_metros) {
                return res.status(400).json({ message: 'Código de material y cantidad requerida son campos obligatorios.' });
            }
            if (isNaN(peticionData.cantidad_requerida_metros) || peticionData.cantidad_requerida_metros <= 0) {
                return res.status(400).json({ message: 'La cantidad requerida debe ser un número positivo.' });
            }

            const newPeticion = await PeticionMaterialService.createPeticionMaterial(peticionData);
            res.status(201).json({ message: 'Petición de material creada exitosamente.', peticion: newPeticion });
        } catch (error) {
            console.error('Error en PeticionMaterialController.createPeticionMaterial:', error);
            if (error.message.includes('asociada a una cotización o a un trabajo')) {
                return res.status(400).json({ message: error.message });
            }
            if (error.message.includes('El material con el código proporcionado no existe')) {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error interno del servidor al crear petición de material.', error: error.message });
        }
    }

    /**
     * Maneja la obtención de todas las peticiones de material.
     * Permite filtrar por estado, cotizacion_id, trabajo_id o gerente_notificado.
     * @param {object} req - Objeto de solicitud (contiene req.query para filtros).
     * @param {object} res - Objeto de respuesta.
     */
    async getAllPeticionesMaterial(req, res) {
        try {
            const filters = req.query; // Los filtros se pasan como query parameters
            const peticiones = await PeticionMaterialService.getAllPeticionesMaterial(filters);
            res.status(200).json(peticiones);
        } catch (error) {
            console.error('Error en PeticionMaterialController.getAllPeticionesMaterial:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener peticiones de material.', error: error.message });
        }
    }

    /**
     * Maneja la obtención de una petición de material por su ID.
     * @param {object} req - Objeto de solicitud (contiene req.params.id_peticion_material).
     * @param {object} res - Objeto de respuesta.
     */
    async getPeticionMaterialById(req, res) {
        try {
            const { id_peticion_material } = req.params;
            const peticion = await PeticionMaterialService.getPeticionMaterialById(id_peticion_material);
            res.status(200).json(peticion);
        } catch (error) {
            if (error.message.includes('Petición de material no encontrada')) {
                return res.status(404).json({ message: error.message });
            }
            console.error('Error en PeticionMaterialController.getPeticionMaterialById:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener petición de material.', error: error.message });
        }
    }

    /**
     * Maneja la actualización de una petición de material.
     * @param {object} req - Objeto de solicitud (contiene req.params.id_peticion_material y req.body).
     * @param {object} res - Objeto de respuesta.
     */
    async updatePeticionMaterial(req, res) {
        try {
            const { id_peticion_material } = req.params;
            const updateData = req.body;

            if (updateData.id_peticion_material) {
                return res.status(400).json({ message: 'No se puede actualizar el ID de la petición de material.' });
            }

            const updatedPeticion = await PeticionMaterialService.updatePeticionMaterial(id_peticion_material, updateData);
            res.status(200).json({ message: 'Petición de material actualizada exitosamente.', peticion: updatedPeticion });
        } catch (error) {
            if (error.message.includes('Petición de material no encontrada')) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('no es válido')) { // Para estados de ENUM
                return res.status(400).json({ message: error.message });
            }
            console.error('Error en PeticionMaterialController.updatePeticionMaterial:', error);
            res.status(500).json({ message: 'Error interno del servidor al actualizar petición de material.', error: error.message });
        }
    }

    /**
     * Maneja la eliminación de una petición de material.
     * @param {object} req - Objeto de solicitud (contiene req.params.id_peticion_material).
     * @param {object} res - Objeto de respuesta.
     */
    async deletePeticionMaterial(req, res) {
        try {
            const { id_peticion_material } = req.params;
            await PeticionMaterialService.deletePeticionMaterial(id_peticion_material);
            res.status(200).json({ message: 'Petición de material eliminada exitosamente.' });
        } catch (error) {
            if (error.message.includes('Petición de material no encontrada')) {
                return res.status(404).json({ message: error.message });
            }
            console.error('Error en PeticionMaterialController.deletePeticionMaterial:', error);
            res.status(500).json({ message: 'Error interno del servidor al eliminar petición de material.', error: error.message });
        }
    }
}

// Exporta una instancia de la clase para que sea un singleton
export default new PeticionMaterialController();
