import { prisma } from '../index.ts';
import { TipoAccion } from '../../generated/prisma/enums.ts';

/**
 * Verifica qué ítems de transparencia deben cargarse en el mes actual
 * y crea notificaciones para los usuarios responsables (OPERATIVO).
 */
export async function generarAlertasTransparencia() {
  const hoy = new Date();
  const mesActual = hoy.getMonth() + 1; // 1-12
  const anioActual = hoy.getFullYear();

  // 1. Obtener todos los ítems de transparencia
  const items = await prisma.itemTransparencia.findMany({
    include: {
      departamentoResponsable: true,
    },
  });

  // 2. Para cada ítem, verificar si ya existe una carga en el mes actual
  const alertasCreadas = [];

  for (const item of items) {
    const cargaExistente = await prisma.cargaMensual.findFirst({
      where: {
        itemId: item.id,
        mes: mesActual.toString(),
        anio: anioActual,
      },
    });

    // Si no hay carga para este mes, crear alertas para los OPERATIVOS del departamento
    if (!cargaExistente) {
      // Obtener usuarios OPERATIVO de este departamento
      const usuarios = await prisma.usuario.findMany({
        where: {
          departamentoId: item.departamentoResponsableId,
          rol: 'OPERATIVO',
        },
      });

      // Crear una notificación para cada usuario
      for (const usuario of usuarios) {
        const notificacion = await prisma.notificacion.create({
          data: {
            usuarioId: usuario.id,
            mensaje: `⚠️ Recordatorio: Debes cargar la información de "${item.nombre}" para el mes de ${mesActual}/${anioActual}.`,
            leida: false,
          },
        });

        // Registrar en logs
        await prisma.log.create({
          data: {
            usuarioId: usuario.id,
            accion: TipoAccion.PUBLICAR_INFORMACION, // Reutilizamos este enum o podemos agregar uno nuevo
            detalle: `Alerta generada para el ítem "${item.nombre}" (mes ${mesActual}/${anioActual})`,
          },
        });

        alertasCreadas.push(notificacion);
      }
    }
  }

  return alertasCreadas;
}