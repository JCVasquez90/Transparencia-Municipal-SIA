import { z } from 'zod';

export const subirArchivoSchema = z.object({
  tipo: z.enum(['EVIDENCIA_SOLICITUD', 'RESPUESTA'], {
    message: 'El tipo debe ser EVIDENCIA_SOLICITUD o RESPUESTA',
  }),
});

export type SubirArchivoDto = z.infer<typeof subirArchivoSchema>;