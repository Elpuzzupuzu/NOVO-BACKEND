// src/services/Auth.service.js

// Importa los modelos necesarios para la autenticación
import ClienteModel from '../models/Cliente.model.js';       // Para buscar y crear clientes
import EmpleadoAuthModel from '../models/EmpleadoAuth.model.js'; // Para buscar empleados y comparar contraseñas
// Importa jsonwebtoken para crear y firmar tokens
import jwt from 'jsonwebtoken';
// Importa dotenv para acceder a las variables de entorno
import dotenv from 'dotenv';
dotenv.config();

class AuthService {
    /**
     * Genera un JSON Web Token (JWT) con el payload dado.
     * @param {object} payload - Los datos a incluir en el token (ej: { id, username, role }).
     * @returns {string} El token JWT generado.
     */
    generateToken(payload) {
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });
        return token;
    }

    /**
     * Autentica a un cliente y genera un JWT.
     * @param {string} username - Nombre de usuario del cliente.
     * @param {string} password - Contraseña en texto plano.
     * @returns {Promise<object>} Un objeto con el cliente (sin password) y el token.
     * @throws {Error} Si las credenciales son inválidas.
     */
    async loginCliente(username, password) {
        const cliente = await ClienteModel.findByUsername(username);

        if (!cliente) {
            throw new Error('Credenciales inválidas.');
        }

        const isPasswordValid = await ClienteModel.comparePassword(password, cliente.password);
        if (!isPasswordValid) {
            throw new Error('Credenciales inválidas.');
        }

        const tokenPayload = {
            id: cliente.id_cliente,
            username: cliente.username,
            role: cliente.role
        };

        const token = this.generateToken(tokenPayload);

        const { password: _, ...clienteWithoutPassword } = cliente;
        return { user: clienteWithoutPassword, token };
    }

    /**
     * Autentica a un empleado y genera un JWT.
     * @param {string} username - Nombre de usuario del empleado.
     * @param {string} password - Contraseña en texto plano.
     * @returns {Promise<object>} Un objeto con el empleado (sin password) y el token.
     * @throws {Error} Si las credenciales son inválidas.
     */
    async loginEmpleado(username, password) {
        const empleado = await EmpleadoAuthModel.findByUsername(username);

        if (!empleado) {
            throw new Error('Credenciales inválidas.');
        }

        const isPasswordValid = await EmpleadoAuthModel.comparePassword(password, empleado.password);
        if (!isPasswordValid) {
            throw new Error('Credenciales inválidas.');
        }

        const tokenPayload = {
            id: empleado.id_empleado,
            username: empleado.username, // Asumiendo que Empleados también tendrán 'username' para login
            role: empleado.role
        };

        const token = this.generateToken(tokenPayload);

        const { password: _, ...empleadoWithoutPassword } = empleado;
        return { user: empleadoWithoutPassword, token };
    }

    /**
     * Registra un nuevo cliente en la base de datos.
     * @param {object} userData - Datos del cliente a registrar (username, password, email, nombre, contacto, apellido, direccion, foto_perfil_url).
     * @returns {Promise<object>} El objeto del cliente recién creado (sin la contraseña).
     * @throws {Error} Si el nombre de usuario, email o contacto ya existen, o si la validación falla.
     */
    async registerClient(userData) {
        // Desestructuramos los campos clave para validaciones explícitas, incluyendo 'contacto'.
        const { username, email, contacto } = userData;

        // 1. Verificar si el nombre de usuario ya existe
        const existingClientByUsername = await ClienteModel.findByUsername(username);
        if (existingClientByUsername) {
            throw new Error('El nombre de usuario ya existe. Por favor, elige otro.');
        }

        // 2. Verificar si el email ya existe (recomendado para evitar duplicados)
        // Asegúrate de que ClienteModel.findByEmail() esté implementado en tu modelo.
        const existingClientByEmail = await ClienteModel.findByEmail(email);
        if (existingClientByEmail) {
            throw new Error('Ya existe una cuenta con este email.');
        }

        // 3. Verificar si el contacto ya existe (CRÍTICO, ya que es UNIQUE y NOT NULL en la DB)
        // Asegúrate de que ClienteModel.findByContacto() esté implementado en tu modelo.
        const existingClientByContacto = await ClienteModel.findByContacto(contacto);
        if (existingClientByContacto) {
            throw new Error('El número de contacto ya está registrado.');
        }

        // 4. Crear el nuevo cliente en la base de datos
        // ClienteModel.create() debe manejar el hashing de la contraseña
        // y el mapeo de todos los campos de userData a las columnas de la DB.
        const newClient = await ClienteModel.create({
            ...userData,
            role: 'cliente' // Asignar el rol por defecto de 'cliente'
        });

        // Retorna el cliente creado, excluyendo la contraseña
        const { password: _, ...clientWithoutPassword } = newClient;
        return clientWithoutPassword;
    }
}

export default new AuthService();