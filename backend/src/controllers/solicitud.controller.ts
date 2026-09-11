import { Request, Response } from 'express';
import {
  crearSolicitud,
  listarSolicitudes,
  obtenerSolicitudPorId,
  responderSolicitud,
  solicitarProrroga,
  obtenerKPIs,
  firmarSolicitud,
  crearSubtarea,
  listarSubtareas,
  responderSubtarea,
  consolidarSubtareas,
  marcarEnAmparo,
} from '../services/solicitud.service.ts';
import {
  crearSolicitudSchema,
  listarSolicitudesQuerySchema,
  responderSolicitudSchema,
  solicitarProrrogaSchema,
  firmarSolicitudSchema,
  crearSubtareaSchema,
  responderSubtareaSchema,
} from '../dtos/solicitud.dto.ts';

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
    const solicitud = await crearSolicitud(parsed.data, req.usuario!.id);
    return res.status(201).json({ success: true, data: solicitud });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      // El folio se genera automáticamente, pero si hay duplicado (muy raro)
      return res.status(409).json({ success: false, message: 'El folio generado automáticamente ya existe. Intente nuevamente.' });
    }
    if (error?.code === 'P2003') {
      return res.status(400).json({ success: false, message: 'El departamentoId indicado no existe' });
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

export async function solicitarProrrogaController(req: Request, res: Response) {
  const id = Number(req.params.id);
  const parsed = solicitarProrrogaSchema.safeParse(req.body);

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
    const resultado = await solicitarProrroga(id, parsed.data, req.usuario!.id);
    return res.status(200).json({ success: true, data: resultado });
  } catch (error: any) {
    if (error.codigo === 'SOLICITUD_NO_ENCONTRADA') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.codigo === 'SOLICITUD_YA_RESPONDIDA' || error.codigo === 'PRORROGA_YA_ACTIVA' || error.codigo === 'PLAZO_YA_VENCIDO') {
      return res.status(409).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Error al solicitar la prórroga', error: error?.message });
  }
}

export async function obtenerKPIsController(req: Request, res: Response) {
  try {
    const kpis = await obtenerKPIs();
    return res.status(200).json({ success: true, data: kpis });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error al obtener los KPIs', error: error?.message });
  }
}

export async function firmarSolicitudController(req: Request, res: Response) {
  const id = Number(req.params.id);
  const parsed = firmarSolicitudSchema.safeParse(req.body);

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
    const solicitud = await firmarSolicitud(id, parsed.data, req.usuario!.id);
    return res.status(200).json({ success: true, data: solicitud });
  } catch (error: any) {
    if (error.codigo === 'SOLICITUD_NO_ENCONTRADA') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.codigo === 'SOLICITUD_NO_RESPONDIDA') {
      return res.status(409).json({ success: false, message: error.message });
    }
    if (error.codigo === 'SOLICITUD_YA_FIRMADA') {
      return res.status(409).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Error al firmar la solicitud', error: error?.message });
  }
}

// ============================================
// CONTROLADORES PARA SUBTAREAS
// ============================================

export async function crearSubtareaController(req: Request, res: Response) {
  const solicitudId = Number(req.params.id);
  const parsed = crearSubtareaSchema.safeParse(req.body);

  if (isNaN(solicitudId)) {
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
    const subtarea = await crearSubtarea(solicitudId, parsed.data, req.usuario!.id);
    return res.status(201).json({ success: true, data: subtarea });
  } catch (error: any) {
    if (error.codigo === 'SOLICITUD_NO_ENCONTRADA') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.codigo === 'SOLICITUD_YA_RESPONDIDA') {
      return res.status(409).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Error al crear la subtarea', error: error?.message });
  }
}

export async function listarSubtareasController(req: Request, res: Response) {
  const solicitudId = Number(req.params.id);

  if (isNaN(solicitudId)) {
    return res.status(400).json({ success: false, message: 'El id debe ser un número' });
  }

  try {
    const subtareas = await listarSubtareas(solicitudId);
    return res.status(200).json({ success: true, data: subtareas });
  } catch (error: any) {
    if (error.codigo === 'SOLICITUD_NO_ENCONTRADA') {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Error al listar las subtareas', error: error?.message });
  }
}

export async function responderSubtareaController(req: Request, res: Response) {
  const subtareaId = Number(req.params.id);
  const parsed = responderSubtareaSchema.safeParse(req.body);

  if (isNaN(subtareaId)) {
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
    const subtarea = await responderSubtarea(subtareaId, parsed.data, req.usuario!.id);
    return res.status(200).json({ success: true, data: subtarea });
  } catch (error: any) {
    if (error.codigo === 'SUBTAREA_NO_ENCONTRADA') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.codigo === 'SUBTAREA_YA_RESPONDIDA') {
      return res.status(409).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Error al responder la subtarea', error: error?.message });
  }
}

export async function consolidarSubtareasController(req: Request, res: Response) {
  const solicitudId = Number(req.params.id);

  if (isNaN(solicitudId)) {
    return res.status(400).json({ success: false, message: 'El id debe ser un número' });
  }

  try {
    const solicitud = await consolidarSubtareas(solicitudId, req.usuario!.id);
    return res.status(200).json({ success: true, data: solicitud });
  } catch (error: any) {
    if (error.codigo === 'SOLICITUD_NO_ENCONTRADA') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.codigo === 'SIN_SUBTAREAS' || error.codigo === 'SUBTAREAS_PENDIENTES') {
      return res.status(409).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Error al consolidar las subtareas', error: error?.message });
  }
}

export async function marcarEnAmparoController(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'El id debe ser un número' });
  }

  try {
    const solicitud = await marcarEnAmparo(id, req.usuario!.id);
    return res.status(200).json({ success: true, data: solicitud });
  } catch (error: any) {
    if (error.codigo === 'SOLICITUD_NO_ENCONTRADA') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.codigo === 'SOLICITUD_NO_RESPONDIDA') {
      return res.status(409).json({ success: false, message: error.message });
    }
    if (error.codigo === 'SOLICITUD_YA_EN_AMPARO') {
      return res.status(409).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Error al marcar en amparo', error: error?.message });
  }
}