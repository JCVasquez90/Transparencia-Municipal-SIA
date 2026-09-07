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
  List,
  ListItem,
  ListItemText,
  IconButton,
  MenuItem,
} from '@mui/material';
import { CloudUpload, Download, InsertDriveFile } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { solicitudService } from '../services/solicitudService';
import { archivoService } from '../services/archivoService';
import { Solicitud, Archivo } from '../types';
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
  const { showNotification } = useNotification();

  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para responder
  const [contenidoRespuesta, setContenidoRespuesta] = useState('');
  const [respondiendo, setRespondiendo] = useState(false);

  // Estados para prórroga
  const [fundamentos, setFundamentos] = useState('');
  const [solicitandoProrroga, setSolicitandoProrroga] = useState(false);

  // Estados para archivos
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [cargandoArchivos, setCargandoArchivos] = useState(true);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [tipoArchivo, setTipoArchivo] = useState<'EVIDENCIA_SOLICITUD' | 'RESPUESTA'>('EVIDENCIA_SOLICITUD');
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);

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

  useEffect(() => {
    const cargarArchivos = async () => {
      if (!id) return;
      setCargandoArchivos(true);
      try {
        const data = await archivoService.listar(parseInt(id, 10));
        setArchivos(data);
      } catch (err: any) {
        showNotification(err.message || 'Error al cargar los archivos', 'error');
      } finally {
        setCargandoArchivos(false);
      }
    };

    cargarArchivos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      showNotification('Respuesta enviada correctamente', 'success');
    } catch (err: any) {
      const mensaje = err.response?.data?.message || err.message || 'Error al responder la solicitud';
      showNotification(mensaje, 'error');
      setError(mensaje);
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
      const data = await solicitudService.obtenerPorId(solicitud.id);
      setSolicitud(data);
      setFundamentos('');
      showNotification('Prórroga solicitada correctamente', 'success');
    } catch (err: any) {
      const mensaje = err.response?.data?.message || err.message || 'Error al solicitar la prórroga';
      showNotification(mensaje, 'error');
      setError(mensaje);
    } finally {
      setSolicitandoProrroga(false);
    }
  };

  const handleSubirArchivo = async () => {
    if (!solicitud || !archivoSeleccionado) return;
    setSubiendoArchivo(true);

    try {
      await archivoService.subir(solicitud.id, archivoSeleccionado, tipoArchivo);
      const data = await archivoService.listar(solicitud.id);
      setArchivos(data);
      setArchivoSeleccionado(null);
      showNotification('Archivo subido correctamente', 'success');
    } catch (err: any) {
      const mensaje = err.response?.data?.message || err.message || 'Error al subir el archivo';
      showNotification(mensaje, 'error');
    } finally {
      setSubiendoArchivo(false);
    }
  };

  const handleDescargarArchivo = async (archivo: Archivo) => {
    try {
      await archivoService.descargar(archivo.id, archivo.nombre);
    } catch (err: any) {
      showNotification('Error al descargar el archivo', 'error');
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
  const puedeSubirArchivo = usuario?.rol === 'OPERATIVO' || usuario?.rol === 'DIRECTOR';

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
        <Card sx={{ mb: 3 }}>
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

      {/* Sección: Archivos adjuntos */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Archivos adjuntos
          </Typography>

          {/* Listado */}
          {cargandoArchivos ? (
            <CircularProgress size={24} />
          ) : archivos.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              No hay archivos adjuntos todavía
            </Typography>
          ) : (
            <List>
              {archivos.map((archivo) => (
                <ListItem
                  key={archivo.id}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleDescargarArchivo(archivo)} title="Descargar">
                      <Download />
                    </IconButton>
                  }
                >
                  <InsertDriveFile sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                    primary={archivo.nombre}
                    secondary={archivo.tipo === 'EVIDENCIA_SOLICITUD' ? 'Evidencia' : 'Respuesta'}
                  />
                </ListItem>
              ))}
            </List>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Subir nuevo archivo (OPERATIVO y DIRECTOR) */}
          {puedeSubirArchivo && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button variant="outlined" component="label" startIcon={<CloudUpload />} disabled={subiendoArchivo}>
                Seleccionar archivo
                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setArchivoSeleccionado(e.target.files?.[0] || null)}
                />
              </Button>

              <TextField
                select
                label="Tipo"
                value={tipoArchivo}
                onChange={(e) => setTipoArchivo(e.target.value as 'EVIDENCIA_SOLICITUD' | 'RESPUESTA')}
                size="small"
                sx={{ minWidth: 200 }}
                disabled={subiendoArchivo}
              >
                <MenuItem value="EVIDENCIA_SOLICITUD">Evidencia</MenuItem>
                <MenuItem value="RESPUESTA">Respuesta</MenuItem>
              </TextField>

              <Button
                variant="contained"
                onClick={handleSubirArchivo}
                disabled={!archivoSeleccionado || subiendoArchivo}
              >
                {subiendoArchivo ? <CircularProgress size={24} /> : 'Subir'}
              </Button>

              {archivoSeleccionado && (
                <Typography variant="body2" color="textSecondary">
                  {archivoSeleccionado.name}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
};

export default SolicitudDetalle;