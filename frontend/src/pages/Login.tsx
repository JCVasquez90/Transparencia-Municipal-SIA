import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

// ============================================
// COMPONENTE Login
// ============================================

const Login: React.FC = () => {
  // ============================================
  // 1. ESTADOS DEL FORMULARIO
  // ============================================

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ============================================
  // 2. HOOKS
  // ============================================

  const { login } = useAuth();
  const navigate = useNavigate();

  // ============================================
  // 3. MANEJADOR DEL ENVÍO DEL FORMULARIO
  // ============================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que los campos no estén vacíos
    if (!email || !password) {
      setError('Por favor, complete todos los campos');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      // Redirigir al dashboard después del login exitoso
      navigate('/dashboard');
    } catch (err: any) {
      // Mostrar el mensaje de error del backend
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 4. RENDERIZADO
  // ============================================

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Título */}
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Transparencia Municipal
          </Typography>

          <Typography component="h2" variant="subtitle1" sx={{ mb: 3 }}>
            Iniciar Sesión
          </Typography>

          {/* Mensaje de error */}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Formulario */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo electrónico"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Iniciar sesión'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;

export {};