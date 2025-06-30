// src/routes/auth.routes.js

import { Router } from 'express';
// Importa el nuevo controlador de autenticación
import AuthController from '../controllers/Auth.controller.js';

const router = Router();

// Rutas de autenticación (públicas)

// POST /NOVO/auth/cliente/login - Login para clientes
router.post('/cliente/login', AuthController.loginCliente);

// POST /NOVO/auth/empleado/login - Login para empleados
router.post('/empleado/login', AuthController.loginEmpleado);

// --- NUEVA RUTA: POST /NOVO/auth/cliente/register - Registro de nuevos clientes ---
router.post('/cliente/register', AuthController.registerClient);

export default router;