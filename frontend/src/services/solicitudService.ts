import apiClient from '../api/client';
import { Solicitud, ApiResponse, Subtarea } from '../types';

export const solicitudService = {
  async listar(estadoSemaforo?: string): Promise<Solicitud[]> {
    const params = estadoSemaforo ? { estado: estadoSemaforo } : {};
    const response = await apiClient.get<ApiResponse<Solicitud[]>>('/solicitudes', { params });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener las solicitudes');
    }
    return response.data.data || [];
  },

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

  async obtenerKPIs(): Promise<{
    total: number;
    porEstado: Record<string, number>;
    porSemaforo: Record<string, number>;
  }> {
    const solicitudes = await this.listar();
    const porEstado: Record<string, number> = {};
    const porSemaforo: Record<string, number> = { VERDE: 0, AMARILLO: 0, ROJO: 0, VENCIDO: 0 };

    solicitudes.forEach((solicitud) => {
      porEstado[solicitud.estado] = (porEstado[solicitud.estado] || 0) + 1;
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

  async obtenerKPIsAvanzados(): Promise<{
    promedioPorDepartamento: { departamento: string; promedio: number }[];
    tasaCumplimiento: number;
    indiceAmparos: number;
    totalAmparos: number;
  }> {
    const response = await apiClient.get<ApiResponse<any>>('/solicitudes/kpis');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener los KPIs');
    }
    return response.data.data!;
  },

  async obtenerPorId(id: number): Promise<Solicitud> {
    const response = await apiClient.get<ApiResponse<Solicitud>>(`/solicitudes/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener la solicitud');
    }
    if (!response.data.data) {
      throw new Error('Solicitud no encontrada');
    }
    return response.data.data;
  },

  async responder(id: number, contenidoRespuesta: string): Promise<Solicitud> {
    const response = await apiClient.patch<ApiResponse<Solicitud>>(`/solicitudes/${id}/responder`, {
      contenidoRespuesta,
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al responder la solicitud');
    }
    return response.data.data!;
  },

  async solicitarProrroga(id: number, fundamentos: string): Promise<Solicitud> {
    const response = await apiClient.post<ApiResponse<Solicitud>>(`/solicitudes/${id}/prorroga`, {
      fundamentos,
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al solicitar la prórroga');
    }
    return response.data.data!;
  },

  async firmar(id: number, firma: string): Promise<Solicitud> {
    const response = await apiClient.patch<ApiResponse<Solicitud>>(`/solicitudes/${id}/firmar`, { firma });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al firmar la solicitud');
    }
    return response.data.data!;
  },

  async crearSubtarea(solicitudId: number, datos: {
    departamentoId: number;
    descripcion: string;
  }): Promise<Subtarea> {
    const response = await apiClient.post<ApiResponse<Subtarea>>(
      `/solicitudes/${solicitudId}/subtareas`,
      datos
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al crear la subtarea');
    }
    return response.data.data!;
  },

  async listarSubtareas(solicitudId: number): Promise<Subtarea[]> {
    const response = await apiClient.get<ApiResponse<Subtarea[]>>(
      `/solicitudes/${solicitudId}/subtareas`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al listar las subtareas');
    }
    return response.data.data || [];
  },

  async responderSubtarea(subtareaId: number, contenidoRespuesta: string): Promise<Subtarea> {
    const response = await apiClient.patch<ApiResponse<Subtarea>>(
      `/solicitudes/subtareas/${subtareaId}/responder`,
      { contenidoRespuesta }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al responder la subtarea');
    }
    return response.data.data!;
  },

  async consolidarSubtareas(solicitudId: number): Promise<Solicitud> {
    const response = await apiClient.post<ApiResponse<Solicitud>>(
      `/solicitudes/${solicitudId}/consolidar`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al consolidar las subtareas');
    }
    return response.data.data!;
  },

  async marcarEnAmparo(id: number): Promise<Solicitud> {
    const response = await apiClient.patch<ApiResponse<Solicitud>>(`/solicitudes/${id}/amparo`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al marcar en amparo');
    }
    return response.data.data!;
  },
};