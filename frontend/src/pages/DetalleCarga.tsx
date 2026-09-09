import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { transparenciaService } from '../services/transparenciaService';
import { CargaMensual } from '../types';
import Layout from '../components/common/Layout';

// ============================================
// COMPONENTE DETALLE DE CARGA
// ============================================

const DetalleCarga: React.FC = () => {
  // ============================================
  // 1. HOOKS Y ESTADOS
  // ============================================

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { showNotification } = useNotification();

  const [carga, setCarga] = useState<CargaMensual | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actualizando, setActualizando] = useState(false);

  // ============================================
  // 2. CARGAR DATOS
  // ============================================

 useEffect(() => {
  const cargarDetalle = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const cargaData = await transparenciaService.obtenerCargaPorId(parseInt(id, 10));
      setCarga(cargaData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la carga');
    } finally {
      setLoading(false);
    }
  };

  cargarDetalle();
}, [id]);

  // ============================================
  // 3. MANEJADORES DE ACCIONES
  // ============================================

  const handleAprobar = async () => {
    if (!carga) return;
    setActualizando(true);
    try {
      await transparenciaService.aprobarCarga(carga.id);
      showNotification('Carga aprobada correctamente', 'success');
      // Actualizar estado local
      setCarga({ ...carga, estado: 'APROBADA' });
    } catch (err: any) {
      showNotification(err.message || 'Error al aprobar la carga', 'error');
    } finally {
      setActualizando(false);
    }
  };

  const handleRechazar = async () => {
    if (!carga) return;
    setActualizando(true);
    try {
      await transparenciaService.rechazarCarga(carga.id);
      showNotification('Carga rechazada correctamente', 'success');
      setCarga({ ...carga, estado: 'RECHAZADA' });
    } catch (err: any) {
      showNotification(err.message || 'Error al rechazar la carga', 'error');
    } finally {
      setActualizando(false);
    }
  };

  const handlePublicar = async () => {
    if (!carga) return;
    setActualizando(true);
    try {
      await transparenciaService.publicarCarga(carga.id);
      showNotification('Carga publicada correctamente', 'success');
      setCarga({ ...carga, estado: 'PUBLICADA' });
    } catch (err: any) {
      showNotification(err.message || 'Error al publicar la carga', 'error');
    } finally {
      setActualizando(false);
    }
  };

  // ============================================
  // 4. RENDERIZADO DE ESTADO
  // ============================================

  const renderEstado = (estado: string) => {
    const colores: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
      PENDIENTE: 'warning',
      APROBADA: 'primary',
      PUBLICADA: 'success',
      RECHAZADA: 'error',
    };
    return <Chip label={estado} color={colores[estado] || 'default'} />;
  };

  // ============================================
  // 5. RENDERIZADO PRINCIPAL
  // ============================================

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error || !carga) {
    return (
      <Layout>
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error || 'Carga no encontrada'}</Alert>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/transparencia')}>
            Volver a transparencia
          </Button>
        </Box>
      </Layout>
    );
  }

  const puedeAprobarRechazar = usuario?.rol === 'DIRECTOR' && carga.estado === 'PENDIENTE';
  const puedePublicar = usuario?.rol === 'ENLACE' && carga.estado === 'APROBADA';

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Detalle de carga mensual
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/transparencia')}>
          Volver a transparencia
        </Button>
      </Box>

      {/* Información de la carga */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="textSecondary">
              ID
            </Typography>
            <Typography variant="body1">{carga.id}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="textSecondary">
              Estado
            </Typography>
            {renderEstado(carga.estado)}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="textSecondary">
              Mes
            </Typography>
            <Typography variant="body1">{carga.mes}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="textSecondary">
              Año
            </Typography>
            <Typography variant="body1">{carga.anio}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="textSecondary">
              Fecha de carga
            </Typography>
            <Typography variant="body1">
              {new Date(carga.fechaCarga).toLocaleDateString('es-CL')}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="textSecondary">
              Usuario que cargó
            </Typography>
            <Typography variant="body1">{carga.usuario?.nombre || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" color="textSecondary">
              Ítem de transparencia
            </Typography>
            <Typography variant="body1">{carga.item?.nombre || '-'}</Typography>
            <Typography variant="body2" color="textSecondary">
              {carga.item?.descripcion || ''}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Acciones */}
      {puedeAprobarRechazar && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Acciones de aprobación
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="success"
                onClick={handleAprobar}
                disabled={actualizando}
              >
                {actualizando ? <CircularProgress size={24} /> : 'Aprobar carga'}
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleRechazar}
                disabled={actualizando}
              >
                {actualizando ? <CircularProgress size={24} /> : 'Rechazar carga'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {puedePublicar && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Acciones de publicación
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePublicar}
              disabled={actualizando}
            >
              {actualizando ? <CircularProgress size={24} /> : 'Publicar carga'}
            </Button>
          </CardContent>
        </Card>
      )}
    </Layout>
  );
};

export default DetalleCarga;