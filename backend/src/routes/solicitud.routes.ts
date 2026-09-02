import { Router } from 'express';
import { crearSolicitudController, listarSolicitudesController, obtenerSolicitudPorIdController, responderSolicitudController, solicitarProrrogaController } from '../controllers/solicitud.controller.ts';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.ts';

const router = Router();

// Listar solicitudes (opcionalmente filtradas por ?estado=verde|amarillo|rojo|vencido)
router.get('/', authMiddleware, requireRole('OPERATIVO', 'DIRECTOR', 'ENLACE'), listarSolicitudesController);

// Crear una solicitud
router.post('/', authMiddleware, requireRole('OPERATIVO'), crearSolicitudController);

// Ruta para obtener una solicitud por ID
router.get('/:id', authMiddleware, requireRole('OPERATIVO', 'DIRECTOR', 'ENLACE'), obtenerSolicitudPorIdController);

//Ruta para responder solicitud

router.patch('/:id/responder', authMiddleware, requireRole('DIRECTOR'), responderSolicitudController);

// Ruta para solicitar prorroga
router.post('/:id/prorroga', authMiddleware, requireRole('ENLACE'), solicitarProrrogaController);

export default router;