import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { solicitudService } from '../services/solicitudService';
import apiClient from '../api/client';
import { Departamento } from '../types';

const NuevaSolicitud: React.FC = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  // Estados del formulario

  const [fechaRecepcion, setFechaRecepcion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [departamentoId, setDepartamentoId] = useState<number>(0);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargandoDepartamentos, setCargandoDepartamentos] = useState(true);

  // Cargar departamentos al montar el componente
  useEffect(() => {
    const cargarDepartamentos = async () => {
      try {
        const response = await apiClient.get('/departamentos');
        if (response.data.success) {
          setDepartamentos(response.data.data);
          if (response.data.data.length > 0) {
            setDepartamentoId(response.data.data[0].id);
          }
        }
      } catch (err) {
        console.error('Error al cargar departamentos:', err);
      } finally {
        setCargandoDepartamentos(false);
      }
    };
    cargarDepartamentos();
  }, []);

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await solicitudService.crear({
        fechaRecepcion,
        descripcion,
        departamentoId,
      });
      navigate('/solicitudes');
    } catch (err: any) {
      setError(err.message || 'Error al crear la solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Verificar permisos
  if (usuario?.rol !== 'OPERATIVO') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          No tienes permisos para crear solicitudes. Solo los usuarios con rol OPERATIVO pueden hacerlo.
        </Alert>
      </Container>
    );
  }

  if (cargandoDepartamentos) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Nueva solicitud de información
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
         
          <TextField
            fullWidth
            label="Fecha de recepción"
            type="date"
            value={fechaRecepcion}
            onChange={(e) => setFechaRecepcion(e.target.value)}
            required
            margin="normal"
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />

          <TextField
            fullWidth
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            margin="normal"
            multiline
            rows={4}
            placeholder="Describe la solicitud de información..."
          />

          <TextField
            fullWidth
            select
            label="Departamento responsable"
            value={departamentoId}
            onChange={(e) => setDepartamentoId(Number(e.target.value))}
            required
            margin="normal"
          >
            {departamentos.map((dep) => (
              <MenuItem key={dep.id} value={dep.id}>
                {dep.nombre}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Crear solicitud'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/solicitudes')}
            >
              Cancelar
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default NuevaSolicitud;