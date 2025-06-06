// src/routes/cotizacion.routes.js

import { Router } from 'express';
import CotizacionController from '../controllers/Cotizacion.controller.js';
import authenticateToken from '../middlewares/authMiddleware.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';

const router = Router();

// Rutas de cotizaciones protegidas por autenticación y autorización.

// POST /NOVO/cotizaciones - Crear una nueva cotización
// Solo empleados, gerentes, o admins pueden crear cotizaciones
router.post('/', authenticateToken, authorizeRoles('empleado', 'gerente', 'admin'), CotizacionController.createCotizacion);

// GET /NOVO/cotizaciones - Obtener todas las cotizaciones (con filtros)
// Solo gerentes y admins pueden ver TODAS las cotizaciones
router.get('/', authenticateToken, authorizeRoles('gerente', 'admin'), CotizacionController.getAllCotizaciones);

// GET /NOVO/cotizaciones/:id_cotizacion - Obtener una cotización por su ID
// Los clientes pueden ver sus propias cotizaciones, gerentes y admins pueden ver cualquiera.
// La lógica para "solo su propia cotización" debe ir en el controlador/servicio si se desea restringir
router.get('/:id_cotizacion', authenticateToken, authorizeRoles('cliente', 'empleado', 'gerente', 'admin'), CotizacionController.getCotizacionById);

// PUT /NOVO/cotizaciones/:id_cotizacion - Actualizar una cotización por su ID
// Solo gerentes y admins pueden actualizar cotizaciones (o quizás empleados con ciertos permisos)
router.put('/:id_cotizacion', authenticateToken, authorizeRoles('gerente', 'admin'), CotizacionController.updateCotizacion);

// DELETE /NOVO/cotizaciones/:id_cotizacion - Eliminar una cotización por su ID
// La eliminación de cotizaciones es una operación muy sensible, limitar a 'admin'
router.delete('/:id_cotizacion', authenticateToken, authorizeRoles('admin'), CotizacionController.deleteCotizacion);

export default router;
