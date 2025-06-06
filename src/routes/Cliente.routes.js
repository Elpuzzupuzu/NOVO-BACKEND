// src/routes/cliente.routes.js

import { Router } from 'express';
import ClienteController from '../controllers/Cliente.controller.js';
// Importa el middleware de autenticación
import authenticateToken from '../middlewares/authMiddleware.js';

const router = Router();

// Rutas Públicas (no requieren autenticación)
// POST /NOVO/clientes/register - Crear un nuevo cliente (registro)
router.post('/register', ClienteController.createCliente);

// POST /NOVO/clientes/login - Autenticar un cliente
router.post('/login', ClienteController.loginCliente);


// Rutas Protegidas (requieren un JWT válido)
// Para proteger una ruta, simplemente inserta el middleware 'authenticateToken' antes del controlador.

// GET /NOVO/clientes - Obtener todos los clientes
// SOLO un usuario autenticado puede ver todos los clientes
router.get('/', authenticateToken, ClienteController.getAllClientes);

// GET /NOVO/clientes/:id_cliente - Obtener un cliente por su ID
// SOLO un usuario autenticado puede obtener un cliente específico
router.get('/:id_cliente', authenticateToken, ClienteController.getClienteById);

// PUT /NOVO/clientes/:id_cliente - Actualizar un cliente por su ID
// SOLO un usuario autenticado puede actualizar un cliente
router.put('/:id_cliente', authenticateToken, ClienteController.updateCliente);

// DELETE /NOVO/clientes/:id_cliente - Eliminar un cliente por su ID
// SOLO un usuario autenticado puede eliminar un cliente
router.delete('/:id_cliente', authenticateToken, ClienteController.deleteCliente);


export default router;
