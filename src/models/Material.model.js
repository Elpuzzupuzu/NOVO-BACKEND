// src/models/Material.model.js

// Importa el pool de conexiones a la base de datos
import { pool } from '../config/db.js';
// Importa la librería uuid para generar IDs únicos (UUIDs)
import { v4 as uuidv4 } from 'uuid';

class Material {
    /**
     * Crea un nuevo material en la base de datos.
     * @param {object} materialData - Objeto con los datos del nuevo material.
     * @param {string} [materialData.codigo] - Código por defecto del material (opcional, debe ser único).
     * @param {string} materialData.nombre - Nombre del material (requerido, debe ser único).
     * @param {string} [materialData.descripcion] - Descripción del material (opcional).
     * @param {string} materialData.unidad_medida - Unidad de medida (ej: 'metro', 'unidad').
     * @param {number} materialData.costo_por_unidad - Costo por unidad de medida.
     * @param {boolean} [materialData.disponible_para_cotizacion=true] - Si está disponible para cotizaciones.
     * @returns {Promise<object>} El objeto del material creado.
     * @throws {Error} Si el nombre o el código ya existen o hay un error de base de datos.
     */
    static async create(materialData) {
        // Genera un ID único para el nuevo material
        const id_material = uuidv4();
        const {
            codigo = null, // Puede ser nulo si no se proporciona un código por defecto
            nombre,
            descripcion,
            unidad_medida,
            costo_por_unidad,
            disponible_para_cotizacion = true // Valor por defecto en la aplicación
        } = materialData;

        // Consulta SQL para insertar un nuevo material
        const query = `
            INSERT INTO materiales (id_material, codigo, nombre, descripcion, unidad_medida, costo_por_unidad, disponible_para_cotizacion)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            id_material,
            codigo,
            nombre,
            descripcion,
            unidad_medida,
            costo_por_unidad,
            disponible_para_cotizacion
        ];

        try {
            await pool.query(query, values);
            // Retorna el material creado con su ID
            return { id_material, ...materialData };
        } catch (error) {
            // Manejo de errores específicos para nombres o códigos duplicados
            if (error.code === 'ER_DUP_ENTRY') {
                if (error.message.includes('for key \'nombre\'')) {
                    throw new Error('El nombre del material ya existe.');
                }
                if (error.message.includes('for key \'codigo\'')) {
                    throw new Error('El código del material ya existe.');
                }
            }
            console.error('Error al crear material:', error.message);
            throw new Error(`No se pudo crear el material: ${error.message}`);
        }
    }

    /**
     * Obtiene un material por su ID.
     * @param {string} id_material - El ID del material a buscar.
     * @returns {Promise<object|null>} El objeto del material si se encuentra, o null si no.
     */
    static async findById(id_material) {
        const query = 'SELECT * FROM materiales WHERE id_material = ?';
        try {
            const [rows] = await pool.query(query, [id_material]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error al buscar material por ID:', error.message);
            throw new Error(`No se pudo encontrar el material: ${error.message}`);
        }
    }

    /**
     * Obtiene un material por su código.
     * @param {string} codigo - El código del material a buscar.
     * @returns {Promise<object|null>} El objeto del material si se encuentra, o null si no.
     */
    static async findByCodigo(codigo) {
        const query = 'SELECT * FROM materiales WHERE codigo = ?';
        try {
            const [rows] = await pool.query(query, [codigo]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error al buscar material por código:', error.message);
            throw new Error(`No se pudo encontrar el material por código: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los materiales de la base de datos.
     * @returns {Promise<Array<object>>} Un array de objetos de materiales.
     */
    static async findAll() {
        const query = 'SELECT * FROM materiales';
        try {
            const [rows] = await pool.query(query);
            return rows;
        } catch (error) {
            console.error('Error al obtener todos los materiales:', error.message);
            throw new Error('No se pudieron obtener los materiales.');
        }
    }

    /**
     * Actualiza los datos de un material existente.
     * @param {string} id_material - El ID del material a actualizar.
     * @param {object} updateData - Objeto con los datos a actualizar.
     * @returns {Promise<boolean>} True si la actualización fue exitosa, false si no se encontró el material.
     * @throws {Error} Si el nombre o código a actualizar ya existe en otro material.
     */
    static async update(id_material, updateData) {
        const fields = [];
        const values = [];

        for (const key in updateData) {
            if (updateData.hasOwnProperty(key) && key !== 'id_material') { // No permitir actualizar el ID
                fields.push(`${key} = ?`);
                values.push(updateData[key]);
            }
        }

        if (fields.length === 0) {
            return false; // No hay datos para actualizar
        }

        values.push(id_material); // Añade el ID del material al final de los valores para la cláusula WHERE

        const query = `UPDATE materiales SET ${fields.join(', ')} WHERE id_material = ?`;
        try {
            const [result] = await pool.query(query, values);
            return result.affectedRows > 0;
        } catch (error) {
            // Manejo de errores específicos para nombres o códigos duplicados durante la actualización
            if (error.code === 'ER_DUP_ENTRY') {
                if (error.message.includes('for key \'nombre\'')) {
                    throw new Error('El nuevo nombre del material ya existe.');
                }
                if (error.message.includes('for key \'codigo\'')) {
                    throw new Error('El nuevo código del material ya existe.');
                }
            }
            console.error('Error al actualizar material:', error.message);
            throw new Error(`No se pudo actualizar el material: ${error.message}`);
        }
    }

    /**
     * Elimina un material de la base de datos.
     * @param {string} id_material - El ID del material a eliminar.
     * @returns {Promise<boolean>} True si la eliminación fue exitosa, false si no se encontró el material.
     */
    static async delete(id_material) {
        const query = 'DELETE FROM materiales WHERE id_material = ?';
        try {
            const [result] = await pool.query(query, [id_material]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error al eliminar material:', error.message);
            throw new Error(`No se pudo eliminar el material: ${error.message}`);
        }
    }
}

export default Material;
