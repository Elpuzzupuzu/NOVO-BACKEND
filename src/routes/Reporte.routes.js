// src/routes/report.routes.js

import { Router } from 'express';
import ReportController from '../controllers/Reporte.controller.js';
import authenticateToken from '../middlewares/authMiddleware.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';

const router = Router();

// Todas las rutas de reportes serán protegidas por autenticación y autorización.
// Generalmente, solo 'gerente' y 'admin' deberían tener acceso a estos resúmenes.

// GET /NOVO/reports/cotizaciones/summary - Resumen de cotizaciones por estado
router.get('/cotizaciones/summary', authenticateToken, authorizeRoles('gerente', 'admin'), ReportController.getCotizacionesSummary);

// GET /NOVO/reports/trabajos/summary - Resumen de trabajos por estado
router.get('/trabajos/summary', authenticateToken, authorizeRoles('gerente', 'admin'), ReportController.getTrabajosSummary);

// GET /NOVO/reports/materiales/pending-purchase - Materiales pendientes de compra
router.get('/materiales/pending-purchase', authenticateToken, authorizeRoles('empleado', 'gerente', 'admin'), ReportController.getMaterialesPendienteCompra);

// GET /NOVO/reports/overall-summary - Resumen consolidado para el dashboard
router.get('/overall-summary', authenticateToken, authorizeRoles('gerente', 'admin'), ReportController.getOverallDashboardSummary);

export default router;
