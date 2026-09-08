import { Router } from 'express';
import { 
  crearSolicitudController, 
  listarSolicitudesController, 
  obtenerSolicitudPorIdController, 
  responderSolicitudController, 
  solicitarProrrogaController,
  obtenerKPIsController  // ← Importar el nuevo controlador
} from '../controllers/solicitud.controller.ts';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.ts';

const router = Router();

// ============================================
// RUTAS ESPECÍFICAS (DEBEN IR PRIMERO)
// ============================================

// 1. KPIs - DEBE IR ANTES DE /:id
router.get('/kpis', authMiddleware, requireRole('OPERATIVO', 'DIRECTOR', 'ENLACE'), obtenerKPIsController);

// 2. Listar solicitudes (con filtros)
router.get('/', authMiddleware, requireRole('OPERATIVO', 'DIRECTOR', 'ENLACE'), listarSolicitudesController);

// 3. Crear una solicitud
router.post('/', authMiddleware, requireRole('OPERATIVO'), crearSolicitudController);

// ============================================
// RUTAS DINÁMICAS (CON :ID) - DEBEN IR DESPUÉS
// ============================================

// 4. Obtener una solicitud por ID
router.get('/:id', authMiddleware, requireRole('OPERATIVO', 'DIRECTOR', 'ENLACE'), obtenerSolicitudPorIdController);

// 5. Responder una solicitud
router.patch('/:id/responder', authMiddleware, requireRole('DIRECTOR'), responderSolicitudController);

// 6. Solicitar prórroga
router.post('/:id/prorroga', authMiddleware, requireRole('ENLACE'), solicitarProrrogaController);

export default router;