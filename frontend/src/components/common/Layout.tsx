import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// ============================================
// COMPONENTE LAYOUT
// ============================================

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Menú de usuario (opcional)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  // Determinar qué enlace está activo
  const isActive = (path: string) => location.pathname === path;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Barra de navegación */}
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          {/* Logo / Título */}
          <Typography
            variant="h6"
            component={Link}
            to="/dashboard"
            sx={{
              flexGrow: 0,
              textDecoration: 'none',
              color: 'white',
              fontWeight: 'bold',
              mr: 4,
            }}
          >
            Transparencia
          </Typography>

          {/* Enlaces de navegación */}
          <Box sx={{ display: 'flex', gap: 2, flexGrow: 1 }}>
            <Button
              component={Link}
              to="/dashboard"
              color="inherit"
              sx={{
                fontWeight: isActive('/dashboard') ? 'bold' : 'normal',
                borderBottom: isActive('/dashboard') ? '2px solid white' : 'none',
                borderRadius: 0,
              }}
            >
              Dashboard
            </Button>
            <Button
              component={Link}
              to="/solicitudes"
              color="inherit"
              sx={{
                fontWeight: isActive('/solicitudes') ? 'bold' : 'normal',
                borderBottom: isActive('/solicitudes') ? '2px solid white' : 'none',
                borderRadius: 0,
              }}
            >
              Solicitudes
            </Button>
            {usuario?.rol === 'ENLACE' && (
              <Button
                component={Link}
                to="/logs"
                color="inherit"
                sx={{
                  fontWeight: isActive('/logs') ? 'bold' : 'normal',
                  borderBottom: isActive('/logs') ? '2px solid white' : 'none',
                  borderRadius: 0,
                }}
              >
                Auditoría
              </Button>
            )}
            {usuario?.rol === 'ENLACE' && (
              <Button
                component={Link}
                to="/usuarios"
                color="inherit"
                sx={{
                  fontWeight: isActive('/usuarios') ? 'bold' : 'normal',
                  borderBottom: isActive('/usuarios') ? '2px solid white' : 'none',
                  borderRadius: 0,
                }}
              >
                Usuarios
              </Button>
            )}
          </Box>

          {/* Usuario y logout */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'white' }}>
              {usuario?.nombre} ({usuario?.rol})
            </Typography>
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {usuario?.nombre?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
            <Menu
              id="account-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Contenido principal */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {children}
      </Container>

      {/* Footer (opcional) */}
      <Box
        component="footer"
        sx={{
          py: 2,
          textAlign: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="body2" color="textSecondary">
          Transparencia Municipal - Instituto Profesional San Sebastián 2026
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;