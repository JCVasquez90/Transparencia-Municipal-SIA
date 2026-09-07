import { Request, Response } from 'express';
import { listarLogs } from '../services/log.service.ts';

export async function listarLogsController(req: Request, res: Response) {
  try {
    const logs = await listarLogs();
    res.status(200).json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener el registro de auditoría',
    });
  }
}