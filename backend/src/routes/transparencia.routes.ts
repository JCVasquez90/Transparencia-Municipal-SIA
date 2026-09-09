import { Router } from 'express';
import {
  listarItems,
  listarCargas,
  crearCarga,
  aprobarCarga,
  rechazarCarga,
  publicarCarga,
  obtenerCargaPorId
} from '../controllers/transparencia.controller.ts';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.ts';
import { generarAlertasController } from '../controllers/transparencia.controller.ts';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// ============================================
// ÍTEMS DE TRANSPARENCIA
// ============================================

// GET /api/transparencia/items - Listar todos los ítems
router.get('/items', listarItems);

//Ruta para generaralertas manuales (solo ENLACE O admin)
router.post('/alertas/generar', requireRole('ENLACE'), generarAlertasController);


// ============================================
// CARGAS MENSUALES
// ============================================

// GET /api/transparencia/cargas/:itemId - Listar cargas de un ítem
router.get('/cargas/:itemId', listarCargas);

// POST /api/transparencia/cargas - Crear una nueva carga (solo OPERATIVO)
router.post('/cargas', requireRole('OPERATIVO'), crearCarga);

// PATCH /api/transparencia/cargas/:id/aprobar - Aprobar una carga (solo DIRECTOR)
router.patch('/cargas/:id/aprobar', requireRole('DIRECTOR'), aprobarCarga);

// PATCH /api/transparencia/cargas/:id/rechazar - Rechazar una carga (solo DIRECTOR)
router.patch('/cargas/:id/rechazar', requireRole('DIRECTOR'), rechazarCarga);

// PATCH /api/transparencia/cargas/:id/publicar - Publicar una carga (solo ENLACE)
router.patch('/cargas/:id/publicar', requireRole('ENLACE'), publicarCarga);

// Obtener una carga por ID
router.get('/carga/:id', authMiddleware, requireRole('OPERATIVO', 'DIRECTOR', 'ENLACE'), obtenerCargaPorId);

export default router;