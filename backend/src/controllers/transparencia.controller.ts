import { Request, Response } from 'express';
import { prisma } from '../index.ts';

// ============================================
// LISTAR ÍTEMS DE TRANSPARENCIA
// ============================================

export async function listarItems(req: Request, res: Response) {
  try {
    const items = await prisma.itemTransparencia.findMany({
      include: {
        departamentoResponsable: true,
      },
      orderBy: { nombre: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los ítems de transparencia',
      error: error?.message,
    });
  }
}

// ============================================
// LISTAR CARGAS MENSUALES DE UN ÍTEM
// ============================================

export async function listarCargas(req: Request, res: Response) {
  const itemId = Number(req.params.itemId);

  if (isNaN(itemId)) {
    return res.status(400).json({
      success: false,
      message: 'El itemId debe ser un número',
    });
  }

  try {
    const cargas = await prisma.cargaMensual.findMany({
      where: { itemId },
      include: {
        usuario: true,
        item: true,
      },
      orderBy: { fechaCarga: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: cargas,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener las cargas mensuales',
      error: error?.message,
    });
  }
}

// ============================================
// CREAR UNA CARGA MENSUAL (SOLO OPERATIVO)
// ============================================

export async function crearCarga(req: Request, res: Response) {
  const { itemId, mes, anio } = req.body;
  const usuarioId = req.usuario?.id;

  if (!usuarioId) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado',
    });
  }

  if (!itemId || !mes || !anio) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos requeridos: itemId, mes, anio',
    });
  }

  try {
    const carga = await prisma.cargaMensual.create({
      data: {
        itemId,
        mes,
        anio,
        estado: 'PENDIENTE',
        usuarioId,
      },
      include: {
        usuario: true,
        item: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: carga,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al crear la carga mensual',
      error: error?.message,
    });
  }
}

// ============================================
// APROBAR UNA CARGA (SOLO DIRECTOR)
// ============================================

export async function aprobarCarga(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: 'El id debe ser un número',
    });
  }

  try {
    const carga = await prisma.cargaMensual.update({
      where: { id },
      data: { estado: 'APROBADA' },
      include: {
        usuario: true,
        item: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: carga,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al aprobar la carga',
      error: error?.message,
    });
  }
}

// ============================================
// RECHAZAR UNA CARGA (SOLO DIRECTOR)
// ============================================

export async function rechazarCarga(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: 'El id debe ser un número',
    });
  }

  try {
    const carga = await prisma.cargaMensual.update({
      where: { id },
      data: { estado: 'RECHAZADA' },
      include: {
        usuario: true,
        item: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: carga,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al rechazar la carga',
      error: error?.message,
    });
  }
}

// ============================================
// PUBLICAR UNA CARGA (SOLO ENLACE)
// ============================================

export async function publicarCarga(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: 'El id debe ser un número',
    });
  }

  try {
    const carga = await prisma.cargaMensual.update({
      where: { id },
      data: { estado: 'PUBLICADA' },
      include: {
        usuario: true,
        item: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: carga,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al publicar la carga',
      error: error?.message,
    });
  }
}