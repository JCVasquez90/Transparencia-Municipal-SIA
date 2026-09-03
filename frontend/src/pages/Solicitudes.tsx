import React, { useState, useEffect } from 'react';
import {
  Container,
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
import { Visibility, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { solicitudService } from '../services/solicitudService';
import { Solicitud } from '../types';

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

  const cargarSolicitudes = async () => {
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
  };

  useEffect(() => {
    cargarSolicitudes();
  }, [filtroEstado]);

  // ============================================
  // 3. RENDERIZADO DE SEMÁFORO
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
  // 4. RENDERIZADO PRINCIPAL
  // ============================================

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h3" component="h1">
          Solicitudes de información
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/solicitudes/nueva')}
          disabled={usuario?.rol !== 'OPERATIVO'}
        > Nueva solicitud
        </Button>
      </Box>

      {/* Filtros */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
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
                solicitudes.map((solicitud) => (
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
    </Container>
  );
};

export default Solicitudes;