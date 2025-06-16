// src/routes/empleado.routes.js

import { Router } from 'express';
import EmpleadoController from '../controllers/Empleado.controller.js';
import authenticateToken from '../middlewares/authMiddleware.js';
// Importa el nuevo middleware de autorización
import authorizeRoles from '../middlewares/authorizeRoles.js';

const router = Router();

// Todas las rutas de empleados serán protegidas por autenticación y autorización
// Solo roles 'gerente' y 'admin' pueden ver y actualizar empleados.
// Solo 'admin' puede crear o eliminar empleados.

// POST /NOVO/empleados - Crear un nuevo empleado
router.post('/', authenticateToken, authorizeRoles('admin'), EmpleadoController.createEmpleado);

// GET /NOVO/empleados - Obtener todos los empleados (método original sin paginación/búsqueda)
router.get('/', authenticateToken, authorizeRoles('gerente', 'admin'), EmpleadoController.getAllEmpleados);

// NUEVA RUTA: GET /NOVO/empleados/search - Obtener empleados con paginación y búsqueda
// Esta ruta maneja los query parameters para searchTerm, page, limit, activo y role
router.get('/search', authenticateToken, authorizeRoles('gerente', 'admin'), EmpleadoController.getPaginatedAndFilteredEmpleadosController);

// GET /NOVO/empleados/:id_empleado - Obtener un empleado por su ID
router.get('/:id_empleado', authenticateToken, authorizeRoles('gerente', 'admin'), EmpleadoController.getEmpleadoById);

// PUT /NOVO/empleados/:id_empleado - Actualizar un empleado por su ID
router.put('/:id_empleado', authenticateToken, authorizeRoles('gerente', 'admin'), EmpleadoController.updateEmpleado);

// DELETE /NOVO/empleados/:id_empleado - Eliminar un empleado por su ID
router.delete('/:id_empleado', authenticateToken, authorizeRoles('admin'), EmpleadoController.deleteEmpleado);

export default router;
