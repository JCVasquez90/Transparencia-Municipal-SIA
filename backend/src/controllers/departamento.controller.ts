import { Request, Response } from 'express';
import { prisma } from '../index.ts';

export async function listarDepartamentos(req: Request, res: Response) {
  try {
    const departamentos = await prisma.departamento.findMany({
      orderBy: { nombre: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: departamentos,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los departamentos',
      error: error?.message,
    });
  }
}