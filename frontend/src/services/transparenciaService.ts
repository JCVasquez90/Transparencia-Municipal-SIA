import apiClient from '../api/client';
import { ItemTransparencia, CargaMensual, ApiResponse } from '../types';

export const transparenciaService = {
  /**
   * Obtiene todos los ítems de transparencia activa
   */
  async listarItems(): Promise<ItemTransparencia[]> {
    const response = await apiClient.get<ApiResponse<ItemTransparencia[]>>('/transparencia/items');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener los ítems');
    }
    return response.data.data || [];
  },

  /**
   * Obtiene las cargas mensuales de un ítem específico
   */
  async listarCargas(itemId: number): Promise<CargaMensual[]> {
    const response = await apiClient.get<ApiResponse<CargaMensual[]>>(`/transparencia/cargas/${itemId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener las cargas');
    }
    return response.data.data || [];
  },

  /**
   * Crea una nueva carga mensual
   */
  async crearCarga(datos: {
    itemId: number;
    mes: string;
    anio: number;
    estado?: string;
  }): Promise<CargaMensual> {
    const response = await apiClient.post<ApiResponse<CargaMensual>>('/transparencia/cargas', datos);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al crear la carga');
    }
    return response.data.data!;
  },

  /**
   * Aprueba una carga mensual (solo DIRECTOR)
   */
  async aprobarCarga(id: number): Promise<CargaMensual> {
    const response = await apiClient.patch<ApiResponse<CargaMensual>>(`/transparencia/cargas/${id}/aprobar`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al aprobar la carga');
    }
    return response.data.data!;
  },

  /**
   * Rechaza una carga mensual (solo DIRECTOR)
   */
  async rechazarCarga(id: number): Promise<CargaMensual> {
    const response = await apiClient.patch<ApiResponse<CargaMensual>>(`/transparencia/cargas/${id}/rechazar`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al rechazar la carga');
    }
    return response.data.data!;
  },

  /**
   * Publica una carga mensual (solo sistema o ENLACE)
   */
  async publicarCarga(id: number): Promise<CargaMensual> {
    const response = await apiClient.patch<ApiResponse<CargaMensual>>(`/transparencia/cargas/${id}/publicar`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al publicar la carga');
    }
    return response.data.data!;
  },

  /**
 * Obtiene una carga mensual por su ID
 * @param id - ID de la carga
 * @returns La carga con sus detalles
 */
async obtenerCargaPorId(id: number): Promise<CargaMensual> {
  const response = await apiClient.get<ApiResponse<CargaMensual>>(`/transparencia/carga/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener la carga');
  }
  return response.data.data!;
}
};