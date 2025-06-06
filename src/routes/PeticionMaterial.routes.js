// src/routes/peticionMaterial.routes.js

import { Router } from 'express';
import PeticionMaterialController from '../controllers/PeticionMaterial.controller.js';
import authenticateToken from '../middlewares/authMiddleware.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';

const router = Router();

// Todas las rutas de peticiones de material serán protegidas por autenticación y autorización.
// Solo roles 'empleado', 'gerente', 'admin' pueden gestionar peticiones.
// 'Gerente' y 'admin' tienen acceso completo, 'empleado' puede que tenga restricciones (ej. no eliminar).

// POST /NOVO/peticiones-material - Crear una nueva petición de material
router.post('/', authenticateToken, authorizeRoles('empleado', 'gerente', 'admin'), PeticionMaterialController.createPeticionMaterial);

// GET /NOVO/peticiones-material - Obtener todas las peticiones de material (con filtros)
router.get('/', authenticateToken, authorizeRoles('empleado', 'gerente', 'admin'), PeticionMaterialController.getAllPeticionesMaterial);

// GET /NOVO/peticiones-material/:id_peticion_material - Obtener una petición por su ID
router.get('/:id_peticion_material', authenticateToken, authorizeRoles('empleado', 'gerente', 'admin'), PeticionMaterialController.getPeticionMaterialById);

// PUT /NOVO/peticiones-material/:id_peticion_material - Actualizar una petición por su ID
router.put('/:id_peticion_material', authenticateToken, authorizeRoles('empleado', 'gerente', 'admin'), PeticionMaterialController.updatePeticionMaterial);

// DELETE /NOVO/peticiones-material/:id_peticion_material - Eliminar una petición por su ID
// La eliminación de peticiones es una operación sensible, limitarla a 'admin' o 'gerente'
router.delete('/:id_peticion_material', authenticateToken, authorizeRoles('gerente', 'admin'), PeticionMaterialController.deletePeticionMaterial);

export default router;
