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
  CircularProgress,
  Alert,
  Typography,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { logService } from '../services/logService';
import { Log } from '../types';
import Layout from '../components/common/Layout';

// ============================================
// COMPONENTE LOG DE AUDITORÍA
// ============================================

const LogAuditoria: React.FC = () => {
  const { usuario } = useAuth();

  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await logService.listar();
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el registro de auditoría');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarLogs();
  }, [cargarLogs]);

  // Colores por tipo de acción, para escanear la tabla rápido
  const colorAccion: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
    CREAR_SOLICITUD: 'info',
    RESPONDER_SOLICITUD: 'success',
    SOLICITAR_PRORROGA: 'warning',
    CREAR_USUARIO: 'info',
    EDITAR_USUARIO: 'warning',
    SUBIR_ARCHIVO: 'default',
  };

  // ============================================
  // BLOQUEO POR ROL (solo ENLACE)
  // ============================================
  if (usuario?.rol !== 'ENLACE') {
    return (
      <Layout>
        <Alert severity="error" sx={{ mt: 3 }}>
          No tienes permisos para ver el registro de auditoría.
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
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
        Registro de Auditoría
      </Typography>

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
                <TableCell>Fecha y hora</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Acción</TableCell>
                <TableCell>Detalle</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No hay registros de auditoría
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.fechaHora).toLocaleString('es-CL')}
                    </TableCell>
                    <TableCell>{log.usuario.nombre}</TableCell>
                    <TableCell>
                      <Chip label={log.usuario.rol} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.accion.replace(/_/g, ' ')}
                        size="small"
                        color={colorAccion[log.accion] || 'default'}
                      />
                    </TableCell>
                    <TableCell>{log.detalle || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Layout>
  );
};

export default LogAuditoria;