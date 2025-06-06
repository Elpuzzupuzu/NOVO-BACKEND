// src/models/Cliente.model.js

// Importa el pool de conexiones a la base de datos
import { pool } from '../config/db.js';
// Importa la librería uuid para generar IDs únicos
import { v4 as uuidv4 } from 'uuid';
// Importa bcryptjs para hashear y comparar contraseñas
import bcrypt from 'bcryptjs';

// Define el número de 'rounds' (costo) para el hashing de bcrypt.
const SALT_ROUNDS = 10;

class Cliente {
    /**
     * Crea un nuevo cliente en la base de datos, incluyendo su rol.
     * Hashea la contraseña antes de guardarla.
     * @param {object} clienteData - Objeto con los datos del nuevo cliente.
     * @param {string} clienteData.nombre - Nombre del cliente.
     * @param {string} [clienteData.apellido] - Apellido del cliente (opcional).
     * @param {string} clienteData.contacto - Contacto del cliente (número de WhatsApp, único).
     * @param {string} [clienteData.email] - Email del cliente (opcional).
     * @param {string} [clienteData.direccion] - Dirección del cliente (opcional).
     * @param {string} clienteData.username - Nombre de usuario (único).
     * @param {string} clienteData.password - Contraseña en texto plano.
     * @param {string} [clienteData.role='cliente'] - Rol del cliente (por defecto 'cliente').
     * @returns {Promise<object>} El objeto del cliente creado (sin la contraseña hasheada para seguridad).
     * @throws {Error} Si el contacto o el username ya están registrados o hay un error.
     */
    static async create(clienteData) {
        const id_cliente = uuidv4();
        const { nombre, apellido, contacto, email, direccion, username, password } = clienteData;
        // El rol se toma de clienteData, o se usa 'cliente' si no se proporciona (la DB también tiene un DEFAULT)
        const role = clienteData.role || 'cliente';

        // Validar que username y password no sean nulos o vacíos
        if (!username || !password) {
            throw new Error('Username y password son campos requeridos.');
        }

        // Hashear la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const query = `
            INSERT INTO clientes (id_cliente, nombre, apellido, contacto, email, direccion, username, password, role)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [id_cliente, nombre, apellido, contacto, email, direccion, username, hashedPassword, role];

        try {
            await pool.query(query, values);
            // Retorna el cliente creado, excluyendo la contraseña hasheada por seguridad
            const { password: _, ...clientWithoutPassword } = clienteData; // Destructuring para excluir password
            return { id_cliente, role, ...clientWithoutPassword };
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                if (error.message.includes('for key \'contacto\'')) {
                    throw new Error('El contacto ya está registrado para otro cliente.');
                }
                if (error.message.includes('for key \'username\'')) {
                    throw new Error('El nombre de usuario ya está en uso.');
                }
            }
            console.error('Error al crear cliente:', error.message);
            throw new Error(`No se pudo crear el cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene un cliente por su ID.
     * @param {string} id_cliente - El ID del cliente a buscar.
     * @param {boolean} includePassword - Si es true, incluye la contraseña hasheada (usar con precaución).
     * @returns {Promise<object|null>} El objeto del cliente si se encuentra, o null si no.
     */
    static async findById(id_cliente, includePassword = false) {
        // Asegúrate de seleccionar el campo 'role'
        const selectFields = includePassword ? '*' : 'id_cliente, nombre, apellido, contacto, email, direccion, username, role, fecha_registro, fecha_actualizacion';
        const query = `SELECT ${selectFields} FROM clientes WHERE id_cliente = ?`;
        try {
            const [rows] = await pool.query(query, [id_cliente]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error al buscar cliente por ID:', error.message);
            throw new Error(`No se pudo encontrar el cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene un cliente por su nombre de usuario.
     * Este método es crucial para la autenticación (login).
     * @param {string} username - El nombre de usuario del cliente a buscar.
     * @returns {Promise<object|null>} El objeto del cliente (incluyendo contraseña hasheada y rol) si se encuentra, o null si no.
     */
    static async findByUsername(username) {
        // Se necesita la contraseña para comparar y el rol para el JWT payload
        const query = 'SELECT * FROM clientes WHERE username = ?';
        try {
            const [rows] = await pool.query(query, [username]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error al buscar cliente por username:', error.message);
            throw new Error(`No se pudo encontrar el cliente por username: ${error.message}`);
        }
    }

    /**
     * Compara una contraseña en texto plano con una contraseña hasheada.
     * @param {string} plainPassword - La contraseña en texto plano proporcionada por el usuario.
     * @param {string} hashedPassword - La contraseña hasheada almacenada en la base de datos.
     * @returns {Promise<boolean>} True si las contraseñas coinciden, false en caso contrario.
     */
    static async comparePassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Obtiene un cliente por su número de contacto (ej. WhatsApp).
     * @param {string} contacto - El número de contacto del cliente a buscar.
     * @returns {Promise<object|null>} El objeto del cliente si se encuentra, o null si no.
     */
    static async findByContacto(contacto) {
        // Asegúrate de seleccionar el campo 'role'
        const query = 'SELECT id_cliente, nombre, apellido, contacto, email, direccion, username, role, fecha_registro, fecha_actualizacion FROM clientes WHERE contacto = ?';
        try {
            const [rows] = await pool.query(query, [contacto]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error al buscar cliente por contacto:', error.message);
            throw new Error(`No se pudo encontrar el cliente por contacto: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los clientes de la base de datos. No incluye contraseñas.
     * @returns {Promise<Array<object>>} Un array de objetos de clientes.
     */
    static async findAll() {
        // Asegúrate de seleccionar el campo 'role'
        const query = 'SELECT id_cliente, nombre, apellido, contacto, email, direccion, username, role, fecha_registro, fecha_actualizacion FROM clientes';
        try {
            const [rows] = await pool.query(query);
            return rows;
        } catch (error) {
            console.error('Error al obtener todos los clientes:', error.message);
            throw new Error('No se pudieron obtener los clientes.');
        }
    }

    /**
     * Actualiza los datos de un cliente existente.
     * Permite actualizar la contraseña, hasheándola si se proporciona.
     * @param {string} id_cliente - El ID del cliente a actualizar.
     * @param {object} updateData - Objeto con los datos a actualizar.
     * @param {string} [updateData.password] - Nueva contraseña en texto plano (se hasheará).
     * @returns {Promise<boolean>} True si la actualización fue exitosa, false si no se encontró el cliente.
     * @throws {Error} Si el contacto o username a actualizar ya existe o hay un error.
     */
    static async update(id_cliente, updateData) {
        const fields = [];
        const values = [];

        for (const key in updateData) {
            if (updateData.hasOwnProperty(key) && key !== 'id_cliente') { // No permitir actualizar el ID
                if (key === 'password') {
                    // Si la contraseña se está actualizando, hashearla
                    values.push(await bcrypt.hash(updateData[key], SALT_ROUNDS));
                } else {
                    values.push(updateData[key]);
                }
                fields.push(`${key} = ?`);
            }
        }

        if (fields.length === 0) {
            return false; // No hay datos para actualizar
        }

        values.push(id_cliente); // Añade el ID del cliente al final para la cláusula WHERE

        const query = `UPDATE clientes SET ${fields.join(', ')} WHERE id_cliente = ?`;
        try {
            const [result] = await pool.query(query, values);
            return result.affectedRows > 0;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                if (error.message.includes('for key \'contacto\'')) {
                    throw new Error('El nuevo contacto ya está registrado para otro cliente.');
                }
                if (error.message.includes('for key \'username\'')) {
                    throw new Error('El nuevo nombre de usuario ya está en uso.');
                }
            }
            console.error('Error al actualizar cliente:', error.message);
            throw new Error(`No se pudo actualizar el cliente: ${error.message}`);
        }
    }

    /**
     * Elimina un cliente de la base de datos.
     * @param {string} id_cliente - El ID del cliente a eliminar.
     * @returns {Promise<boolean>} True si la eliminación fue exitosa, false si no se encontró el cliente.
     */
    static async delete(id_cliente) {
        const query = 'DELETE FROM clientes WHERE id_cliente = ?';
        try {
            const [result] = await pool.query(query, [id_cliente]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error al eliminar cliente:', error.message);
            throw new Error(`No se pudo eliminar el cliente: ${error.message}`);
        }
    }
}

export default Cliente;
