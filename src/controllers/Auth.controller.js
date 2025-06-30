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

    /**
     * Maneja el registro de nuevos clientes.
     * @param {object} req - Objeto de solicitud (debería contener username, password, email, nombre, contacto, apellido, direccion, foto_perfil_url).
     * @param {object} res - Objeto de respuesta.
     */
    async registerClient(req, res) {
        try {
            // Desestructurar todos los campos posibles del body, utilizando 'contacto'
            const {
                username,
                password,
                email,
                nombre,
                apellido,
                contacto, // <-- Campo 'contacto' ahora
                direccion,
                foto_perfil_url
            } = req.body;

            // Validar que los campos mínimos requeridos (NOT NULL en la DB) estén presentes.
            // 'contacto' está incluido aquí. 'email' no es requerido si es NULLABLE en tu DB.
            if (!username || !password || !nombre || !contacto) {
                return res.status(400).json({ message: 'Nombre de usuario, contraseña, nombre y contacto son requeridos para el registro.' });
            }

            // Llama al servicio de autenticación para registrar el cliente
            // Se pasa un objeto con los nombres de las columnas de la DB, incluyendo 'contacto'.
            const newClient = await AuthService.registerClient({
                username,
                password,
                email,          // Se pasa si está presente en req.body (puede ser null)
                nombre,
                apellido,       // Se pasa si está presente en req.body (puede ser null)
                contacto,       // <-- Se pasa 'contacto'
                direccion,      // Se pasa si está presente en req.body (puede ser null)
                foto_perfil_url // Se pasa si está presente en req.body (puede ser null)
            });

            // Si el registro es exitoso, envía una respuesta 201 Created
            // No envíes la contraseña en la respuesta
            const { password: _, ...clientData } = newClient;
            res.status(201).json({
                message: 'Cliente registrado exitosamente. Ahora puedes iniciar sesión.',
                user: clientData // Devuelve los datos del cliente registrado (sin contraseña)
            });

        } catch (error) {
            // Manejo de errores específicos
            // Los mensajes de error ahora pueden incluir 'contacto' si es duplicado
            if (error.message.includes('ya existe')) {
                return res.status(409).json({ message: error.message }); // 409 Conflict si el usuario, email o contacto ya existen
            }
            if (error.message.includes('inválido')) {
                return res.status(400).json({ message: error.message }); // 400 Bad Request para validación
            }
            console.error('Error en AuthController.registerClient:', error);
            res.status(500).json({ message: 'Error interno del servidor durante el registro de cliente.', error: error.message });
        }
    }
}

export default new AuthController();