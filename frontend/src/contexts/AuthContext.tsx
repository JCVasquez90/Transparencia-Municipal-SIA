import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import apiClient from '../api/client';
import { Usuario } from '../types';

// ============================================
// 1. DEFINIR EL TIPO DEL CONTEXTO
// ============================================

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  loading: boolean;         // Indica si está verificando el token
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// ============================================
// 2. CREAR EL CONTEXTO
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// 3. PROVEEDOR DEL CONTEXTO
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ============================================
  // 4. CARGAR EL TOKEN Y USUARIO AL INICIAR LA APP
  // ============================================

  useEffect(() => {
    const cargarSesion = async () => {
      try {
        const tokenGuardado = localStorage.getItem('token');
        const usuarioGuardado = localStorage.getItem('usuario');

        if (tokenGuardado && usuarioGuardado) {
          setToken(tokenGuardado);
          setUsuario(JSON.parse(usuarioGuardado));

          // Configurar el token en el cliente de Axios para futuras peticiones
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${tokenGuardado}`;
        }
      } catch (error) {
        console.error('Error al cargar la sesión:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      } finally {
        setLoading(false);
      }
    };

    cargarSesion();
  }, []);

  // ============================================
  // 5. FUNCIÓN DE LOGIN
  // ============================================

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });

      if (response.data.success) {
        const { token, usuario } = response.data.data;

        // Guardar en el estado
        setToken(token);
        setUsuario(usuario);

        // Guardar en localStorage para persistencia
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuario));

        // Configurar el token en el cliente de Axios
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        throw new Error(response.data.message || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al conectar con el servidor');
    }
  };

  // ============================================
  // 6. FUNCIÓN DE LOGOUT
  // ============================================

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    delete apiClient.defaults.headers.common['Authorization'];
  };

  // ============================================
  // 7. VALOR DEL CONTEXTO
  // ============================================

  const value: AuthContextType = {
    usuario,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!usuario && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// 8. HOOK PARA USAR EL CONTEXTO
// ============================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};