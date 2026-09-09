import apiClient from '../api/client';
import { Usuario, ApiResponse } from '../types';

// ============================================
// SERVICIO PARA GESTIÓN DE USUARIOS
// ============================================

export interface CrearUsuarioPayload {
  nombre: string;
  email: string;
  password: string;
  rol: 'OPERATIVO' | 'DIRECTOR' | 'ENLACE';
  departamentoId: number;
}

export interface EditarUsuarioPayload {
  nombre?: string;
  email?: string;
  password?: string;
  rol?: 'OPERATIVO' | 'DIRECTOR' | 'ENLACE';
  departamentoId?: number;
}

export const usuarioService = {

  //Lista todos los usuarios 

  async listar(): Promise<Usuario[]> {
    const response = await apiClient.get<ApiResponse<Usuario[]>>('/usuarios');

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener los usuarios');
    }

    return response.data.data || [];
  },

  //Crea un nuevo usuario
   
  async crear(datos: CrearUsuarioPayload): Promise<Usuario> {
    const response = await apiClient.post<ApiResponse<Usuario>>('/usuarios', datos);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al crear el usuario');
    }

    return response.data.data!;
  },

  //Edita un usuario existente. Si no se incluye password, no se cambia.
   
  async editar(id: number, datos: EditarUsuarioPayload): Promise<Usuario> {
    const response = await apiClient.patch<ApiResponse<Usuario>>(`/usuarios/${id}`, datos);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al editar el usuario');
    }

    return response.data.data!;
  },
};