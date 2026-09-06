// ============================================
// TIPOS DE USUARIO
// ============================================

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'OPERATIVO' | 'DIRECTOR' | 'ENLACE';
  departamentoId: number;
}

// ============================================
// TIPOS DE SOLICITUD
// ============================================

export interface Departamento {
  id: number;
  nombre: string;
}

export interface Solicitud {
  id: number;
  folio: string;
  fechaRecepcion: string;    // ISO date string
  descripcion: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'RESPONDIDA' | 'VENCIDA' | 'PRORROGA_SOLICITADA';
  plazoLimite: string;       // ISO date string
  usuarioId: number;
  departamentoId: number;
  contenidoRespuesta?: string | null;
  fechaRespuesta?: string | null; // ISO date string
  departamento?: Departamento;
  diasHabiles?: number;
  semaforo?: 'VERDE' | 'AMARILLO' | 'ROJO' | 'VENCIDO';
}

// ============================================
// TIPOS PARA RESPUESTAS DE LA API
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// ============================================
// TIPOS PARA FORMULARIOS
// ============================================

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface CrearSolicitudFormValues {
  folio: string;
  fechaRecepcion: string;
  descripcion: string;
  departamentoId: number;
}

export interface ResponderSolicitudFormValues {
  contenidoRespuesta: string;
}

export interface SolicitarProrrogaFormValues {
  fundamentos: string;
}

// ============================================
// TIPOS PARA TRANSPARENCIA ACTIVA
// ============================================

export interface ItemTransparencia{
  id: number;
  nombre: string;
  descripcion: string;
  departamentoResponsableId: number;
  departamentoResponsable?: Departamento;
}

export interface CargaMensual{
  id: number;
  itemId: number;
  mes: number;
  anio: number;
  estado: 'PENDIENTE' | 'APROBADA' | 'PUBLICADA' | 'RECHAZADA';
  fechaCarga: string;
  usuarioId: number;
  usuario?: Usuario;
  item?: ItemTransparencia;
}



export {};