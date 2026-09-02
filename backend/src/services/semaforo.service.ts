import { diasHabilesEntre } from '../utils/fechas.utils.ts';
import type { EstadoSemaforo } from '../utils/fechas.utils.ts';

// Calcula el semáforo de una solicitud a partir de su fecha de recepción.
export function calcularSemaforo(fechaRecepcion: Date, fechaReferencia: Date = new Date()) {
  const diasHabiles = diasHabilesEntre(fechaRecepcion, fechaReferencia);
  const semaforo = clasificarSemaforo(diasHabiles);
  return { diasHabiles, semaforo };
}

// Clasifica el semáforo de plazos según los días hábiles transcurridos.
//   VERDE:    0-10 días hábiles
//   AMARILLO: 11-15 días hábiles
//   ROJO:     16-20 días hábiles
//   VENCIDO:  más de 20 días hábiles
export function clasificarSemaforo(diasHabiles: number): EstadoSemaforo {
  if (diasHabiles <= 10) return 'VERDE';
  if (diasHabiles <= 15) return 'AMARILLO';
  if (diasHabiles <= 20) return 'ROJO';
  return 'VENCIDO';
}