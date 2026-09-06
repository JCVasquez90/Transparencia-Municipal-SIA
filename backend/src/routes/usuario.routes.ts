import { Router } from 'express';
import { listarUsuariosController, crearUsuarioController, editarUsuarioController } from '../controllers/usuario.controller.ts';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.ts';

const router = Router();

// Listar, crear y editar usuarios: solo accesible para el rol ENLACE.
router.get('/', authMiddleware, requireRole('ENLACE'), listarUsuariosController);
router.post('/', authMiddleware, requireRole('ENLACE'), crearUsuarioController);
router.patch('/:id', authMiddleware, requireRole('ENLACE'), editarUsuarioController);

export default router;