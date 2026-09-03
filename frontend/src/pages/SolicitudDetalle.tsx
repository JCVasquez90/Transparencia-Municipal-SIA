import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { solicitudService } from '../services/solicitudService';
import { Solicitud } from '../types';
import Layout from '../components/common/Layout';

// ============================================
// COMPONENTE SOLICITUD DETALLE
// ============================================

const SolicitudDetalle: React.FC = () => {
  // ============================================
  // 1. HOOKS Y ESTADOS
  // ============================================

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para responder
  const [contenidoRespuesta, setContenidoRespuesta] = useState('');
  const [respondiendo, setRespondiendo] = useState(false);

  // Estados para prórroga
  const [fundamentos, setFundamentos] = useState('');
  const [solicitandoProrroga, setSolicitandoProrroga] = useState(false);

  // ============================================
  // 2. CARGAR DATOS
  // ============================================

  useEffect(() => {
    const cargarDetalle = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const data = await solicitudService.obtenerPorId(parseInt(id, 10));
        setSolicitud(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar la solicitud');
      } finally {
        setLoading(false);
      }
    };

    cargarDetalle();
  }, [id]);

  // ============================================
  // 3. MANEJADORES DE ACCIONES
  // ============================================

  const handleResponder = async () => {
    if (!solicitud) return;
    setRespondiendo(true);
    setError(null);

    try {
      await solicitudService.responder(solicitud.id, contenidoRespuesta);
      // Recargar la solicitud para mostrar los cambios
      const data = await solicitudService.obtenerPorId(solicitud.id);
      setSolicitud(data);
      setContenidoRespuesta('');
      alert('✅ Solicitud respondida correctamente');
    } catch (err: any) {
      setError(err.message || 'Error al responder la solicitud');
    } finally {
      setRespondiendo(false);
    }
  };

  const handleSolicitarProrroga = async () => {
    if (!solicitud) return;
    setSolicitandoProrroga(true);
    setError(null);

    try {
      await solicitudService.solicitarProrroga(solicitud.id, fundamentos);
      // Recargar la solicitud para mostrar los cambios
      const data = await solicitudService.obtenerPorId(solicitud.id);
      setSolicitud(data);
      setFundamentos('');
      alert('✅ Prórroga solicitada correctamente');
    } catch (err: any) {
      setError(err.message || 'Error al solicitar la prórroga');
    } finally {
      setSolicitandoProrroga(false);
    }
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
      <Chip label={labels[semaforo] || semaforo} color={colores[semaforo] || 'default'} />
    ) : (
      <Chip label="Sin semáforo" />
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

  if (error || !solicitud) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Solicitud no encontrada'}</Alert>
        <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/solicitudes')}>
          Volver a solicitudes
        </Button>
      </Container>
    );
  }

  const puedeResponder = usuario?.rol === 'DIRECTOR' && solicitud.estado !== 'RESPONDIDA';
  const puedeSolicitarProrroga =
    usuario?.rol === 'ENLACE' &&
    solicitud.estado !== 'RESPONDIDA' &&
    solicitud.estado !== 'PRORROGA_SOLICITADA';

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Solicitud {solicitud.folio}
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/solicitudes')}>
          Volver a solicitudes
        </Button>
      </Box>

      {/* Información principal */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="textSecondary">
              Folio
            </Typography>
            <Typography variant="body1">{solicitud.folio}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="textSecondary">
              Estado
            </Typography>
            <Chip
              label={solicitud.estado}
              color={
                solicitud.estado === 'RESPONDIDA'
                  ? 'success'
                  : solicitud.estado === 'VENCIDA' || solicitud.estado === 'PRORROGA_SOLICITADA'
                  ? 'warning'
                  : 'primary'
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="textSecondary">
              Fecha de recepción
            </Typography>
            <Typography variant="body1">
              {new Date(solicitud.fechaRecepcion).toLocaleDateString('es-CL')}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="textSecondary">
              Plazo límite
            </Typography>
            <Typography variant="body1">
              {new Date(solicitud.plazoLimite).toLocaleDateString('es-CL')}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="textSecondary">
              Semáforo
            </Typography>
            {renderSemaforo(solicitud.semaforo)}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="textSecondary">
              Departamento responsable
            </Typography>
            <Typography variant="body1">{solicitud.departamento?.nombre || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="textSecondary">
              Descripción
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {solicitud.descripcion}
            </Typography>
          </Grid>
          {solicitud.contenidoRespuesta && (
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="textSecondary">
                Respuesta
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {solicitud.contenidoRespuesta}
              </Typography>
              {solicitud.fechaRespuesta && (
                <Typography variant="caption" color="textSecondary">
                  Respondida el: {new Date(solicitud.fechaRespuesta).toLocaleDateString('es-CL')}
                </Typography>
              )}
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Mensaje de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Acciones: Responder */}
      {puedeResponder && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Responder solicitud
            </Typography>
            <TextField
              fullWidth
              label="Contenido de la respuesta"
              value={contenidoRespuesta}
              onChange={(e) => setContenidoRespuesta(e.target.value)}
              multiline
              rows={3}
              margin="normal"
              disabled={respondiendo}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleResponder}
              disabled={!contenidoRespuesta.trim() || respondiendo}
              sx={{ mt: 2 }}
            >
              {respondiendo ? <CircularProgress size={24} /> : 'Responder'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Acciones: Solicitar prórroga */}
      {puedeSolicitarProrroga && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Solicitar prórroga
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              La prórroga extiende el plazo en 10 días hábiles.
            </Typography>
            <TextField
              fullWidth
              label="Fundamentos de la prórroga"
              value={fundamentos}
              onChange={(e) => setFundamentos(e.target.value)}
              multiline
              rows={2}
              margin="normal"
              disabled={solicitandoProrroga}
            />
            <Button
              variant="contained"
              color="warning"
              onClick={handleSolicitarProrroga}
              disabled={!fundamentos.trim() || solicitandoProrroga}
              sx={{ mt: 2 }}
            >
              {solicitandoProrroga ? <CircularProgress size={24} /> : 'Solicitar prórroga'}
            </Button>
          </CardContent>
        </Card>
      )}
    </Layout>
  );
};

export default SolicitudDetalle;