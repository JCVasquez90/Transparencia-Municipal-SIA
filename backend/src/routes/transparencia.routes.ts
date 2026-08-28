import { Router } from 'express';

const router = Router();

// Ruta de prueba para transparencia activa
router.get('/', (req, res) => {
  res.json({ message: 'Ruta de transparencia activa funcionando' });
});

// Ruta para obtener cargas mensuales (ejemplo)
router.get('/cargas', (req, res) => {
  res.json({ message: 'Lista de cargas mensuales (ejemplo)' });
});

// Ruta para crear una carga mensual
router.post('/cargas', (req, res) => {
  res.json({ message: 'Carga mensual creada (ejemplo)' });
});

export default router;