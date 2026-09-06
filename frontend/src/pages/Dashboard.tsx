import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
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
  Grid,
} from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { solicitudService } from '../services/solicitudService';
import { Solicitud } from '../types';
import Layout from '../components/common/Layout';

// ============================================
// COMPONENTE DASHBOARD
// ============================================

const Dashboard: React.FC = () => {
  // ============================================
  // 1. HOOKS Y ESTADOS
  // ============================================

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [kpis, setKpis] = useState({
    total: 0,
    porEstado: {} as Record<string, number>,
    porSemaforo: {} as Record<string, number>,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ordenAscendente, setOrdenAscendente] = useState(false); // ← Nuevo estado

  // ============================================
  // 2. CARGAR DATOS
  // ============================================

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpisData, solicitudesData] = await Promise.all([
        solicitudService.obtenerKPIs(),
        solicitudService.listar(),
      ]);
      setKpis(kpisData);
      setSolicitudes(solicitudesData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 3. FUNCIÓN PARA ORDENAR SOLICITUDES POR FOLIO
  // ============================================

  const solicitudesOrdenadas = () => {
    // Crear una copia para no modificar el estado original
    const copia = [...solicitudes];

    // Ordenar por número de folio (correlativo)
    return copia.sort((a, b) => {
      // Extraer el número del folio (ej. "SIA-2026-001" → 1)
      const numA = parseInt(a.folio.split('-')[2], 10);
      const numB = parseInt(b.folio.split('-')[2], 10);

      // Si el número no es válido, usar el ID como fallback
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
      <Chip
        label={labels[semaforo] || semaforo}
        color={colores[semaforo] || 'default'}
        size="small"
      />
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
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Dashboard
        </Typography>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* KPIs - Tarjetas de resumen */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total solicitudes
              </Typography>
              <Typography variant="h4">{kpis.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pendientes
              </Typography>
              <Typography variant="h4">{kpis.porEstado?.PENDIENTE || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Respondidas
              </Typography>
              <Typography variant="h4">{kpis.porEstado?.RESPONDIDA || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Vencidas (semáforo)
              </Typography>
              <Typography variant="h4" color="error">
                {kpis.porSemaforo?.VENCIDO || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de solicitudes con ordenamiento */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Últimas solicitudes
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setOrdenAscendente(!ordenAscendente)}
            startIcon={ordenAscendente ? <ArrowUpward /> : <ArrowDownward />}
          >
            {ordenAscendente ? 'Ascendente' : 'Descendente'}
          </Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Folio</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Semáforo</TableCell>
                <TableCell>Plazo límite</TableCell>
                <TableCell>Departamento</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {solicitudes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No hay solicitudes registradas
                  </TableCell>
                </TableRow>
              ) : (
                solicitudesOrdenadas().slice(0, 10).map((solicitud) => (
                  <TableRow key={solicitud.id}>
                    <TableCell>{solicitud.folio}</TableCell>
                    <TableCell>{solicitud.descripcion.substring(0, 50)}...</TableCell>
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
                    <TableCell>
                      {new Date(solicitud.plazoLimite).toLocaleDateString('es-CL')}
                    </TableCell>
                    <TableCell>{solicitud.departamento?.nombre || '-'}</TableCell>
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

export default Dashboard;