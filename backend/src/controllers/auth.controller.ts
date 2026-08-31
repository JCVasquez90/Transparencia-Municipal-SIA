import { Request, Response } from 'express';
import { login } from '../services/auth.service.ts';
import { loginSchema } from '../dtos/auth.dto.ts';

export async function loginController(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Datos inválidos',
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const resultado = await login(parsed.data);
    return res.status(200).json({ success: true, data: resultado });
  } catch (error: any) {
    if (error.codigo === 'CREDENCIALES_INVALIDAS') {
      return res.status(401).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Error al iniciar sesión', error: error?.message });
  }
}