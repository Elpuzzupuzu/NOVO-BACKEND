// src/routes/material.routes.js

import { Router } from 'express';
import MaterialController from '../controllers/Material.controller.js';
import authenticateToken from '../middlewares/authMiddleware.js';
// Importa el nuevo middleware de autorización
import authorizeRoles from '../middlewares/authorizeRoles.js';

const router = Router();

// Todas las rutas de materiales serán protegidas por autenticación y autorización
// Solo roles 'empleado', 'gerente', 'admin' pueden realizar operaciones con materiales.

// POST /NOVO/materiales - Crear un nuevo material
router.post('/', authenticateToken, authorizeRoles('empleado', 'gerente', 'admin'), MaterialController.createMaterial);

// GET /NOVO/materiales - Obtener todos los materiales
router.get('/', authenticateToken, authorizeRoles('empleado', 'gerente', 'admin'), MaterialController.getAllMaterials);

// GET /NOVO/materiales/:id_material - Obtener un material por su ID
router.get('/:id_material', authenticateToken, authorizeRoles('empleado', 'gerente', 'admin'), MaterialController.getMaterialById);

// GET /NOVO/materiales/codigo/:codigo - Obtener un material por su código por defecto
router.get('/codigo/:codigo', authenticateToken, authorizeRoles('empleado', 'gerente', 'admin'), MaterialController.getMaterialByCodigo);

// PUT /NOVO/materiales/:id_material - Actualizar un material por su ID
router.put('/:id_material', authenticateToken, authorizeRoles('empleado', 'gerente', 'admin'), MaterialController.updateMaterial);

// DELETE /NOVO/materiales/:id_material - Eliminar un material por su ID
router.delete('/:id_material', authenticateToken, authorizeRoles('admin'), MaterialController.deleteMaterial); // Solo admin puede eliminar

export default router;
