import apiClient from '../api/client';
import { Log, ApiResponse } from '../types';

// ============================================
// SERVICIO PARA OBTENER LOGS DE AUDITORÍA
// ============================================


 
   //Obtiene el registro de auditoría (logs) @returns Lista de logs ordenados del más reciente al más antiguo
   
export const logService = {
 
  async listar(): Promise<Log[]> {
    const response = await apiClient.get<ApiResponse<Log[]>>('/logs');

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener el registro de auditoría');
    }

    return response.data.data || [];
  },
};