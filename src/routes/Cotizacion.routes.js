// src/routes/cotizacion.routes.js

import { Router } from 'express';
import CotizacionController from '../controllers/Cotizacion.controller.js';
import authenticateToken from '../middlewares/authMiddleware.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';

const router = Router();

// =========================================================
// RUTAS PARA EL DASHBOARD (más específicas, deben ir PRIMERO)
// =========================================================

// GET /NOVO/cotizaciones/total - Obtener el número total de cotizaciones
router.get('/total', authenticateToken, authorizeRoles('gerente', 'admin'), CotizacionController.getTotalCotizacionesController);

// GET /NOVO/cotizaciones/ingresos-por-mes?year=YYYY&estados=estado1,estado2 - Obtener ingresos estimados por mes
router.get('/ingresos-por-mes', authenticateToken, authorizeRoles('gerente', 'admin'), CotizacionController.getIngresosEstimadosPorMesController);

// =========================================================
// NUEVA RUTA PARA EL CLIENTE AUTENTICADO
// =========================================================

// GET /NOVO/cotizaciones/my-cotizaciones - Obtener las cotizaciones del cliente autenticado
// Esta ruta usa el ID del cliente del token y está protegida por auth y roles
router.get('/my-cotizaciones', authenticateToken, authorizeRoles('cliente'), CotizacionController.getMyCotizaciones);


// =========================================================
// OTRAS RUTAS (más generales o con parámetros)
// =========================================================

// POST /NOVO/cotizaciones - Crear una nueva cotización
router.post('/', authenticateToken, authorizeRoles('empleado', 'gerente', 'admin','cliente'), CotizacionController.createCotizacion);

// GET /NOVO/cotizaciones - Obtener todas las cotizaciones (con filtros y paginación)
// Esta ruta es para que admins/gerentes vean TODAS las cotizaciones
router.get('/', authenticateToken, authorizeRoles('gerente', 'admin'), CotizacionController.getAllCotizaciones);

// GET /NOVO/cotizaciones/:id_cotizacion - Obtener una cotización por su ID
// Esta ruta debe ir DESPUÉS de las rutas fijas para evitar conflictos.
router.get('/:id_cotizacion', authenticateToken, authorizeRoles('cliente', 'empleado', 'gerente', 'admin'), CotizacionController.getCotizacionById);

// PUT /NOVO/cotizaciones/:id_cotizacion - Actualizar una cotización por su ID
router.put('/:id_cotizacion', authenticateToken, authorizeRoles('gerente', 'admin'), CotizacionController.updateCotizacion);

// DELETE /NOVO/cotizaciones/:id_cotizacion - Eliminar una cotización por su ID
router.delete('/:id_cotizacion', authenticateToken, authorizeRoles('admin'), CotizacionController.deleteCotizacion);

export default router;