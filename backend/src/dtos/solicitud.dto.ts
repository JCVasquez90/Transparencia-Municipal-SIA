import { z } from 'zod';

export const crearSolicitudSchema = z.object({
  folio: z.string().trim().min(1, 'El folio es obligatorio'),
  fechaRecepcion: z.string()
    .min(1, 'La fecha de recepción es obligatoria')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener el formato YYYY-MM-DD')
    .refine((fecha) => {
      const [año, mes, dia] = fecha.split('-').map(Number);
      const date = new Date(año, mes - 1, dia);
      return (
        date.getFullYear() === año &&
        date.getMonth() === mes - 1 &&
        date.getDate() === dia
      );
    }, {
      message: 'La fecha de recepción no es válida',
    }),
  descripcion: z.string().trim().min(1, 'La descripción es obligatoria'),
  usuarioId: z.number().int().positive(),
  departamentoId: z.number().int().positive(),
});

export type CrearSolicitudDto = z.infer<typeof crearSolicitudSchema>;

export const listarSolicitudesQuerySchema = z.object({
  estado: z.preprocess(
    (val) => (typeof val === 'string' ? val.toUpperCase() : val),
    z.enum(['VERDE', 'AMARILLO', 'ROJO', 'VENCIDO']).optional()
  ),
});

export type ListarSolicitudesQueryDto = z.infer<typeof listarSolicitudesQuerySchema>;