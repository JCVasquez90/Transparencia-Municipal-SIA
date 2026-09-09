import { prisma } from '../index.ts';

// Lista todos los logs de auditoría, del más reciente al más antiguo.
// Incluye datos básicos del usuario que ejecutó la acción (sin passwordHash).
export async function listarLogs() {
  const logs = await prisma.log.findMany({
    orderBy: { fechaHora: 'desc' },
    include: {
      usuario: {
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: true,
        },
      },
    },
  });

  return logs;
}