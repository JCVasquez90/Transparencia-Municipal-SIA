import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  TextField,
  MenuItem,
} from '@mui/material';
import apiClient from '../api/client';

// ============================================
// VISTA PÚBLICA DE TRANSPARENCIA ACTIVA
// ============================================

const PublicoTransparencia: React.FC = () => {
  const [publicaciones, setPublicaciones] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mes, setMes] = useState('8');
  const [anio, setAnio] = useState(2026);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/transparencia/publicado?mes=${mes}&anio=${anio}`);
        setPublicaciones(response.data.data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar las publicaciones');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [mes, anio]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Encabezado del portal */}
        <Paper sx={{ p: 4, mb: 4, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h3" gutterBottom>
            Transparencia Activa
          </Typography>
          <Typography variant="h4">
            {publicaciones?.municipio || 'Municipio x'}
          </Typography>
          <Typography variant="body2">
            Información publicada conforme a la Ley N° 20.285
          </Typography>
        </Paper>

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Mes"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((m) => (
                <MenuItem key={m} value={m}>
                  {new Date(2026, Number(m) - 1).toLocaleString('es-CL', { month: 'long' })}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Año"
              type="number"
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              size="small"
              sx={{ minWidth: 150 }}
            />
          </Box>
        </Paper>

        {/* Publicaciones */}
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {publicaciones?.totalPublicaciones === 0 ? (
          <Alert severity="info">No hay publicaciones para este período.</Alert>
        ) : (
          <Grid container spacing={3}>
            {publicaciones?.publicaciones.map((pub: any) => (
              <Grid size={{ xs: 12, md: 6 }} key={pub.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {pub.item?.nombre}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {pub.item?.descripcion}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">
                        <strong>Departamento:</strong> {pub.item?.departamentoResponsable?.nombre}
                      </Typography>
                      <Chip label={pub.estado} color="success" size="small" />
                    </Box>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                      Publicado el: {new Date(pub.fechaCarga).toLocaleDateString('es-CL')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Footer del portal */}
        <Paper sx={{ p: 2, mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="textSecondary">
            Última actualización: {publicaciones?.fechaConsulta ? new Date(publicaciones.fechaConsulta).toLocaleString('es-CL') : '-'}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default PublicoTransparencia;