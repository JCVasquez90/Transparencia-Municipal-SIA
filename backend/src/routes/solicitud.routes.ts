import { Router } from 'express';
import { crearSolicitudController, listarSolicitudesController, obtenerSolicitudPorIdController, responderSolicitudController } from '../controllers/solicitud.controller.ts';
import { authMiddleware } from '../middlewares/auth.middleware.ts';

const router = Router();

// Listar solicitudes (opcionalmente filtradas por ?estado=verde|amarillo|rojo|vencido)
router.get('/', listarSolicitudesController);

// Crear una solicitud
router.post('/', crearSolicitudController);

// Ruta para obtener una solicitud por ID
router.get('/:id', obtenerSolicitudPorIdController);

//Ruta para 

router.patch('/:id/responder', authMiddleware, responderSolicitudController);

export default router;