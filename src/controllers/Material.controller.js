// src/controllers/Material.controller.js

// Importa el servicio Material para acceder a la lógica de negocio
import MaterialService from '../services/Material.service.js';

class MaterialController {
    /**
     * Maneja la creación de un nuevo material.
     * @param {object} req - Objeto de solicitud (contiene req.body).
     * @param {object} res - Objeto de respuesta.
     */
    async createMaterial(req, res) {
        try {
            const materialData = req.body;

            // Validación básica de entrada
            if (!materialData.nombre || !materialData.unidad_medida || materialData.costo_por_unidad === undefined) {
                return res.status(400).json({ message: 'Nombre, unidad de medida y costo por unidad son campos requeridos.' });
            }
            if (isNaN(materialData.costo_por_unidad) || materialData.costo_por_unidad < 0) {
                return res.status(400).json({ message: 'Costo por unidad debe ser un número positivo.' });
            }

            const newMaterial = await MaterialService.createMaterial(materialData);
            res.status(201).json({ message: 'Material creado exitosamente.', material: newMaterial });
        } catch (error) {
            // Manejo de errores específicos del servicio o de la base de datos (ej. duplicados)
            if (error.message.includes('El nombre del material ya existe') || error.message.includes('El código del material ya existe')) {
                return res.status(409).json({ message: error.message }); // 409 Conflict
            }
            console.error('Error en MaterialController.createMaterial:', error);
            res.status(500).json({ message: 'Error interno del servidor al crear material.', error: error.message });
        }
    }

    /**
     * Maneja la obtención de todos los materiales.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    async getAllMaterials(req, res) {
        try {
            const materials = await MaterialService.getAllMaterials();
            res.status(200).json(materials);
        } catch (error) {
            console.error('Error en MaterialController.getAllMaterials:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener materiales.', error: error.message });
        }
    }

    /**
     * Maneja la obtención de un material por su ID.
     * @param {object} req - Objeto de solicitud (contiene req.params.id_material).
     * @param {object} res - Objeto de respuesta.
     */
    async getMaterialById(req, res) {
        try {
            const { id_material } = req.params;
            const material = await MaterialService.getMaterialById(id_material);
            res.status(200).json(material);
        } catch (error) {
            if (error.message.includes('Material no encontrado')) {
                return res.status(404).json({ message: error.message }); // 404 Not Found
            }
            console.error('Error en MaterialController.getMaterialById:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener material.', error: error.message });
        }
    }

    /**
     * Maneja la obtención de un material por su código.
     * @param {object} req - Objeto de solicitud (contiene req.params.codigo).
     * @param {object} res - Objeto de respuesta.
     */
    async getMaterialByCodigo(req, res) {
        try {
            const { codigo } = req.params;
            const material = await MaterialService.getMaterialByCodigo(codigo);
            res.status(200).json(material);
        } catch (error) {
            if (error.message.includes('Material no encontrado por el código')) {
                return res.status(404).json({ message: error.message }); // 404 Not Found
            }
            console.error('Error en MaterialController.getMaterialByCodigo:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener material por código.', error: error.message });
        }
    }

    /**
     * Maneja la actualización de un material.
     * @param {object} req - Objeto de solicitud (contiene req.params.id_material y req.body).
     * @param {object} res - Objeto de respuesta.
     */
    async updateMaterial(req, res) {
        try {
            const { id_material } = req.params;
            const updateData = req.body;

            // No permitir actualizar el ID del material
            if (updateData.id_material) {
                return res.status(400).json({ message: 'No se puede actualizar el ID del material.' });
            }

            const updatedMaterial = await MaterialService.updateMaterial(id_material, updateData);
            res.status(200).json({ message: 'Material actualizado exitosamente.', material: updatedMaterial });
        } catch (error) {
            if (error.message.includes('Material no encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('nombre del material ya está en uso') || error.message.includes('código del material ya está en uso')) {
                return res.status(409).json({ message: error.message });
            }
            console.error('Error en MaterialController.updateMaterial:', error);
            res.status(500).json({ message: 'Error interno del servidor al actualizar material.', error: error.message });
        }
    }

    /**
     * Maneja la eliminación de un material.
     * @param {object} req - Objeto de solicitud (contiene req.params.id_material).
     * @param {object} res - Objeto de respuesta.
     */
    async deleteMaterial(req, res) {
        try {
            const { id_material } = req.params;
            await MaterialService.deleteMaterial(id_material);
            res.status(200).json({ message: 'Material eliminado exitosamente.' });
        } catch (error) {
            if (error.message.includes('Material no encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            console.error('Error en MaterialController.deleteMaterial:', error);
            res.status(500).json({ message: 'Error interno del servidor al eliminar material.', error: error.message });
        }
    }
}

// Exporta una instancia de la clase para que sea un singleton
export default new MaterialController();
