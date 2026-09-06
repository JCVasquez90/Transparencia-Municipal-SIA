import bcrypt from 'bcryptjs';
import { prisma } from '../index.ts';
import { TipoAccion } from '../../generated/prisma/enums.ts';
import type { CrearUsuarioDto, EditarUsuarioDto } from '../dtos/usuario.dto.ts';

const SALT_ROUNDS = 10;

const usuarioSinPassword = {
  id: true,
  nombre: true,
  email: true,
  rol: true,
  departamentoId: true,
  departamento: true,
};

export async function listarUsuarios() {
  return prisma.usuario.findMany({
    select: usuarioSinPassword,
    orderBy: { nombre: 'asc' },
  });
}

export async function crearUsuario(datos: CrearUsuarioDto, usuarioIdQueCrea: number) {
  const existente = await prisma.usuario.findUnique({ where: { email: datos.email } });

  if (existente) {
    const error: any = new Error('Ya existe un usuario con ese email');
    error.codigo = 'EMAIL_YA_EXISTE';
    throw error;
  }

  const passwordHash = await bcrypt.hash(datos.password, SALT_ROUNDS);

  return prisma.$transaction(async (tx) => {
    const nuevoUsuario = await tx.usuario.create({
      data: {
        nombre: datos.nombre,
        email: datos.email,
        passwordHash,
        rol: datos.rol,
        departamentoId: datos.departamentoId,
      },
      select: usuarioSinPassword,
    });

    await tx.log.create({
      data: {
        usuarioId: usuarioIdQueCrea,
        accion: TipoAccion.CREAR_USUARIO,
        detalle: `Creó al usuario "${nuevoUsuario.nombre}" (${nuevoUsuario.email}) con rol ${nuevoUsuario.rol}`,
      },
    });

    return nuevoUsuario;
  });
}

export async function editarUsuario(id: number, datos: EditarUsuarioDto, usuarioIdQueEdita: number) {
  const usuarioActual = await prisma.usuario.findUnique({ where: { id } });

  if (!usuarioActual) {
    const error: any = new Error('No existe un usuario con ese id');
    error.codigo = 'USUARIO_NO_ENCONTRADO';
    throw error;
  }

  if (datos.email && datos.email !== usuarioActual.email) {
    const emailEnUso = await prisma.usuario.findUnique({ where: { email: datos.email } });
    if (emailEnUso) {
      const error: any = new Error('Ya existe un usuario con ese email');
      error.codigo = 'EMAIL_YA_EXISTE';
      throw error;
    }
  }

  const data: Record<string, unknown> = {
    nombre: datos.nombre,
    email: datos.email,
    rol: datos.rol,
    departamentoId: datos.departamentoId,
  };

  if (datos.password) {
    data.passwordHash = await bcrypt.hash(datos.password, SALT_ROUNDS);
  }

  return prisma.$transaction(async (tx) => {
    const actualizado = await tx.usuario.update({
      where: { id },
      data,
      select: usuarioSinPassword,
    });

    await tx.log.create({
      data: {
        usuarioId: usuarioIdQueEdita,
        accion: TipoAccion.EDITAR_USUARIO,
        detalle: `Editó al usuario "${actualizado.nombre}" (${actualizado.email})`,
      },
    });

    return actualizado;
  });
}