import { Router } from 'express';
import {
  crearSolicitudController,
  listarSolicitudesController,
  obtenerSolicitudPorIdController,
  responderSolicitudController,
  solicitarProrrogaController,
  obtenerKPIsController,
  firmarSolicitudController,
  crearSubtareaController,
  listarSubtareasController,
  responderSubtareaController,
  consolidarSubtareasController,
  marcarEnAmparoController,
} from '../controllers/solicitud.controller.ts';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.ts';

const router = Router();

// ============================================
// RUTAS ESPECÍFICAS (DEBEN IR PRIMERO)
// ============================================

// 1. KPIs 
router.get('/kpis', authMiddleware, requireRole('OPERATIVO', 'DIRECTOR', 'ENLACE'), obtenerKPIsController);

// 2. Listar solicitudes
router.get('/', authMiddleware, requireRole('OPERATIVO', 'DIRECTOR', 'ENLACE'), listarSolicitudesController);

// 3. Crear solicitud
router.post('/', authMiddleware, requireRole('OPERATIVO'), crearSolicitudController);

// ============================================
// RUTAS PARA SUBTAREAS
// ============================================

// Crear una subtarea (solo ENLACE)
router.post('/:id/subtareas', authMiddleware, requireRole('ENLACE'), crearSubtareaController);

// Listar subtareas de una solicitud (todos)
router.get('/:id/subtareas', authMiddleware, requireRole('OPERATIVO', 'DIRECTOR', 'ENLACE'), listarSubtareasController);

// Consolidar subtareas (solo ENLACE)
router.post('/:id/consolidar', authMiddleware, requireRole('ENLACE'), consolidarSubtareasController);

// Responder una subtarea (solo DIRECTOR)
router.patch('/subtareas/:id/responder', authMiddleware, requireRole('DIRECTOR'), responderSubtareaController);

// ============================================
// RUTAS DINÁMICAS (CON :ID)
// ============================================

// 4. Obtener solicitud por ID
router.get('/:id', authMiddleware, requireRole('OPERATIVO', 'DIRECTOR', 'ENLACE'), obtenerSolicitudPorIdController);

// 5. Responder solicitud
router.patch('/:id/responder', authMiddleware, requireRole('DIRECTOR'), responderSolicitudController);

// 6. Solicitar prórroga
router.post('/:id/prorroga', authMiddleware, requireRole('ENLACE'), solicitarProrrogaController);

// 7. FIRMAR SOLICITUD (DEBE IR DESPUÉS DE /:id)
router.patch('/:id/firmar', authMiddleware, requireRole('DIRECTOR'), firmarSolicitudController);

// Marcar en amparo (solo ENLACE)
router.patch('/:id/amparo', authMiddleware, requireRole('ENLACE'), marcarEnAmparoController);

export default router;