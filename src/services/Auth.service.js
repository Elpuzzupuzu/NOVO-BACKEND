// src/services/Auth.service.js

// Importa los modelos necesarios para la autenticación
import ClienteModel from '../models/Cliente.model.js';     // Para buscar clientes
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
}

export default new AuthService();
