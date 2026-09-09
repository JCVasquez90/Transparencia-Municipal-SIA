import { prisma } from '../index.ts';
import { sumarDiasHabiles, diasHabilesEntre } from '../utils/fechas.utils.ts';
import { calcularSemaforo } from './semaforo.service.ts';
import { TipoAccion } from '../../generated/prisma/enums.ts';
import type { EstadoSemaforo } from '../utils/fechas.utils.ts';
import type { CrearSolicitudDto, ResponderSolicitudDto, SolicitarProrrogaDto } from '../dtos/solicitud.dto.ts';

async function generarFolio(): Promise<string> {
  const año = new Date().getFullYear();
  const ultimaSolicitud = await prisma.solicitud.findFirst({
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
  const folio = await generarFolio();
  const fechaRecepcion = new Date(datos.fechaRecepcion);
  const plazoLimite = sumarDiasHabiles(fechaRecepcion, 20);

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
  // Obtener todas las solicitudes con sus departamentos
  const solicitudes = await prisma.solicitud.findMany({
    include: {
      departamento: true,
    },
  });

  // Si no hay solicitudes, devolver valores por defecto
  if (solicitudes.length === 0) {
    return {
      promedioPorDepartamento: [],
      tasaCumplimiento: 0,
    };
  }

  // 1. Tiempo promedio de respuesta por departamento
  const tiempoPorDepartamento: Record<string, { total: number; count: number }> = {};

  solicitudes.forEach((solicitud) => {
    if (!solicitud.fechaRespuesta) return; // Solo considerar las respondidas

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

  return {
    promedioPorDepartamento,
    tasaCumplimiento,
  };
}