import { Request, Response } from 'express';
import { listarUsuarios, crearUsuario, editarUsuario } from '../services/usuario.service.ts';
import { crearUsuarioSchema, editarUsuarioSchema } from '../dtos/usuario.dto.ts';

export async function listarUsuariosController(req: Request, res: Response) {
  try {
    const usuarios = await listarUsuarios();
    return res.status(200).json({ success: true, data: usuarios });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error al listar los usuarios', error: error?.message });
  }
}

export async function crearUsuarioController(req: Request, res: Response) {
  const parsed = crearUsuarioSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Datos inválidos',
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const usuario = await crearUsuario(parsed.data, req.usuario!.id);
    return res.status(201).json({ success: true, data: usuario });
  } catch (error: any) {
    if (error?.codigo === 'EMAIL_YA_EXISTE') {
      return res.status(409).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Error al crear el usuario', error: error?.message });
  }
}

export async function editarUsuarioController(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'El id debe ser un número' });
  }

  const parsed = editarUsuarioSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Datos inválidos',
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const usuario = await editarUsuario(id, parsed.data, req.usuario!.id);
    return res.status(200).json({ success: true, data: usuario });
  } catch (error: any) {
    if (error?.codigo === 'USUARIO_NO_ENCONTRADO') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error?.codigo === 'EMAIL_YA_EXISTE') {
      return res.status(409).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Error al editar el usuario', error: error?.message });
  }
}