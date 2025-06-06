// src/controllers/Auth.controller.js

// Importa el servicio de autenticación
import AuthService from '../services/Auth.service.js';

class AuthController {
    /**
     * Maneja el login de clientes.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    async loginCliente(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ message: 'Username y password son requeridos.' });
            }

            const { user, token } = await AuthService.loginCliente(username, password);
            res.status(200).json({ message: 'Login de cliente exitoso.', user, token });
        } catch (error) {
            if (error.message.includes('Credenciales inválidas')) {
                return res.status(401).json({ message: error.message });
            }
            console.error('Error en AuthController.loginCliente:', error);
            res.status(500).json({ message: 'Error interno del servidor durante el login de cliente.', error: error.message });
        }
    }

    /**
     * Maneja el login de empleados.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    async loginEmpleado(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ message: 'Username y password son requeridos.' });
            }

            const { user, token } = await AuthService.loginEmpleado(username, password);
            res.status(200).json({ message: 'Login de empleado exitoso.', user, token });
        } catch (error) {
            if (error.message.includes('Credenciales inválidas')) {
                return res.status(401).json({ message: error.message });
            }
            console.error('Error en AuthController.loginEmpleado:', error);
            res.status(500).json({ message: 'Error interno del servidor durante el login de empleado.', error: error.message });
        }
    }
}

export default new AuthController();
