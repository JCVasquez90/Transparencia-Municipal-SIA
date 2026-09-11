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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { CloudUpload, Download, InsertDriveFile, Add, CheckCircle } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { solicitudService } from '../services/solicitudService';
import { archivoService } from '../services/archivoService';
import { Solicitud, Archivo, Subtarea, Departamento } from '../types';
import apiClient from '../api/client';
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

  // Estados para firma
  const [firma, setFirma] = useState('');
  const [firmando, setFirmando] = useState(false);

  // Estado de amparo
  const [marcandoAmparo, setMarcandoAmparo] = useState(false);

  // Estados para subtareas
  const [subtareas, setSubtareas] = useState<Subtarea[]>([]);
  const [cargandoSubtareas, setCargandoSubtareas] = useState(true);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [modalSubtareaAbierto, setModalSubtareaAbierto] = useState(false);
  const [nuevaSubtarea, setNuevaSubtarea] = useState({ departamentoId: 0, descripcion: '' });
  const [creandoSubtarea, setCreandoSubtarea] = useState(false);
  const [respondiendoSubtareaId, setRespondiendoSubtareaId] = useState<number | null>(null);
  const [respuestaSubtarea, setRespuestaSubtarea] = useState('');
  const [consolidando, setConsolidando] = useState(false);

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

  useEffect(() => {
    const cargarSubtareas = async () => {
      if (!id) return;
      setCargandoSubtareas(true);
      try {
        const data = await solicitudService.listarSubtareas(parseInt(id, 10));
        setSubtareas(data);
      } catch (err: any) {
        showNotification(err.message || 'Error al cargar las subtareas', 'error');
      } finally {
        setCargandoSubtareas(false);
      }
    };
    cargarSubtareas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
  // 3. MANEJADORES DE ACCIONES
  // ============================================

  const handleResponder = async () => {
    if (!solicitud) return;
    setRespondiendo(true);
    setError(null);
    try {
      await solicitudService.responder(solicitud.id, contenidoRespuesta);
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

  const handleFirmar = async () => {
    if (!solicitud) return;
    setFirmando(true);
    setError(null);
    try {
      await solicitudService.firmar(solicitud.id, firma);
      const data = await solicitudService.obtenerPorId(solicitud.id);
      setSolicitud(data);
      setFirma('');
      showNotification('✅ Solicitud firmada correctamente', 'success');
    } catch (err: any) {
      const mensaje = err.response?.data?.message || err.message || 'Error al firmar la solicitud';
      showNotification(mensaje, 'error');
      setError(mensaje);
    } finally {
      setFirmando(false);
    }
  };

  const handleMarcarAmparo = async () => {
    if (!solicitud) return;
    setMarcandoAmparo(true);
    try {
      await solicitudService.marcarEnAmparo(solicitud.id);
      const data = await solicitudService.obtenerPorId(solicitud.id);
      setSolicitud(data);
      showNotification('Solicitud marcada en amparo', 'success');
    } catch (err: any) {
      const mensaje = err.response?.data?.message || err.message || 'Error al marcar en amparo';
      showNotification(mensaje, 'error');
    } finally {
      setMarcandoAmparo(false);
    }
    
  };

  // ============================================
  // MANEJADORES PARA SUBTAREAS
  // ============================================

  const handleCrearSubtarea = async () => {
    if (!solicitud || !nuevaSubtarea.departamentoId || !nuevaSubtarea.descripcion.trim()) {
      showNotification('Por favor, complete todos los campos', 'warning');
      return;
    }
    setCreandoSubtarea(true);
    try {
      await solicitudService.crearSubtarea(solicitud.id, nuevaSubtarea);
      const data = await solicitudService.listarSubtareas(solicitud.id);
      setSubtareas(data);
      setModalSubtareaAbierto(false);
      setNuevaSubtarea({ departamentoId: 0, descripcion: '' });
      const solicitudData = await solicitudService.obtenerPorId(solicitud.id);
      setSolicitud(solicitudData);
      showNotification('Subtarea creada correctamente', 'success');
    } catch (err: any) {
      const mensaje = err.response?.data?.message || err.message || 'Error al crear la subtarea';
      showNotification(mensaje, 'error');
    } finally {
      setCreandoSubtarea(false);
    }
  };

  const handleResponderSubtarea = async (subtareaId: number) => {
    if (!solicitud || !respuestaSubtarea.trim()) return;
    try {
      await solicitudService.responderSubtarea(subtareaId, respuestaSubtarea);
      const data = await solicitudService.listarSubtareas(solicitud.id);
      setSubtareas(data);
      setRespondiendoSubtareaId(null);
      setRespuestaSubtarea('');
      showNotification('Subtarea respondida correctamente', 'success');
    } catch (err: any) {
      const mensaje = err.response?.data?.message || err.message || 'Error al responder la subtarea';
      showNotification(mensaje, 'error');
    }
  };

  const handleConsolidar = async () => {
    if (!solicitud) return;
    setConsolidando(true);
    try {
      await solicitudService.consolidarSubtareas(solicitud.id);
      const data = await solicitudService.obtenerPorId(solicitud.id);
      setSolicitud(data);
      showNotification('✅ Subtareas consolidadas correctamente', 'success');
    } catch (err: any) {
      const mensaje = err.response?.data?.message || err.message || 'Error al consolidar las subtareas';
      showNotification(mensaje, 'error');
    } finally {
      setConsolidando(false);
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
      CERRADO: '✅ Cerrado',
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
  const puedeFirmar = usuario?.rol === 'DIRECTOR' && solicitud.estado === 'RESPONDIDA' && !solicitud.firma;
  const puedeCrearSubtarea = usuario?.rol === 'ENLACE' && solicitud.estado !== 'RESPONDIDA';
  const puedeConsolidar =
    usuario?.rol === 'ENLACE' &&
    subtareas.length > 0 &&
    subtareas.every((s) => s.estado === 'RESPONDIDA') &&
    solicitud.estado !== 'RESPONDIDA';
  const puedeMarcarAmparo =
    usuario?.rol === 'ENLACE' && solicitud.estado === 'RESPONDIDA' && !solicitud.enAmparo;

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
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
            <Typography variant="subtitle2" color="textSecondary">Folio</Typography>
            <Typography variant="body1">{solicitud.folio}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="textSecondary">Estado</Typography>
            <Chip
              label={solicitud.estado}
              color={
                solicitud.estado === 'RESPONDIDA' ? 'success'
                : solicitud.estado === 'VENCIDA' || solicitud.estado === 'PRORROGA_SOLICITADA' ? 'warning'
                : solicitud.estado === 'EN_PROCESO' ? 'info'
                : 'primary'
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="textSecondary">Fecha de recepción</Typography>
            <Typography variant="body1">{new Date(solicitud.fechaRecepcion).toLocaleDateString('es-CL')}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="textSecondary">Plazo límite</Typography>
            <Typography variant="body1">{new Date(solicitud.plazoLimite).toLocaleDateString('es-CL')}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="textSecondary">Semáforo</Typography>
            {renderSemaforo(solicitud.semaforo)}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="textSecondary">Departamento responsable</Typography>
            <Typography variant="body1">{solicitud.departamento?.nombre || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="textSecondary">Descripción</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{solicitud.descripcion}</Typography>
          </Grid>
          {solicitud.contenidoRespuesta && (
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="textSecondary">Respuesta</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{solicitud.contenidoRespuesta}</Typography>
              {solicitud.fechaRespuesta && (
                <Typography variant="caption" color="textSecondary">
                  Respondida el: {new Date(solicitud.fechaRespuesta).toLocaleDateString('es-CL')}
                </Typography>
              )}
            </Grid>
          )}
          {solicitud.firma && solicitud.fechaFirma && (
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="textSecondary">Firma</Typography>
              <Typography variant="body1">{solicitud.firma}</Typography>
              <Typography variant="caption" color="textSecondary">
                Firmada el: {new Date(solicitud.fechaFirma).toLocaleDateString('es-CL')}
              </Typography>
            </Grid>
          )}
          {solicitud.enAmparo && solicitud.fechaAmparo && (
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="error">
                ⚠️ Solicitud en amparo ante el CPLT
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Marcada el: {new Date(solicitud.fechaAmparo).toLocaleDateString('es-CL')}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* SECCIÓN DE SUBTAREAS */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Subtareas ({subtareas.length})
            </Typography>
            {puedeCrearSubtarea && (
              <Button
                variant="contained"
                size="small"
                startIcon={<Add />}
                onClick={() => setModalSubtareaAbierto(true)}
              >
                Nueva subtarea
              </Button>
            )}
          </Box>

          {cargandoSubtareas ? (
            <CircularProgress size={24} />
          ) : subtareas.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              No hay subtareas. {puedeCrearSubtarea ? 'Crea una subtarea para derivar la solicitud a un departamento.' : ''}
            </Typography>
          ) : (
            <>
              <List>
                {subtareas.map((sub) => (
                  <ListItem
                    key={sub.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2">
                          <strong>Departamento:</strong> {sub.departamento?.nombre}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {sub.descripcion}
                        </Typography>
                        {sub.contenidoRespuesta && (
                          <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                            <Typography variant="caption" color="textSecondary">Respuesta:</Typography>
                            <Typography variant="body2">{sub.contenidoRespuesta}</Typography>
                            {sub.usuario && (
                              <Typography variant="caption" color="textSecondary">
                                Respondido por: {sub.usuario.nombre}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <Chip
                          label={sub.estado}
                          size="small"
                          color={
                            sub.estado === 'RESPONDIDA' ? 'success'
                            : sub.estado === 'EN_PROCESO' ? 'warning'
                            : 'default'
                          }
                        />
                        {usuario?.rol === 'DIRECTOR' && sub.estado !== 'RESPONDIDA' && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setRespondiendoSubtareaId(sub.id)}
                          >
                            Responder
                          </Button>
                        )}
                      </Box>
                    </Box>

                    {respondiendoSubtareaId === sub.id && (
                      <Box sx={{ width: '100%', mt: 2 }}>
                        <TextField
                          fullWidth
                          label="Contenido de la respuesta"
                          value={respuestaSubtarea}
                          onChange={(e) => setRespuestaSubtarea(e.target.value)}
                          multiline
                          rows={2}
                          size="small"
                        />
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleResponderSubtarea(sub.id)}
                            disabled={!respuestaSubtarea.trim()}
                          >
                            Enviar respuesta
                          </Button>
                          <Button
                            size="small"
                            onClick={() => {
                              setRespondiendoSubtareaId(null);
                              setRespuestaSubtarea('');
                            }}
                          >
                            Cancelar
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </ListItem>
                ))}
              </List>

              {puedeConsolidar && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={handleConsolidar}
                    disabled={consolidando}
                  >
                    {consolidando ? <CircularProgress size={24} /> : 'Consolidar respuestas'}
                  </Button>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal para crear subtarea */}
      <Dialog open={modalSubtareaAbierto} onClose={() => setModalSubtareaAbierto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva subtarea</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Departamento"
            value={nuevaSubtarea.departamentoId}
            onChange={(e) => setNuevaSubtarea({ ...nuevaSubtarea, departamentoId: Number(e.target.value) })}
            margin="normal"
          >
            {departamentos.map((dep) => (
              <MenuItem key={dep.id} value={dep.id}>
                {dep.nombre}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Descripción"
            value={nuevaSubtarea.descripcion}
            onChange={(e) => setNuevaSubtarea({ ...nuevaSubtarea, descripcion: e.target.value })}
            multiline
            rows={3}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalSubtareaAbierto(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCrearSubtarea}
            disabled={!nuevaSubtarea.departamentoId || !nuevaSubtarea.descripcion.trim() || creandoSubtarea}
          >
            {creandoSubtarea ? <CircularProgress size={24} /> : 'Crear subtarea'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mensaje de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Acciones: Responder solicitud */}
      {puedeResponder && subtareas.length === 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Responder solicitud</Typography>
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
            <Typography variant="h6" gutterBottom>Solicitar prórroga</Typography>
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

      {/* Acciones: Firmar solicitud */}
      {puedeFirmar && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Firmar solicitud</Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Al firmar, confirmas que la respuesta ha sido revisada y autorizada.
            </Typography>
            <TextField
              fullWidth
              label="Firma (nombre completo)"
              value={firma}
              onChange={(e) => setFirma(e.target.value)}
              placeholder="Ej: María López"
              margin="normal"
              disabled={firmando}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleFirmar}
              disabled={!firma.trim() || firmando}
              sx={{ mt: 2 }}
            >
              {firmando ? <CircularProgress size={24} /> : 'Firmar'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Acciones: Marcar en amparo */}
      {puedeMarcarAmparo && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Marcar en amparo</Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Marca esta solicitud si el ciudadano presentó un amparo ante el CPLT.
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={handleMarcarAmparo}
              disabled={marcandoAmparo}
            >
              {marcandoAmparo ? <CircularProgress size={24} /> : 'Marcar en amparo'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sección: Archivos adjuntos */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Archivos adjuntos</Typography>

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
                <Typography variant="body2" color="textSecondary">{archivoSeleccionado.name}</Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
};

export default SolicitudDetalle;