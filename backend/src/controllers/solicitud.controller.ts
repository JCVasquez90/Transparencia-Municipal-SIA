import { Request, Response } from 'express';
import { crearSolicitud, listarSolicitudes, obtenerSolicitudPorId, responderSolicitud } from '../services/solicitud.service.ts';
import { crearSolicitudSchema, listarSolicitudesQuerySchema, responderSolicitudSchema } from '../dtos/solicitud.dto.ts';

export async function crearSolicitudController(req: Request, res: Response) {
  const parsed = crearSolicitudSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Datos inválidos',
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const solicitud = await crearSolicitud(parsed.data);
    return res.status(201).json({ success: true, data: solicitud });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ success: false, message: `Ya existe una solicitud con el folio "${parsed.data.folio}"` });
    }
    if (error?.code === 'P2003') {
      return res.status(400).json({ success: false, message: 'El usuarioId o departamentoId indicado no existe' });
    }
    return res.status(500).json({ success: false, message: 'Error al crear la solicitud', error: error?.message });
  }
}

export async function listarSolicitudesController(req: Request, res: Response) {
  const parsedQuery = listarSolicitudesQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    return res.status(400).json({
      success: false,
      message: 'Parámetro de consulta inválido (estado debe ser VERDE, AMARILLO, ROJO o VENCIDO)',
      errors: parsedQuery.error.flatten().fieldErrors,
    });
  }

  try {
    const solicitudes = await listarSolicitudes(parsedQuery.data.estado);
    return res.status(200).json({ success: true, data: solicitudes });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error al listar las solicitudes', error: error?.message });
  }
}

export async function obtenerSolicitudPorIdController(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'El id debe ser un número' });
  }

  try {
    const solicitud = await obtenerSolicitudPorId(id);

    if (!solicitud) {
      return res.status(404).json({ success: false, message: `No existe una solicitud con id ${id}` });
    }

    return res.status(200).json({ success: true, data: solicitud });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error al obtener la solicitud', error: error?.message });
  }
}

export async function responderSolicitudController(req: Request, res: Response) {
  const id = Number(req.params.id);
  const parsed = responderSolicitudSchema.safeParse(req.body);

  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'El id debe ser un número' });
  }

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Datos inválidos',
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const solicitud = await responderSolicitud(id, parsed.data, req.usuario!.id);
    return res.status(200).json({ success: true, data: solicitud });
  } catch (error: any) {
    if (error.codigo === 'SOLICITUD_NO_ENCONTRADA') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.codigo === 'SOLICITUD_YA_RESPONDIDA') {
      return res.status(409).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Error al responder la solicitud', error: error?.message });
  }
}