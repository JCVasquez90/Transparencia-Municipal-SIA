import { z } from 'zod';

export const crearSolicitudSchema = z.object({
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
    })
    .refine((fecha) => {
      const [año, mes, dia] = fecha.split('-').map(Number);
      const fechaIngresada = new Date(año, mes - 1, dia);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      return fechaIngresada <= hoy;
    }, {
      message: 'La fecha de recepción no puede ser una fecha futura',
    }),
  descripcion: z.string().trim().min(1, 'La descripción es obligatoria'),
  departamentoId: z.number().int().positive(),
});

export type CrearSolicitudDto = z.infer<typeof crearSolicitudSchema>;

export const listarSolicitudesQuerySchema = z.object({
  estado: z.preprocess(
    (val) => (typeof val === 'string' ? val.toUpperCase() : val),
    z.enum(['VERDE', 'AMARILLO', 'ROJO', 'VENCIDO', 'CERRADO']).optional()
  ),
});

export type ListarSolicitudesQueryDto = z.infer<typeof listarSolicitudesQuerySchema>;

export const responderSolicitudSchema = z.object({
  contenidoRespuesta: z.string().trim().min(1, 'El contenido de la respuesta no puede estar vacío'),
});

export type ResponderSolicitudDto = z.infer<typeof responderSolicitudSchema>;

export const solicitarProrrogaSchema = z.object({
  fundamentos: z.string().trim().min(1, 'Los fundamentos de la prórroga son obligatorios'),
});

export type SolicitarProrrogaDto = z.infer<typeof solicitarProrrogaSchema>;

export const firmarSolicitudSchema = z.object({
  firma: z.string().trim().min(1, 'La firma es obligatoria'),
});

export type FirmarSolicitudDto = z.infer<typeof firmarSolicitudSchema>;

export const crearSubtareaSchema = z.object({
  departamentoId: z.number().int().positive('El departamentoId debe ser un número positivo'),
  descripcion: z.string().trim().min(1, 'La descripción es obligatoria'),
});

export type CrearSubtareaDto = z.infer<typeof crearSubtareaSchema>;

export const responderSubtareaSchema = z.object({
  contenidoRespuesta: z.string().trim().min(1, 'El contenido de la respuesta es obligatorio'),
});

export type ResponderSubtareaDto = z.infer<typeof responderSubtareaSchema>;