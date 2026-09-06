import { Router } from 'express';
import { listarArchivosController, subirArchivoController } from '../controllers/archivo.controller.ts';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.ts';
import { uploadArchivo } from '../middlewares/upload.middleware.ts';

const router = Router();

// Listar archivos de una solicitud: los 3 roles pueden verlos.
router.get('/solicitud/:solicitudId', authMiddleware, requireRole('OPERATIVO', 'DIRECTOR', 'ENLACE'), listarArchivosController);

// Subir un archivo: OPERATIVO sube evidencia, DIRECTOR sube la respuesta oficial.
router.post('/solicitud/:solicitudId', authMiddleware, requireRole('OPERATIVO', 'DIRECTOR'), uploadArchivo.single('archivo'), subirArchivoController);

export default router;