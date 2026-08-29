import { Router } from 'express';
import { crearSolicitudController, listarSolicitudesController } from '../controllers/solicitud.controller.ts';

const router = Router();

// Listar solicitudes (opcionalmente filtradas por ?estado=verde|amarillo|rojo|vencido)
router.get('/', listarSolicitudesController);

// Crear una solicitud
router.post('/', crearSolicitudController);

// Ruta para obtener una solicitud por ID
router.get('/:id', (req, res) => {
  res.json({ message: `Detalle de solicitud ${req.params.id}` });
});

export default router;