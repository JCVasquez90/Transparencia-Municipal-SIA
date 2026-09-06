import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
} from '@mui/material';
import { Add, Visibility, CheckCircle, Cancel, Publish } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { transparenciaService } from '../services/transparenciaService';
import { ItemTransparencia, CargaMensual } from '../types';
import Layout from '../components/common/Layout';

// ============================================
// COMPONENTE TRANSPARENCIA ACTIVA
// ============================================

const TransparenciaActiva: React.FC = () => {
  // ============================================
  // 1. HOOKS Y ESTADOS
  // ============================================

  const { usuario } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [items, setItems] = useState<ItemTransparencia[]>([]);
  const [cargas, setCargas] = useState<CargaMensual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemSeleccionado, setItemSeleccionado] = useState<number | null>(null);

  // Estados para el diálogo de nueva carga
  const [openDialog, setOpenDialog] = useState(false);
  const [nuevaCarga, setNuevaCarga] = useState({
    itemId: 0,
    mes: '',
    anio: new Date().getFullYear(),
  });

  // ============================================
  // 2. CARGAR DATOS
  // ============================================

  const cargarCargas = useCallback(async (itemId: number) => {
    try {
      const cargasData = await transparenciaService.listarCargas(itemId);
      setCargas(cargasData);
    } catch (err: any) {
      showNotification(err.message || 'Error al cargar las cargas', 'error');
    }
  }, [showNotification]);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const itemsData = await transparenciaService.listarItems();
      setItems(itemsData);
      if (itemsData.length > 0) {
        setItemSeleccionado(itemsData[0].id);
        await cargarCargas(itemsData[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [cargarCargas]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // ============================================
  // 3. MANEJADORES DE ACCIONES
  // ============================================

  const handleCambiarItem = (itemId: number) => {
    setItemSeleccionado(itemId);
    cargarCargas(itemId);
  };

  const handleAbrirDialog = () => {
    if (!items.length) {
      showNotification('No hay ítems de transparencia disponibles', 'warning');
      return;
    }
    setNuevaCarga({
      itemId: items[0].id,
      mes: '',
      anio: new Date().getFullYear(),
    });
    setOpenDialog(true);
  };

  const handleCrearCarga = async () => {
    if (!nuevaCarga.itemId || !nuevaCarga.mes || !nuevaCarga.anio) {
      showNotification('Por favor, complete todos los campos', 'warning');
      return;
    }

    try {
      await transparenciaService.crearCarga({
        itemId: nuevaCarga.itemId,
        mes: nuevaCarga.mes,
        anio: nuevaCarga.anio,
      });
      showNotification('Carga mensual creada correctamente', 'success');
      setOpenDialog(false);
      if (itemSeleccionado) {
        await cargarCargas(itemSeleccionado);
      }
    } catch (err: any) {
      showNotification(err.message || 'Error al crear la carga', 'error');
    }
  };

  const handleAprobar = async (id: number) => {
    try {
      await transparenciaService.aprobarCarga(id);
      showNotification('Carga aprobada correctamente', 'success');
      if (itemSeleccionado) {
        await cargarCargas(itemSeleccionado);
      }
    } catch (err: any) {
      showNotification(err.message || 'Error al aprobar la carga', 'error');
    }
  };

  const handleRechazar = async (id: number) => {
    try {
      await transparenciaService.rechazarCarga(id);
      showNotification('Carga rechazada correctamente', 'success');
      if (itemSeleccionado) {
        await cargarCargas(itemSeleccionado);
      }
    } catch (err: any) {
      showNotification(err.message || 'Error al rechazar la carga', 'error');
    }
  };

  const handlePublicar = async (id: number) => {
    try {
      await transparenciaService.publicarCarga(id);
      showNotification('Carga publicada correctamente', 'success');
      if (itemSeleccionado) {
        await cargarCargas(itemSeleccionado);
      }
    } catch (err: any) {
      showNotification(err.message || 'Error al publicar la carga', 'error');
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
    return <Chip label={estado} color={colores[estado] || 'default'} size="small" />;
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
  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                Transparencia Activa
              </Typography>
        {usuario?.rol === 'OPERATIVO' && items.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleAbrirDialog}
          >
            Nueva carga mensual
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Ítems de transparencia */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Ítems de transparencia
        </Typography>

        {items.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No hay ítems de transparencia configurados
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Contacta al administrador del sistema para crear los ítems de transparencia activa.
            </Typography>
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => window.location.reload()}
            >
              Reintentar
            </Button>
          </Paper>
        ) : (

          <Grid container spacing={2}>
            {items.map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: itemSeleccionado === item.id ? '2px solid' : '1px solid',
                    borderColor: itemSeleccionado === item.id ? 'primary.main' : 'divider',
                  }}
                  onClick={() => handleCambiarItem(item.id)}
                >
                  <CardContent>
                    <Typography variant="h6">{item.nombre}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {item.descripcion}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Responsable: {item.departamentoResponsable?.nombre || 'No asignado'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      {/* Cargas mensuales */}
      {items.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Cargas mensuales
          </Typography>

          {cargas.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="textSecondary">
                No hay cargas mensuales para este ítem
              </Typography>
              {usuario?.rol === 'OPERATIVO' && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={handleAbrirDialog}
                  sx={{ mt: 2 }}
                >
                  Crear primera carga
                </Button>
              )}
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Mes</TableCell>
                    <TableCell>Año</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Fecha de carga</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cargas.map((carga) => (
                    <TableRow key={carga.id}>
                      <TableCell>{carga.mes}</TableCell>
                      <TableCell>{carga.anio}</TableCell>
                      <TableCell>{renderEstado(carga.estado)}</TableCell>
                      <TableCell>
                        {new Date(carga.fechaCarga).toLocaleDateString('es-CL')}
                      </TableCell>
                      <TableCell>{carga.usuario?.nombre || '-'}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          {usuario?.rol === 'DIRECTOR' && carga.estado === 'PENDIENTE' && (
                            <>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleAprobar(carga.id)}
                                title="Aprobar"
                              >
                                <CheckCircle />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRechazar(carga.id)}
                                title="Rechazar"
                              >
                                <Cancel />
                              </IconButton>
                            </>
                          )}
                          {usuario?.rol === 'ENLACE' && carga.estado === 'APROBADA' && (
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handlePublicar(carga.id)}
                              title="Publicar"
                            >
                              <Publish />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => navigate(`/transparencia/carga/${carga.id}`)}
                            title="Ver detalle"
                          >
                            <Visibility />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* Diálogo para nueva carga */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Nueva carga mensual</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Ítem de transparencia"
            value={nuevaCarga.itemId}
            onChange={(e) =>
              setNuevaCarga({ ...nuevaCarga, itemId: Number(e.target.value) })
            }
            margin="normal"
          >
            {items.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.nombre}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Mes"
            value={nuevaCarga.mes}
            onChange={(e) =>
              setNuevaCarga({ ...nuevaCarga, mes: e.target.value })
            }
            margin="normal"
          >
            {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((mes) => (
              <MenuItem key={mes} value={mes}>
                {mes}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Año"
            type="number"
            value={nuevaCarga.anio}
            onChange={(e) =>
              setNuevaCarga({ ...nuevaCarga, anio: Number(e.target.value) })
            }
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={handleCrearCarga}>
            Crear carga
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default TransparenciaActiva;