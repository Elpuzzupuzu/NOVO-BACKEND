// src/routes/cliente.routes.js

import { Router } from 'express';
import ClienteController from '../controllers/Cliente.controller.js';
import authenticateToken from '../middlewares/authMiddleware.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';

const router = Router();

// Rutas Públicas (no requieren autenticación)
// POST /NOVO/clientes/register - Crear un nuevo cliente (registro)
router.post('/register', ClienteController.createCliente);

// ELIMINADO: La ruta de login de clientes se ha movido a auth.routes.js


// Rutas Protegidas (requieren un JWT válido)
// Para todas estas rutas, primero se verifica la autenticación (JWT válido)
// Luego, se verifica la autorización (si el rol del usuario es permitido)

// GET /NOVO/clientes - Obtener todos los clientes
// Solo roles 'gerente' o 'admin' pueden ver todos los clientes
router.get('/', authenticateToken, authorizeRoles('gerente', 'admin'), ClienteController.getAllClientes);

// GET /NOVO/clientes/:id_cliente - Obtener un cliente por su ID
// Cualquier usuario autenticado puede obtener su propio perfil.
// Un 'gerente' o 'admin' puede obtener cualquier perfil.
// NOTA: La lógica para "solo su propio perfil" debe ir en el controlador o servicio
router.get('/:id_cliente', authenticateToken, authorizeRoles('cliente', 'gerente', 'admin'), ClienteController.getClienteById);

// PUT /NOVO/clientes/:id_cliente - Actualizar un cliente por su ID
// Similar a GET, un cliente puede actualizar su propio perfil, gerentes/admins cualquier perfil.
router.put('/:id_cliente', authenticateToken, authorizeRoles('cliente', 'gerente', 'admin'), ClienteController.updateCliente);

// DELETE /NOVO/clientes/:id_cliente - Eliminar un cliente por su ID
// Solo roles 'admin' pueden eliminar clientes (operación sensible)
router.delete('/:id_cliente', authenticateToken, authorizeRoles('admin'), ClienteController.deleteCliente);


export default router;
