import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Typography,
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
  TextField,
  MenuItem,
  IconButton,
} from '@mui/material';
import { Visibility, Refresh, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { solicitudService } from '../services/solicitudService';
import { Solicitud } from '../types';
import Layout from '../components/common/Layout';

// ============================================
// COMPONENTE SOLICITUDES
// ============================================

const Solicitudes: React.FC = () => {
  // ============================================
  // 1. ESTADOS
  // ============================================

  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [ordenAscendente, setOrdenAscendente] = useState(false); // ← NUEVO: control de orden

  // Opciones para el filtro de semáforo
  const opcionesSemaforo = [
    { value: '', label: 'Todos' },
    { value: 'VERDE', label: '🟢 Verde' },
    { value: 'AMARILLO', label: '🟡 Amarillo' },
    { value: 'ROJO', label: '🔴 Rojo' },
    { value: 'VENCIDO', label: '⚫ Vencido' },
  ];

  // ============================================
  // 2. CARGAR DATOS
  // ============================================

  const cargarSolicitudes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await solicitudService.listar(filtroEstado || undefined);
      setSolicitudes(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  }, [filtroEstado]);

  useEffect(() => {
    cargarSolicitudes();
  }, [cargarSolicitudes]);

  // ============================================
  // 3. FUNCIÓN PARA ORDENAR SOLICITUDES POR FOLIO
  // ============================================

  const solicitudesOrdenadas = () => {
    const copia = [...solicitudes];
    return copia.sort((a, b) => {
      // Extraer el número del folio (ej. "SIA-2026-001" → 1)
      const numA = parseInt(a.folio.split('-')[2], 10);
      const numB = parseInt(b.folio.split('-')[2], 10);
      const valorA = isNaN(numA) ? a.id : numA;
      const valorB = isNaN(numB) ? b.id : numB;
      return ordenAscendente ? valorA - valorB : valorB - valorA;
    });
  };

  // ============================================
  // 4. RENDERIZADO DE SEMÁFORO
  // ============================================

  const renderSemaforo = (semaforo?: string) => {
    const colores: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
      VERDE: 'success',
      AMARILLO: 'warning',
      ROJO: 'error',
      VENCIDO: 'default',
    };
    const labels: Record<string, string> = {
      VERDE: '🟢 Verde',
      AMARILLO: '🟡 Amarillo',
      ROJO: '🔴 Rojo',
      VENCIDO: '⚫ Vencido',
    };
    return semaforo ? (
      <Chip label={labels[semaforo] || semaforo} color={colores[semaforo] || 'default'} size="small" />
    ) : (
      <Chip label="Sin semáforo" size="small" />
    );
  };

  // ============================================
  // 5. RENDERIZADO PRINCIPAL
  // ============================================

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }} >
          Solicitudes
        </Typography>
        {usuario?.rol === 'OPERATIVO' && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/solicitudes/nueva')}
          > Nueva solicitud
          </Button>
        )}
      </Box>

      {/* Filtros y controles */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          select
          label="Filtrar por semáforo"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        >
          {opcionesSemaforo.map((opcion) => (
            <MenuItem key={opcion.value} value={opcion.value}>
              {opcion.label}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="outlined" onClick={cargarSolicitudes} startIcon={<Refresh />}>
          Actualizar
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setOrdenAscendente(!ordenAscendente)}
          startIcon={ordenAscendente ? <ArrowUpward /> : <ArrowDownward />}
        >
          {ordenAscendente ? 'Ascendente' : 'Descendente'}
        </Button>
      </Box>

      {/* Mensaje de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabla de solicitudes */}
      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Folio</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Semáforo</TableCell>
                <TableCell>Fecha recepción</TableCell>
                <TableCell>Plazo límite</TableCell>
                <TableCell>Departamento</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {solicitudes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No hay solicitudes registradas
                  </TableCell>
                </TableRow>
              ) : (
                solicitudesOrdenadas().map((solicitud) => (
                  <TableRow key={solicitud.id}>
                    <TableCell>{solicitud.folio}</TableCell>
                    <TableCell>{solicitud.descripcion.substring(0, 60)}...</TableCell>
                    <TableCell>
                      <Chip
                        label={solicitud.estado}
                        size="small"
                        color={
                          solicitud.estado === 'RESPONDIDA'
                            ? 'success'
                            : solicitud.estado === 'VENCIDA' || solicitud.estado === 'PRORROGA_SOLICITADA'
                              ? 'warning'
                              : 'primary'
                        }
                      />
                    </TableCell>
                    <TableCell>{renderSemaforo(solicitud.semaforo)}</TableCell>
                    <TableCell>{new Date(solicitud.fechaRecepcion).toLocaleDateString('es-CL')}</TableCell>
                    <TableCell>{new Date(solicitud.plazoLimite).toLocaleDateString('es-CL')}</TableCell>
                    <TableCell>{solicitud.departamento?.nombre || '-'}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/solicitudes/${solicitud.id}`)}
                        title="Ver detalle"
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
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

export default Solicitudes;