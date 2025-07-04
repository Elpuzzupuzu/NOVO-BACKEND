// src/routes/trabajo.routes.js

import { Router } from 'express';
import TrabajoController from '../controllers/Trabajo.controller.js';
import authenticateToken from '../middlewares/authMiddleware.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';

const router = Router();

// Todas las rutas de trabajos serán protegidas por autenticación y autorización.
// Asumimos que solo 'empleado', 'gerente', 'admin' pueden gestionar trabajos.

// =========================================================
// RUTAS PARA EL DASHBOARD (más específicas, deben ir PRIMERO)
// =========================================================

// GET /NOVO/trabajos/activos-count - Obtener el número total de trabajos activos
// ESTA RUTA DEBE IR ANTES DE /:id_trabajo
router.get('/activos-count', authenticateToken, authorizeRoles('empleado', 'gerente', 'admin'), TrabajoController.getTrabajosActivosCountController);

// GET /NOVO/trabajos/completados-count - Obtener el número total de trabajos completados
// ESTA RUTA TAMBIÉN DEBE IR ANTES DE /:id_trabajo
router.get('/completados-count', authenticateToken, authorizeRoles('empleado', 'gerente', 'admin'), TrabajoController.getTrabajosCompletadosCountController);


// =========================================================
// OTRAS RUTAS (más generales o con parámetros)
// =========================================================

// POST /NOVO/trabajos - Crear un nuevo trabajo
router.post('/', authenticateToken, authorizeRoles('empleado', 'gerente', 'admin'), TrabajoController.createTrabajo);

// GET /NOVO/trabajos - Obtener todos los trabajos (con filtros)
router.get('/', authenticateToken, authorizeRoles('empleado', 'gerente', 'admin'), TrabajoController.getAllTrabajos);

// GET /NOVO/trabajos/:id_trabajo - Obtener un trabajo por su ID
// Esta ruta debe ir DESPUÉS de las rutas fijas como '/activos-count' y '/completados-count'
router.get('/:id_trabajo', authenticateToken, authorizeRoles('empleado', 'gerente', 'admin'), TrabajoController.getTrabajoById);

// PUT /NOVO/trabajos/:id_trabajo - Actualizar un trabajo por su ID
router.put('/:id_trabajo', authenticateToken, authorizeRoles('empleado', 'gerente', 'admin'), TrabajoController.updateTrabajo);

// DELETE /NOVO/trabajos/:id_trabajo - Eliminar un trabajo por su ID
// La eliminación de trabajos es una operación sensible, limitarla a 'admin' o 'gerente'
router.delete('/:id_trabajo', authenticateToken, authorizeRoles('gerente', 'admin'), TrabajoController.deleteTrabajo);

export default router;
