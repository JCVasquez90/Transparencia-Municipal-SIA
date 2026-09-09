import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { Edit, PersonAdd } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { usuarioService } from '../services/usuarioService';
import apiClient from '../api/client';
import { Usuario, Departamento } from '../types';
import Layout from '../components/common/Layout';

// ============================================
// COMPONENTE GESTIÓN DE USUARIOS
// ============================================

const ROLES: Array<'OPERATIVO' | 'DIRECTOR' | 'ENLACE'> = ['OPERATIVO', 'DIRECTOR', 'ENLACE'];

interface FormularioUsuario {
  nombre: string;
  email: string;
  password: string;
  rol: 'OPERATIVO' | 'DIRECTOR' | 'ENLACE';
  departamentoId: number;
}

const formularioVacio: FormularioUsuario = {
  nombre: '',
  email: '',
  password: '',
  rol: 'OPERATIVO',
  departamentoId: 0,
};

const Usuarios: React.FC = () => {
  const { usuario } = useAuth();
  const { showNotification } = useNotification();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado del modal (crear o editar)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioEditandoId, setUsuarioEditandoId] = useState<number | null>(null);
  const [formulario, setFormulario] = useState<FormularioUsuario>(formularioVacio);
  const [guardando, setGuardando] = useState(false);
  const [erroresCampo, setErroresCampo] = useState<Record<string, string[]>>({});

  // ============================================
  // CARGAR DATOS
  // ============================================

  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usuarioService.listar();
      setUsuarios(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  useEffect(() => {
    const cargarDepartamentos = async () => {
      try {
        const response = await apiClient.get('/departamentos');
        if (response.data.success) {
          setDepartamentos(response.data.data);
        }
      } catch (err) {
        console.error('Error al cargar departamentos:', err);
      }
    };
    cargarDepartamentos();
  }, []);

  // ============================================
  // MANEJADORES DEL MODAL
  // ============================================

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setUsuarioEditandoId(null);
    setFormulario({
      ...formularioVacio,
      departamentoId: departamentos[0]?.id || 0,
    });
    setErroresCampo({});
    setModalAbierto(true);
  };

  const abrirModalEditar = (u: Usuario) => {
    setModoEdicion(true);
    setUsuarioEditandoId(u.id);
    setFormulario({
      nombre: u.nombre,
      email: u.email,
      password: '', // vacío = no cambiar
      rol: u.rol,
      departamentoId: u.departamentoId,
    });
    setErroresCampo({});
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setErroresCampo({});

    try {
      if (modoEdicion && usuarioEditandoId !== null) {
        // En edición, solo mandamos password si se escribió algo
        const payload: any = {
          nombre: formulario.nombre,
          email: formulario.email,
          rol: formulario.rol,
          departamentoId: formulario.departamentoId,
        };
        if (formulario.password.trim()) {
          payload.password = formulario.password;
        }
        await usuarioService.editar(usuarioEditandoId, payload);
        showNotification('Usuario editado correctamente', 'success');
      } else {
        await usuarioService.crear(formulario);
        showNotification('Usuario creado correctamente', 'success');
      }

      setModalAbierto(false);
      await cargarUsuarios();
    } catch (err: any) {
      const errores = err.response?.data?.errors;
      const mensaje = err.response?.data?.message || err.message || 'Error al guardar el usuario';
      if (errores) {
        setErroresCampo(errores);
      }
      showNotification(mensaje, 'error');
    } finally {
      setGuardando(false);
    }
  };

  // ============================================
  // BLOQUEO POR ROL (solo ENLACE)
  // ============================================

  if (usuario?.rol !== 'ENLACE') {
    return (
      <Layout>
        <Alert severity="error" sx={{ mt: 3 }}>
          No tienes permisos para gestionar usuarios.
        </Alert>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Gestión de Usuarios
          </Typography>
        <Button variant="contained" startIcon={<PersonAdd />} onClick={abrirModalCrear}>
          Nuevo usuario
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Departamento</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No hay usuarios registrados
                  </TableCell>
                </TableRow>
              ) : (
                usuarios.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.nombre}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Chip label={u.rol} size="small" />
                    </TableCell>
                    <TableCell>{u.departamento?.nombre || '-'}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary" onClick={() => abrirModalEditar(u)} title="Editar">
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal de crear/editar */}
      <Dialog open={modalAbierto} onClose={cerrarModal} maxWidth="sm" fullWidth>
        <DialogTitle>{modoEdicion ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre"
            value={formulario.nombre}
            onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
            margin="normal"
            error={!!erroresCampo.nombre}
            helperText={erroresCampo.nombre?.[0]}
            disabled={guardando}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formulario.email}
            onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
            margin="normal"
            error={!!erroresCampo.email}
            helperText={erroresCampo.email?.[0]}
            disabled={guardando}
          />
          <TextField
            fullWidth
            label={modoEdicion ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
            type="password"
            value={formulario.password}
            onChange={(e) => setFormulario({ ...formulario, password: e.target.value })}
            margin="normal"
            error={!!erroresCampo.password}
            helperText={erroresCampo.password?.[0] || 'Mínimo 8 caracteres'}
            disabled={guardando}
          />
          <TextField
            fullWidth
            select
            label="Rol"
            value={formulario.rol}
            onChange={(e) => setFormulario({ ...formulario, rol: e.target.value as any })}
            margin="normal"
            disabled={guardando}
          >
            {ROLES.map((rol) => (
              <MenuItem key={rol} value={rol}>
                {rol}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="Departamento"
            value={formulario.departamentoId}
            onChange={(e) => setFormulario({ ...formulario, departamentoId: Number(e.target.value) })}
            margin="normal"
            disabled={guardando}
          >
            {departamentos.map((dep) => (
              <MenuItem key={dep.id} value={dep.id}>
                {dep.nombre}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModal} disabled={guardando}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardar}
            disabled={
              guardando ||
              !formulario.nombre.trim() ||
              !formulario.email.trim() ||
              (!modoEdicion && formulario.password.length < 8) ||
              !formulario.departamentoId
            }
          >
            {guardando ? <CircularProgress size={24} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Usuarios;