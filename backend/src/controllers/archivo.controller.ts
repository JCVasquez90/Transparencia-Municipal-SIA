import { Request, Response } from 'express';
import { listarArchivosPorSolicitud, subirArchivo } from '../services/archivo.service.ts';
import { subirArchivoSchema } from '../dtos/archivo.dto.ts';

export async function listarArchivosController(req: Request, res: Response) {
  const solicitudId = Number(req.params.solicitudId);

  if (isNaN(solicitudId)) {
    return res.status(400).json({ success: false, message: 'El solicitudId debe ser un número' });
  }

  try {
    const archivos = await listarArchivosPorSolicitud(solicitudId);
    return res.status(200).json({ success: true, data: archivos });
  } catch (error: any) {
    if (error?.codigo === 'SOLICITUD_NO_ENCONTRADA') {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Error al listar los archivos', error: error?.message });
  }
}

export async function subirArchivoController(req: Request, res: Response) {
  const solicitudId = Number(req.params.solicitudId);

  if (isNaN(solicitudId)) {
    return res.status(400).json({ success: false, message: 'El solicitudId debe ser un número' });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Debes adjuntar un archivo' });
  }

  const parsed = subirArchivoSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Datos inválidos',
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const archivo = await subirArchivo(solicitudId, parsed.data, req.file, req.usuario!.id);
    return res.status(201).json({ success: true, data: archivo });
  } catch (error: any) {
    if (error?.codigo === 'SOLICITUD_NO_ENCONTRADA') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error?.codigo === 'TIPO_ARCHIVO_INVALIDO') {
  return res.status(400).json({ success: false, message: error.message });
}
    return res.status(500).json({ success: false, message: 'Error al subir el archivo', error: error?.message });
  }
}