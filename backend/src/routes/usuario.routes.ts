import { Router } from 'express';

const router = Router();

// Ruta de prueba para usuarios
router.get('/', (req, res) => {
  res.json({ message: 'Ruta de usuarios funcionando' });
});

// Ruta para crear un usuario (ejemplo)
router.post('/', (req, res) => {
  res.json({ message: 'Usuario creado (ejemplo)' });
});

// Ruta para obtener un usuario por ID
router.get('/:id', (req, res) => {
  res.json({ message: `Detalle de usuario ${req.params.id}` });
});

export default router;