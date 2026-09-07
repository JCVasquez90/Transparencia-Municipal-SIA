import apiClient from '../api/client';
import { Archivo, ApiResponse } from '../types';

// ============================================
// SERVICIO PARA GESTIÓN DE ARCHIVOS
// ============================================

export const archivoService = {
  //Lista los archivos de una solicitud @param solicitudId - ID de la solicitud @returns Lista de archivos asociados

  async listar(solicitudId: number): Promise<Archivo[]> {
    const response = await apiClient.get<ApiResponse<Archivo[]>>(
      `/archivos/solicitud/${solicitudId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener los archivos');
    }

    return response.data.data || [];
  },

  /* Sube un archivo asociado a una solicitud, @param solicitudId - ID de la solicitud, @param archivo - Archivo a subir (File del input)
   * @param tipo - Tipo de archivo (EVIDENCIA_SOLICITUD o RESPUESTA)
   * @returns El archivo creado
   */
  async subir(
    solicitudId: number,
    archivo: File,
    tipo: 'EVIDENCIA_SOLICITUD' | 'RESPUESTA'
  ): Promise<Archivo> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('tipo', tipo);

    const response = await apiClient.post<ApiResponse<Archivo>>(
      `/archivos/solicitud/${solicitudId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al subir el archivo');
    }

    return response.data.data!;
  },

  /*Descarga un archivo y dispara la descarga en el navegador, @param archivoId - ID del archivo
    @param nombreArchivo - Nombre original para guardar el archivo descargado
   */
  async descargar(archivoId: number, nombreArchivo: string): Promise<void> {
    const response = await apiClient.get(`/archivos/${archivoId}/descargar`, {
      responseType: 'blob',
    });

    // Crea un link temporal para forzar la descarga con el nombre original
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', nombreArchivo);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};