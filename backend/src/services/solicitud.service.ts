import { prisma } from '../index.ts';
import { sumarDiasHabiles, diasHabilesEntre } from '../utils/fechas.utils.ts';
import { calcularSemaforo } from './semaforo.service.ts';
import { TipoAccion } from '../../generated/prisma/enums.ts';
import type { EstadoSemaforo } from '../utils/fechas.utils.ts';
import type {
  CrearSolicitudDto,
  ResponderSolicitudDto,
  SolicitarProrrogaDto,
  FirmarSolicitudDto,
  CrearSubtareaDto,
  ResponderSubtareaDto 
} from '../dtos/solicitud.dto.ts';

async function generarFolio(año: number): Promise<string> {
  const ultimaSolicitud = await prisma.solicitud.findFirst({
    where: { folio: { startsWith: `SIA-${año}-` } },
    orderBy: { id: 'desc' },
    select: { folio: true },
  });

  let numero = 1;
  if (ultimaSolicitud?.folio) {
    const partes = ultimaSolicitud.folio.split('-');
    const ultimoNumero = parseInt(partes[partes.length - 1], 10);
    if (!isNaN(ultimoNumero)) {
      numero = ultimoNumero + 1;
    }
  }

  const numeroFormateado = String(numero).padStart(3, '0');
  return `SIA-${año}-${numeroFormateado}`;
}

