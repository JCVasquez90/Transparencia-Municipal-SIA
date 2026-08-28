import { Router } from 'express';

const router = Router();

// Ruta de prueba para solicitudes
router.get('/', (req, res) => {
  res.json({ message: 'Ruta de solicitudes funcionando' });
});

// Ruta para crear una solicitud (ejemplo)
router.post('/', (req, res) => {
  res.json({ message: 'Solicitud creada (ejemplo)' });
});

// Ruta para obtener una solicitud por ID
router.get('/:id', (req, res) => {
  res.json({ message: `Detalle de solicitud ${req.params.id}` });
});

export default router;