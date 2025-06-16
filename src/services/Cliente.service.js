// src/services/Cliente.service.js

// Importa el modelo Cliente para interactuar con la base de datos
import ClienteModel from '../models/Cliente.model.js';
// Importa jsonwebtoken para crear y firmar tokens
import jwt from 'jsonwebtoken';
// Importa dotenv para acceder a las variables de entorno (JWT_SECRET, JWT_EXPIRES_IN)
import dotenv from 'dotenv';
dotenv.config(); // Carga las variables de entorno

class ClienteService {
    /**
     * Crea un nuevo cliente. Incluye lógica de negocio como verificar si el contacto o username ya existen.
     * @param {object} clienteData - Datos del cliente (nombre, apellido, contacto, email, direccion, username, password, [role], [foto_perfil_url]).
     * @returns {Promise<object>} El cliente creado (sin la contraseña hasheada).
     * @throws {Error} Si el contacto o username ya están registrados o hay un error al crear el cliente.
     */
    async createCliente(clienteData) {
        // El modelo ya maneja la verificación de contacto y username duplicados
        // y el hasheo de la contraseña. El rol por defecto es 'cliente'.
        const newCliente = await ClienteModel.create(clienteData);
        return newCliente; // El modelo ya devuelve el cliente sin la contraseña hasheada
    }

    /**
     * Autentica a un cliente y genera un JSON Web Token (JWT).
     * El JWT incluye el ID del cliente y su rol.
     * @param {string} username - Nombre de usuario del cliente.
     * @param {string} password - Contraseña en texto plano del cliente.
     * @returns {Promise<object|null>} Un objeto que contiene el cliente (sin contraseña) y el token JWT si la autenticación es exitosa, o null si falla.
     * @throws {Error} Si las credenciales son inválidas o hay un error.
     */
    async loginCliente(username, password) {
        // 1. Buscar al cliente por nombre de usuario
        const cliente = await ClienteModel.findByUsername(username);

        // Si no se encuentra el cliente, las credenciales son inválidas
        if (!cliente) {
            throw new Error('Credenciales inválidas.');
        }

        // 2. Comparar la contraseña proporcionada con la contraseña hasheada almacenada
        const isPasswordValid = await ClienteModel.comparePassword(password, cliente.password);

        // Si las contraseñas no coinciden, las credenciales son inválidas
        if (!isPasswordValid) {
            throw new Error('Credenciales inválidas.');
        }

        // 3. Generar el JSON Web Token (JWT)
        // El payload del token DEBE contener el ID del cliente y su rol para la autorización
        const tokenPayload = {
            id: cliente.id_cliente,
            username: cliente.username,
            role: cliente.role // <-- ¡Importante: Incluir el rol aquí!
        };

        // Firma el token con la clave secreta y establece una expiración
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        // Si la autenticación es exitosa, retornar el cliente (sin contraseña) y el token
        const { password: _, ...clienteWithoutPassword } = cliente; // Excluye la contraseña
        return { cliente: clienteWithoutPassword, token };
    }

    /**
     * Obtiene todos los clientes (método original sin paginación/búsqueda).
     * @returns {Promise<Array<object>>} Un array de clientes (sin contraseñas).
     */
    async getAllClientes() {
        const clientes = await ClienteModel.findAll();
        return clientes;
    }

    /**
     * Obtiene clientes con opciones de filtrado, búsqueda y paginación.
     * Este es el NUEVO método para la funcionalidad extendida.
     * @param {object} filters - Objeto con los filtros a aplicar (ej: { searchTerm: 'juan', email: 'test@example.com' }).
     * @param {number} page - El número de página actual.
     * @param {number} limit - La cantidad de clientes por página.
     * @returns {Promise<object>} Un objeto que contiene 'data' (array de clientes) y 'pagination' (metadatos de paginación).
     */
    async getPaginatedAndFilteredClientes(filters, page, limit) {
        const clientes = await ClienteModel.findPaginatedAndFiltered(filters, page, limit);
        return clientes;
    }

    /**
     * Obtiene un cliente por su ID.
     * @param {string} id_cliente - ID del cliente.
     * @returns {Promise<object|null>} El cliente encontrado (sin contraseña) o null.
     */
    async getClienteById(id_cliente) {
        const cliente = await ClienteModel.findById(id_cliente); // Por defecto no incluye contraseña
        if (!cliente) {
            throw new Error('Cliente no encontrado.');
        }
        return cliente;
    }

    /**
     * Actualiza los datos de un cliente.
     * Permite actualizar la contraseña, que será hasheada por el modelo.
     * @param {string} id_cliente - ID del cliente a actualizar.
     * @param {object} updateData - Datos a actualizar.
     * @returns {Promise<object>} El cliente actualizado (sin contraseña hasheada).
     * @throws {Error} Si el cliente no existe o si el contacto/username ya está en uso.
     */
    async updateCliente(id_cliente, updateData) {
        const existingCliente = await ClienteModel.findById(id_cliente, true);

        if (!existingCliente) {
            throw new Error('Cliente no encontrado para actualizar.');
        }

        // Verificar si se intenta actualizar el contacto y si el nuevo contacto ya está en uso
        if (updateData.contacto && updateData.contacto !== existingCliente.contacto) {
            const clientWithNewContact = await ClienteModel.findByContacto(updateData.contacto);
            if (clientWithNewContact && clientWithNewContact.id_cliente !== id_cliente) {
                throw new Error('El nuevo contacto ya está registrado para otro cliente.');
            }
        }

        // Verificar si se intenta actualizar el username y si el nuevo username ya está en uso
        if (updateData.username && updateData.username !== existingCliente.username) {
            const clientWithNewUsername = await ClienteModel.findByUsername(updateData.username);
            if (clientWithNewUsername && clientWithNewUsername.id_cliente !== id_cliente) {
                throw new Error('El nuevo nombre de usuario ya está en uso.');
            }
        }

        const success = await ClienteModel.update(id_cliente, updateData);
        if (!success) {
            throw new Error('No se pudo actualizar el cliente.');
        }

        const updatedCliente = await ClienteModel.findById(id_cliente);
        return updatedCliente;
    }

    /**
     * Elimina un cliente.
     * @param {string} id_cliente - ID del cliente a eliminar.
     * @returns {Promise<boolean>} True si se eliminó, false si no se encontró.
     * @throws {Error} Si el cliente no existe.
     */
    async deleteCliente(id_cliente) {
        const success = await ClienteModel.delete(id_cliente);
        if (!success) {
            throw new Error('Cliente no encontrado para eliminar.');
        }
        return true;
    }
}

// Exporta una instancia de la clase para que sea un singleton
export default new ClienteService();
