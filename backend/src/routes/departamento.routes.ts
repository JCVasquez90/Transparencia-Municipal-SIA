import { Router } from 'express';
import { listarDepartamentos } from '../controllers/departamento.controller.ts';
import { authMiddleware } from '../middlewares/auth.middleware.ts';

const router = Router();

// Obtener todos los departamentos (requiere autenticación)
router.get('/', authMiddleware, listarDepartamentos);

export default router;