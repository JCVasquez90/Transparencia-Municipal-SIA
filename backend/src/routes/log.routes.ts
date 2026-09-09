import { Router } from 'express';
import { listarLogsController } from '../controllers/log.controller.ts';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.ts';

const router = Router();

// Listar logs de auditoría — solo ENLACE puede ver el historial completo
router.get('/', authMiddleware, requireRole('ENLACE'), listarLogsController);

export default router;