import { Router } from 'express';
import {
  obtenerNoLeidas,
  marcarComoLeida,
  marcarTodasComoLeidas,
} from '../controllers/notificacion.controller.ts';
import { authMiddleware } from '../middlewares/auth.middleware.ts';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/no-leidas', obtenerNoLeidas);
router.patch('/:id/leer', marcarComoLeida);
router.patch('/marcar-todas', marcarTodasComoLeidas);

export default router;