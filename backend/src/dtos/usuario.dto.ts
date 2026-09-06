import { z } from 'zod';

const rolEnum = z.enum(['OPERATIVO', 'DIRECTOR', 'ENLACE']);

export const crearUsuarioSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  email: z.string().trim().email('El email no es válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  rol: rolEnum,
  departamentoId: z.number().int().positive('El departamentoId debe ser un número positivo'),
});

export const editarUsuarioSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').optional(),
  email: z.string().trim().email('El email no es válido').optional(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').optional(),
  rol: rolEnum.optional(),
  departamentoId: z.number().int().positive('El departamentoId debe ser un número positivo').optional(),
});

export type CrearUsuarioDto = z.infer<typeof crearUsuarioSchema>;
export type EditarUsuarioDto = z.infer<typeof editarUsuarioSchema>;