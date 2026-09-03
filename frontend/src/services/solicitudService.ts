import apiClient from '../api/client';
import { Solicitud, ApiResponse } from '../types';

// ============================================
// SERVICIO PARA OBTENER SOLICITUDES
// ============================================

export const solicitudService = {
  /**
   * Obtiene todas las solicitudes
   * @param estadoSemaforo - Filtro opcional por estado del semáforo (VERDE, AMARILLO, ROJO, VENCIDO)
   * @returns Lista de solicitudes con su semáforo calculado
   */
  async listar(estadoSemaforo?: string): Promise<Solicitud[]> {
    const params = estadoSemaforo ? { estado: estadoSemaforo } : {};
    const response = await apiClient.get<ApiResponse<Solicitud[]>>('/solicitudes', { params });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener las solicitudes');
    }
    
    return response.data.data || [];
  },

  /**
   * Crea una nueva solicitud
   * @param datos - Datos de la solicitud (folio, fechaRecepcion, descripcion, departamentoId)
   * @returns La solicitud creada
   */
  async crear(datos: {
    fechaRecepcion: string;
    descripcion: string;
    departamentoId: number;
  }): Promise<Solicitud> {
    const response = await apiClient.post<ApiResponse<Solicitud>>('/solicitudes', datos);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al crear la solicitud');
    }
    
    return response.data.data!;
  },

  /**
   * Obtiene los KPIs (indicadores) para el dashboard
   * @returns Objeto con total, por estado y por semáforo
   */
  async obtenerKPIs(): Promise<{
    total: number;
    porEstado: Record<string, number>;
    porSemaforo: Record<string, number>;
  }> {
    const solicitudes = await this.listar();
    
    // Calcular KPIs a partir de los datos
    const porEstado: Record<string, number> = {};
    const porSemaforo: Record<string, number> = {
      VERDE: 0,
      AMARILLO: 0,
      ROJO: 0,
      VENCIDO: 0,
    };

      solicitudes.forEach((solicitud) => {
      // Contar por estado
      porEstado[solicitud.estado] = (porEstado[solicitud.estado] || 0) + 1;
      
      // Contar por semáforo
      if (solicitud.semaforo) {
        porSemaforo[solicitud.semaforo] = (porSemaforo[solicitud.semaforo] || 0) + 1;
      }
    });

    return {
      total: solicitudes.length,
      porEstado,
      porSemaforo,
    };
  },
};