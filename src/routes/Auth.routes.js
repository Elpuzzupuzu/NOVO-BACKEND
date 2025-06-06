// src/routes/auth.routes.js

import { Router } from 'express';
// Importa el nuevo controlador de autenticación
import AuthController from '../controllers/Auth.controller.js';

const router = Router();

// Rutas de autenticación (públicas)

// POST /NOVO/auth/client/login - Login para clientes
router.post('/cliente/login', AuthController.loginCliente);

// POST /NOVO/auth/employee/login - Login para empleados
router.post('/empleado/login', AuthController.loginEmpleado);

export default router;
