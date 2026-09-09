import { Request, Response } from 'express';
import { prisma } from '../index.ts';

export async function obtenerNoLeidas(req: Request, res: Response) {
  const usuarioId = req.usuario?.id;

  if (!usuarioId) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado',
    });
  }

  try {
    const notificaciones = await prisma.notificacion.findMany({
      where: {
        usuarioId,
        leida: false,
      },
      orderBy: {
        id: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      data: notificaciones,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener las notificaciones',
      error: error?.message,
    });
  }
}

export async function marcarComoLeida(req: Request, res: Response) {
  const id = Number(req.params.id);
  const usuarioId = req.usuario?.id;

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: 'El id debe ser un número',
    });
  }

  if (!usuarioId) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado',
    });
  }

  try {
    const notificacion = await prisma.notificacion.findFirst({
      where: {
        id,
        usuarioId,
      },
    });

    if (!notificacion) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada',
      });
    }

    await prisma.notificacion.update({
      where: { id },
      data: { leida: true },
    });

    return res.status(200).json({
      success: true,
      message: 'Notificación marcada como leída',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al marcar la notificación',
      error: error?.message,
    });
  }
}

export async function marcarTodasComoLeidas(req: Request, res: Response) {
  const usuarioId = req.usuario?.id;

  if (!usuarioId) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado',
    });
  }

  try {
    await prisma.notificacion.updateMany({
      where: {
        usuarioId,
        leida: false,
      },
      data: { leida: true },
    });

    return res.status(200).json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al marcar las notificaciones',
      error: error?.message,
    });
  }
}