
//Utilidades de fechas para el cálculo de plazos legales (Ley N° 20.285).
 


//Suma una cantidad de días hábiles a una fecha, saltándose sábados y domingos.

export function sumarDiasHabiles(desde: Date, diasHabiles: number): Date {
  const fecha = new Date(desde);
  let diasSumados = 0;

  while (diasSumados < diasHabiles) {
    fecha.setDate(fecha.getDate() + 1);
    const diaSemana = fecha.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) {
      diasSumados++;
    }
  }

  return fecha;
}


//Cuenta los días hábiles transcurridos entre dos fechas (excluyendo fines de semana).
 
export function diasHabilesEntre(desde: Date, hasta: Date): number {
  let dias = 0;
  const fecha = new Date(desde);
  while (fecha < hasta) {
    const diaSemana = fecha.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) {
      dias++;
    }
    fecha.setDate(fecha.getDate() + 1);
  }
  return dias;
}


 //Clasifica el semáforo de plazos según los días hábiles transcurridos.
 //   VERDE:    0-10 días hábiles
 //   AMARILLO: 11-15 días hábiles
 //   ROJO:     16-20 días hábiles
 //  VENCIDO:  más de 20 días hábiles
 
export function EstadoSemaforo(diasHabiles: number): 'VERDE' | 'AMARILLO' | 'ROJO' | 'VENCIDO' {
  if (diasHabiles <= 10) return 'VERDE';
  if (diasHabiles <= 15) return 'AMARILLO';
  if (diasHabiles <= 20) return 'ROJO';
  return 'VENCIDO';
}