export async function crearSolicitud(datos: CrearSolicitudDto, usuarioId: number) {
  const fechaRecepcion = new Date(datos.fechaRecepcion);
  const plazoLimite = sumarDiasHabiles(fechaRecepcion, 20);
  const año = fechaRecepcion.getFullYear();

  const MAX_INTENTOS = 3;
  let intento = 0;

  while (intento < MAX_INTENTOS) {
    intento++;
    const folio = await generarFolio(año);

    try {
      const solicitud = await prisma.$transaction(async (tx) => {
        const nuevaSolicitud = await tx.solicitud.create({
          data: {
            folio,
            fechaRecepcion,
            descripcion: datos.descripcion.trim(),
            plazoLimite,
            usuarioId,
            departamentoId: datos.departamentoId,
          },
        });

        await tx.log.create({
          data: {
            usuarioId,
            accion: TipoAccion.CREAR_SOLICITUD,
            detalle: `Creó la solicitud con folio ${folio}`,
          },
        });

        return nuevaSolicitud;
      });

      return solicitud;
    } catch (error: any) {
      // P2002 = Prisma: violación de restricción única (folio duplicado por concurrencia)
      if (error?.code === 'P2002' && intento < MAX_INTENTOS) {
        continue; // reintenta generando un folio nuevo
      }
      throw error;
    }
  }

  throw new Error('No se pudo generar un folio único después de varios intentos');
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
    // Si la solicitud ya fue respondida, el semáforo se cierra
    if (solicitud.estado === 'RESPONDIDA') {
      return { ...solicitud, diasHabiles: 0, semaforo: 'CERRADO' as const };
    }

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

  // Si la solicitud ya fue respondida, el semáforo se cierra
  if (solicitud.estado === 'RESPONDIDA') {
    return { ...solicitud, diasHabiles: 0, semaforo: 'CERRADO' as const };
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

export async function solicitarProrroga(id: number, datos: SolicitarProrrogaDto, usuarioId: number) {
  const solicitudActual = await prisma.solicitud.findUnique({ where: { id } });

  if (!solicitudActual) {
    const error: any = new Error('No existe una solicitud con ese id');
    error.codigo = 'SOLICITUD_NO_ENCONTRADA';
    throw error;
  }

  if (solicitudActual.estado === 'RESPONDIDA') {
    const error: any = new Error('No se puede solicitar prórroga: la solicitud ya fue respondida');
    error.codigo = 'SOLICITUD_YA_RESPONDIDA';
    throw error;
  }

  if (solicitudActual.estado === 'PRORROGA_SOLICITADA') {
    const error: any = new Error('Esta solicitud ya tiene una prórroga activa');
    error.codigo = 'PRORROGA_YA_ACTIVA';
    throw error;
  }

  const hoy = new Date();
  if (hoy > solicitudActual.plazoLimite) {
    const error: any = new Error('No se puede solicitar prórroga: el plazo ya venció');
    error.codigo = 'PLAZO_YA_VENCIDO';
    throw error;
  }

  const nuevoPlazoLimite = sumarDiasHabiles(solicitudActual.plazoLimite, 10);

  const resultado = await prisma.$transaction(async (tx) => {
    const resolucion = await tx.resolucionExenta.create({
      data: {
        fundamentos: datos.fundamentos,
        solicitudId: id,
      },
    });

    const solicitudActualizada = await tx.solicitud.update({
      where: { id },
      data: {
        estado: 'PRORROGA_SOLICITADA',
        plazoLimite: nuevoPlazoLimite,
      },
    });

    await tx.log.create({
      data: {
        usuarioId,
        accion: TipoAccion.SOLICITAR_PRORROGA,
        detalle: `Solicitó prórroga de 10 días hábiles (Resolución Exenta N° ${resolucion.id}). Nuevo plazo límite: ${nuevoPlazoLimite.toISOString()}`,
      },
    });

    return { solicitud: solicitudActualizada, resolucionExenta: resolucion };
  });

  return resultado;
}

// ============================================
// FUNCIÓN PARA OBTENER KPIs AVANZADOS
// ============================================

export async function obtenerKPIs() {
  const solicitudes = await prisma.solicitud.findMany({
    include: {
      departamento: true,
    },
  });

  if (solicitudes.length === 0) {
    return {
      promedioPorDepartamento: [],
      tasaCumplimiento: 0,
      indiceAmparos: 0,
      totalAmparos: 0,
    };
  }

  // 1. Tiempo promedio de respuesta por departamento
  const tiempoPorDepartamento: Record<string, { total: number; count: number }> = {};

  solicitudes.forEach((solicitud) => {
    if (!solicitud.fechaRespuesta) return;
    const diasHabiles = diasHabilesEntre(solicitud.fechaRecepcion, solicitud.fechaRespuesta);
    const deptoNombre = solicitud.departamento?.nombre || 'Sin departamento';
    if (!tiempoPorDepartamento[deptoNombre]) {
      tiempoPorDepartamento[deptoNombre] = { total: 0, count: 0 };
    }
    tiempoPorDepartamento[deptoNombre].total += diasHabiles;
    tiempoPorDepartamento[deptoNombre].count += 1;
  });

  const promedioPorDepartamento = Object.entries(tiempoPorDepartamento).map(([departamento, data]) => ({
    departamento,
    promedio: data.count > 0 ? Math.round(data.total / data.count) : 0,
  }));

  // 2. Tasa de cumplimiento de plazos
  const solicitudesConPlazo = solicitudes.filter((s) => s.fechaRespuesta && s.plazoLimite);
  const cumplidas = solicitudesConPlazo.filter((s) => s.fechaRespuesta! <= s.plazoLimite);
  const tasaCumplimiento = solicitudesConPlazo.length > 0 
    ? Math.round((cumplidas.length / solicitudesConPlazo.length) * 100) 
    : 0;

  // 3. Índice de amparos (NUEVO)
  const totalRespondidas = solicitudes.filter((s) => s.estado === 'RESPONDIDA').length;
  const totalAmparos = solicitudes.filter((s) => s.enAmparo).length;
  const indiceAmparos = totalRespondidas > 0 
    ? Math.round((totalAmparos / totalRespondidas) * 100) 
    : 0;

  return {
    promedioPorDepartamento,
    tasaCumplimiento,
    indiceAmparos,
    totalAmparos,
  };
}


export async function firmarSolicitud(id: number, datos: FirmarSolicitudDto, usuarioId: number) {
  const solicitudActual = await prisma.solicitud.findUnique({ where: { id } });

  if (!solicitudActual) {
    const error: any = new Error('No existe una solicitud con ese id');
    error.codigo = 'SOLICITUD_NO_ENCONTRADA';
    throw error;
  }

  if (solicitudActual.estado !== 'RESPONDIDA') {
    const error: any = new Error('La solicitud debe estar respondida para poder firmarla');
    error.codigo = 'SOLICITUD_NO_RESPONDIDA';
    throw error;
  }

  if (solicitudActual.firma) {
    const error: any = new Error('Esta solicitud ya ha sido firmada');
    error.codigo = 'SOLICITUD_YA_FIRMADA';
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const actualizada = await tx.solicitud.update({
      where: { id },
      data: {
        firma: datos.firma,
        fechaFirma: new Date(),
      },
    });

    await tx.log.create({
      data: {
        usuarioId,
        accion: TipoAccion.RESPONDER_SOLICITUD,
        detalle: `Firmó la solicitud #${id}: "${datos.firma}"`,
      },
    });

    return actualizada;
  });
}

// ============================================
// FUNCIONES PARA SUBTAREAS
// ============================================

export async function crearSubtarea(
  solicitudId: number,
  datos: CrearSubtareaDto,
  usuarioId: number
) {
  const solicitud = await prisma.solicitud.findUnique({ where: { id: solicitudId } });

  if (!solicitud) {
    const error: any = new Error('No existe una solicitud con ese id');
    error.codigo = 'SOLICITUD_NO_ENCONTRADA';
    throw error;
  }

  if (solicitud.estado === 'RESPONDIDA') {
    const error: any = new Error('No se pueden crear subtareas en una solicitud ya respondida');
    error.codigo = 'SOLICITUD_YA_RESPONDIDA';
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const nuevaSubtarea = await tx.subtarea.create({
      data: {
        solicitudId,
        departamentoId: datos.departamentoId,
        descripcion: datos.descripcion,
        estado: 'PENDIENTE',
      },
      include: {
        departamento: true,
      },
    });

    // Cambiar el estado de la solicitud a EN_PROCESO
    await tx.solicitud.update({
      where: { id: solicitudId },
      data: { estado: 'EN_PROCESO' },
    });

    await tx.log.create({
      data: {
        usuarioId,
        accion: TipoAccion.DERIVAR_SOLICITUD,
        detalle: `Creó subtarea para el departamento "${nuevaSubtarea.departamento.nombre}"`,
      },
    });

    return nuevaSubtarea;
  });
}

