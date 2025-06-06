// src/middlewares/authMiddleware.js

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config(); // Carga las variables de entorno

/**
 * Middleware para verificar la validez de un JSON Web Token (JWT).
 * Si el token es válido, adjunta el ID del usuario al objeto 'req' y permite continuar.
 * Si el token no es válido o no está presente, devuelve un error 401 o 403.
 */
const authenticateToken = (req, res, next) => {
    // 1. Obtener el encabezado de autorización
    const authHeader = req.headers['authorization']; // Ej: "Bearer EL_TOKEN_AQUI"

    // 2. Verificar si el encabezado existe y tiene el formato "Bearer <token>"
    // Si no hay encabezado o no comienza con 'Bearer ', es una petición no autorizada
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acceso no autorizado: No se proporcionó token o el formato es inválido.' });
    }

    // 3. Extraer el token (eliminar "Bearer " del inicio)
    const token = authHeader.split(' ')[1]; // Obtiene solo la parte del token

    // 4. Verificar el token
    // jwt.verify(token, secretKey, callback)
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        // Si hay un error al verificar (token inválido, expirado, etc.)
        if (err) {
            console.error('Error al verificar token JWT:', err.message);
            // 'TokenExpiredError' si el token ha expirado
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expirado. Por favor, inicie sesión de nuevo.' });
            }
            // Cualquier otro error de verificación del token
            return res.status(403).json({ message: 'Acceso prohibido: Token inválido.' }); // 403 Forbidden
        }

        // Si el token es válido, la información decodificada (payload) está en 'user'
        // Adjuntar el ID del usuario al objeto de la petición para que los controladores lo usen
        // Esto es útil para saber qué usuario está haciendo la petición
        req.user = user;
        // console.log('Token decodificado:', req.user); // Para depuración

        // Llamar a 'next()' para pasar el control al siguiente middleware o al controlador de la ruta
        next();
    });
};

export default authenticateToken;
