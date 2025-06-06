// src/middlewares/authorizeRoles.js

/**
 * Middleware para autorizar el acceso a rutas basándose en los roles del usuario.
 * @param {...string} allowedRoles - Una lista de roles permitidos para acceder a la ruta.
 * @returns {function} Un middleware de Express.
 */
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // req.user viene del 'authenticateToken' middleware,
        // que debería haber sido ejecutado antes de este.
        // Contiene { id, username, role }.
        if (!req.user || !req.user.role) {
            // Esto no debería ocurrir si authenticateToken funciona correctamente,
            // pero es una salvaguarda.
            return res.status(401).json({ message: 'No autenticado o rol no disponible.' });
        }

        // Verificar si el rol del usuario está en la lista de roles permitidos
        if (allowedRoles.includes(req.user.role)) {
            // Si el rol es permitido, pasar al siguiente middleware/controlador
            next();
        } else {
            // Si el rol no es permitido, devolver un error 403 Forbidden
            res.status(403).json({ message: 'Acceso prohibido: No tienes los permisos necesarios.' });
        }
    };
};

export default authorizeRoles;
