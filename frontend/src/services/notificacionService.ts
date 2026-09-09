import apiClient from '../api/client';
import { ApiResponse } from '../types';

export interface Notificacion {
  id: number;
  usuarioId: number;
  mensaje: string;
  leida: boolean;
  createdAt: string;
}

export const notificacionService = {
  /**
   * Obtiene las notificaciones no leídas del usuario autenticado
   */
  async obtenerNoLeidas(): Promise<Notificacion[]> {
    const response = await apiClient.get<ApiResponse<Notificacion[]>>('/notificaciones/no-leidas');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener las notificaciones');
    }
    return response.data.data || [];
  },

  /**
   * Marca una notificación como leída
   */
  async marcarComoLeida(id: number): Promise<void> {
    const response = await apiClient.patch<ApiResponse<void>>(`/notificaciones/${id}/leer`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al marcar la notificación como leída');
    }
  },

  /**
   * Marca todas las notificaciones como leídas
   */
  async marcarTodasComoLeidas(): Promise<void> {
    const response = await apiClient.patch<ApiResponse<void>>('/notificaciones/marcar-todas');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al marcar las notificaciones como leídas');
    }
  },
};