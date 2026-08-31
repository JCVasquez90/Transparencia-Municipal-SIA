import { prisma } from '../index.ts';
import { sumarDiasHabiles, diasHabilesEntre } from '../utils/fechas.utils.ts';
import { calcularSemaforo } from './semaforo.service.ts';
import { TipoAccion } from '../../generated/prisma/enums.ts';
import type { EstadoSemaforo } from '../utils/fechas.utils.ts';
import type { CrearSolicitudDto, ResponderSolicitudDto } from '../dtos/solicitud.dto.ts';

export async function crearSolicitud(datos: CrearSolicitudDto) {
  const fechaRecepcion = new Date(datos.fechaRecepcion);
  const plazoLimite = sumarDiasHabiles(fechaRecepcion, 20);

  const solicitud = await prisma.$transaction(async (tx) => {
    const nuevaSolicitud = await tx.solicitud.create({
      data: {
        folio: datos.folio.trim(),
        fechaRecepcion,
        descripcion: datos.descripcion.trim(),
        plazoLimite,
        usuarioId: datos.usuarioId,
        departamentoId: datos.departamentoId,
      },
    });

    await tx.log.create({
      data: {
        usuarioId: datos.usuarioId,
        accion: TipoAccion.CREAR_SOLICITUD,
      },
    });

    return nuevaSolicitud;
  });

  return solicitud;
}

export async function listarSolicitudes(estadoSemaforo?: EstadoSemaforo) {
  const solicitudes = await prisma.solicitud.findMany({
    include: {
      departamento: true,
    },
    orderBy: {
      fechaRecepcion: 'asc',
    },
  });

  const hoy = new Date();

const conSemaforo = solicitudes.map((solicitud) => {
  const { diasHabiles, semaforo } = calcularSemaforo(solicitud.fechaRecepcion, hoy);
  return { ...solicitud, diasHabiles, semaforo };
});

  if (estadoSemaforo) {
    return conSemaforo.filter((s) => s.semaforo === estadoSemaforo.toUpperCase());
  }

  return conSemaforo;
}

export async function obtenerSolicitudPorId(id: number) {
  const solicitud = await prisma.solicitud.findUnique({
    where: { id },
    include: {
      departamento: true,
    },
  });

  if (!solicitud) {
    return null;
  }

  const hoy = new Date();
const { diasHabiles, semaforo } = calcularSemaforo(solicitud.fechaRecepcion, hoy);

return { ...solicitud, diasHabiles, semaforo };
}

export async function responderSolicitud(id: number, datos: ResponderSolicitudDto, usuarioId: number) {
  const solicitudActual = await prisma.solicitud.findUnique({ where: { id } });

  if (!solicitudActual) {
    const error: any = new Error('No existe una solicitud con ese id');
    error.codigo = 'SOLICITUD_NO_ENCONTRADA';
    throw error;
  }

  if (solicitudActual.estado === 'RESPONDIDA') {
    const error: any = new Error('La solicitud ya fue respondida anteriormente');
    error.codigo = 'SOLICITUD_YA_RESPONDIDA';
    throw error;
  }

  const fechaRespuesta = new Date();

  const solicitud = await prisma.$transaction(async (tx) => {
    const actualizada = await tx.solicitud.update({
      where: { id },
      data: {
        estado: 'RESPONDIDA',
        contenidoRespuesta: datos.contenidoRespuesta,
        fechaRespuesta,
      },
    });

    const diasHabiles = diasHabilesEntre(solicitudActual.fechaRecepcion, fechaRespuesta);
    const conAtraso = fechaRespuesta > solicitudActual.plazoLimite;

    await tx.log.create({
      data: {
        usuarioId,
        accion: TipoAccion.RESPONDER_SOLICITUD,
        detalle: conAtraso
          ? `Respondió la solicitud con atraso (${diasHabiles} días hábiles desde la recepción)`
          : `Respondió la solicitud dentro del plazo (${diasHabiles} días hábiles desde la recepción)`,
      },
    });

    return actualizada;
  });

  return solicitud;
}