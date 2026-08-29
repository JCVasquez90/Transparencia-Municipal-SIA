import { prisma } from '../index.ts';
import { sumarDiasHabiles, diasHabilesEntre, EstadoSemaforo } from '../utils/fechas.utils.ts';
import { TipoAccion } from '../../generated/prisma/enums.ts';
import type { CrearSolicitudDto } from '../dtos/solicitud.dto.ts';

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

export async function listarSolicitudes(estadoSemaforo?: ReturnType<typeof EstadoSemaforo>) {
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
    const diasHabiles = diasHabilesEntre(solicitud.fechaRecepcion, hoy);
    const semaforo = EstadoSemaforo(diasHabiles);
    return { ...solicitud, diasHabiles, semaforo };
  });

  if (estadoSemaforo) {
    return conSemaforo.filter((s) => s.semaforo === estadoSemaforo.toUpperCase());
  }

  return conSemaforo;
}