import fs from 'fs';
import path from 'path';
import { fileTypeFromBuffer } from 'file-type';
import { prisma } from '../index.ts';
import { TipoAccion } from '../../generated/prisma/enums.ts';
import type { SubirArchivoDto } from '../dtos/archivo.dto.ts';

const TIPOS_REALES_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png'];

export async function listarArchivosPorSolicitud(solicitudId: number) {
  const solicitud = await prisma.solicitud.findUnique({ where: { id: solicitudId } });

  if (!solicitud) {
    const error: any = new Error('No existe una solicitud con ese id');
    error.codigo = 'SOLICITUD_NO_ENCONTRADA';
    throw error;
  }

  return prisma.archivo.findMany({
    where: { solicitudId },
    orderBy: { id: 'asc' },
  });
}

export async function subirArchivo(
  solicitudId: number,
  datos: SubirArchivoDto,
  archivo: Express.Multer.File,
  usuarioId: number,
) {
  const solicitud = await prisma.solicitud.findUnique({ where: { id: solicitudId } });

  if (!solicitud) {
    fs.unlinkSync(archivo.path);
    const error: any = new Error('No existe una solicitud con ese id');
    error.codigo = 'SOLICITUD_NO_ENCONTRADA';
    throw error;
  }

  // Verifica el contenido real del archivo, no solo lo que el cliente declaró.
  const buffer = fs.readFileSync(archivo.path);
  const tipoReal = await fileTypeFromBuffer(buffer);

  if (!tipoReal || !TIPOS_REALES_PERMITIDOS.includes(tipoReal.mime)) {
    fs.unlinkSync(archivo.path); // Borra el archivo ya guardado en disco, no era lo que decía ser.
    const error: any = new Error('El contenido del archivo no coincide con un PDF, JPG o PNG válido');
    error.codigo = 'TIPO_ARCHIVO_INVALIDO';
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const nuevoArchivo = await tx.archivo.create({
      data: {
        nombre: archivo.originalname,
        ruta: archivo.filename,
        tipo: datos.tipo,
        solicitudId,
      },
    });

    await tx.log.create({
      data: {
        usuarioId,
        accion: TipoAccion.SUBIR_ARCHIVO,
        detalle: `Subió el archivo "${archivo.originalname}" (${datos.tipo}) a la solicitud #${solicitudId}`,
      },
    });

    return nuevoArchivo;
  });
}