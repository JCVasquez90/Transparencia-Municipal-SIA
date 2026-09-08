import cron from 'node-cron';
import { generarAlertasTransparencia } from '../services/alerta.service.ts';

// Programar la tarea para que se ejecute el día 1 de cada mes a las 8:00 AM
// Formato: segundos minutos horas día mes díaSemana
cron.schedule('0 8 1 * *', async () => {
  console.log('Ejecutando tarea programada: Generar alertas de transparencia...');
  try {
    const alertas = await generarAlertasTransparencia();
    console.log(`Se generaron ${alertas.length} alertas de transparencia`);
  } catch (error) {
    console.error('Error al generar las alertas:', error);
  }
});

console.log('Tarea programada de alertas activada (día 1 de cada mes a las 8:00 AM)');