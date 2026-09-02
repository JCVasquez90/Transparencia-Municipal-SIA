import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../index.ts';
import type { LoginDto } from '../dtos/auth.dto.ts';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '8h') as jwt.SignOptions['expiresIn'];

export async function login(datos: LoginDto) {
  const usuario = await prisma.usuario.findUnique({ where: { email: datos.email } });

  if (!usuario) {
    const error: any = new Error('Credenciales inválidas');
    error.codigo = 'CREDENCIALES_INVALIDAS';
    throw error;
  }

  const passwordValida = await bcrypt.compare(datos.password, usuario.passwordHash);

  if (!passwordValida) {
    const error: any = new Error('Credenciales inválidas');
    error.codigo = 'CREDENCIALES_INVALIDAS';
    throw error;
  }

  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    },
  };
}