export async function listarSubtareas(solicitudId: number) {
  const solicitud = await prisma.solicitud.findUnique({ where: { id: solicitudId } });

  if (!solicitud) {
    const error: any = new Error('No existe una solicitud con ese id');
    error.codigo = 'SOLICITUD_NO_ENCONTRADA';
    throw error;
  }

  return prisma.subtarea.findMany({
    where: { solicitudId },
    include: {
      departamento: true,
      usuario: {
        select: { id: true, nombre: true, email: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function responderSubtarea(
  subtareaId: number,
  datos: ResponderSubtareaDto,
  usuarioId: number
) {
  const subtareaActual = await prisma.subtarea.findUnique({ where: { id: subtareaId } });

  if (!subtareaActual) {
    const error: any = new Error('No existe una subtarea con ese id');
    error.codigo = 'SUBTAREA_NO_ENCONTRADA';
    throw error;
  }

  if (subtareaActual.estado === 'RESPONDIDA') {
    const error: any = new Error('Esta subtarea ya fue respondida');
    error.codigo = 'SUBTAREA_YA_RESPONDIDA';
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const actualizada = await tx.subtarea.update({
      where: { id: subtareaId },
      data: {
        contenidoRespuesta: datos.contenidoRespuesta,
        estado: 'RESPONDIDA',
        fechaRespuesta: new Date(),
        usuarioId,
      },
      include: {
        departamento: true,
      },
    });

    await tx.log.create({
      data: {
        usuarioId,
        accion: TipoAccion.RESPONDER_SOLICITUD,
        detalle: `Respondió la subtarea del departamento "${actualizada.departamento.nombre}"`,
      },
    });

    return actualizada;
  });
}

export async function consolidarSubtareas(solicitudId: number, usuarioId: number) {
  const solicitud = await prisma.solicitud.findUnique({
    where: { id: solicitudId },
    include: { subtareas: true },
  });

  if (!solicitud) {
    const error: any = new Error('No existe una solicitud con ese id');
    error.codigo = 'SOLICITUD_NO_ENCONTRADA';
    throw error;
  }

  if (solicitud.subtareas.length === 0) {
    const error: any = new Error('No hay subtareas para consolidar');
    error.codigo = 'SIN_SUBTAREAS';
    throw error;
  }

  const todasRespondidas = solicitud.subtareas.every((s) => s.estado === 'RESPONDIDA');

  if (!todasRespondidas) {
    const error: any = new Error('Todas las subtareas deben estar respondidas antes de consolidar');
    error.codigo = 'SUBTAREAS_PENDIENTES';
    throw error;
  }

  // Consolidar las respuestas
  const contenidoConsolidado = solicitud.subtareas
    .map((s) => `[${s.departamentoId}] ${s.contenidoRespuesta}`)
    .join('\n\n');

  return prisma.$transaction(async (tx) => {
    const actualizada = await tx.solicitud.update({
      where: { id: solicitudId },
      data: {
        estado: 'RESPONDIDA',
        contenidoRespuesta: contenidoConsolidado,
        fechaRespuesta: new Date(),
      },
    });

    await tx.log.create({
      data: {
        usuarioId,
        accion: TipoAccion.RESPONDER_SOLICITUD,
        detalle: `Consolidó ${solicitud.subtareas.length} subtareas en la solicitud #${solicitudId}`,
      },
    });

    return actualizada;
  });
}

export async function marcarEnAmparo(id: number, usuarioId: number) {
  const solicitudActual = await prisma.solicitud.findUnique({ where: { id } });

  if (!solicitudActual) {
    const error: any = new Error('No existe una solicitud con ese id');
    error.codigo = 'SOLICITUD_NO_ENCONTRADA';
    throw error;
  }

  if (solicitudActual.estado !== 'RESPONDIDA') {
    const error: any = new Error('Solo se pueden marcar en amparo las solicitudes respondidas');
    error.codigo = 'SOLICITUD_NO_RESPONDIDA';
    throw error;
  }

  if (solicitudActual.enAmparo) {
    const error: any = new Error('Esta solicitud ya está marcada en amparo');
    error.codigo = 'SOLICITUD_YA_EN_AMPARO';
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const actualizada = await tx.solicitud.update({
      where: { id },
      data: {
        enAmparo: true,
        fechaAmparo: new Date(),
      },
    });

    await tx.log.create({
      data: {
        usuarioId,
        accion: TipoAccion.RESPONDER_SOLICITUD, // Puedes agregar un nuevo enum AMPARO si quieres
        detalle: `Marcó la solicitud #${id} en amparo ante el CPLT`,
      },
    });

    return actualizada;
  });
}