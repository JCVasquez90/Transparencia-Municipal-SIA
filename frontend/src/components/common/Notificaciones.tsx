import React, { useState, useEffect } from 'react';
import {
    IconButton,
    Badge,
    Popover,
    List,
    ListItem,
    ListItemText,
    Typography,
    Box,
    Button,
    CircularProgress,
    Divider,
} from '@mui/material';
import { Notifications as NotificationsIcon, DoneAll } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { notificacionService, Notificacion } from '../../services/notificacionService';

const Notificaciones: React.FC = () => {
    const { usuario } = useAuth();
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
    const [loading, setLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [marcandoTodas, setMarcandoTodas] = useState(false);
    const open = Boolean(anchorEl);
    const id = open ? 'notificaciones-popover' : undefined;

    const cargarNotificaciones = async () => {
        if (!usuario) return;
        setLoading(true);
        try {
            const data = await notificacionService.obtenerNoLeidas();
            setNotificaciones(data);
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (usuario) {
            cargarNotificaciones();
            // Recargar cada 30 segundos
            const interval = setInterval(cargarNotificaciones, 30000);
            return () => clearInterval(interval);
        }
    }, [usuario]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMarcarComoLeida = async (id: number) => {
        try {
            await notificacionService.marcarComoLeida(id);
            setNotificaciones(notificaciones.filter((n) => n.id !== id));
        } catch (error) {
            console.error('Error al marcar como leída:', error);
        }
    };

    const handleMarcarTodas = async () => {
        setMarcandoTodas(true);
        try {
            await notificacionService.marcarTodasComoLeidas();
            setNotificaciones([]);
        } catch (error) {
            console.error('Error al marcar todas como leídas:', error);
        } finally {
            setMarcandoTodas(false);
        }
    };

    const contarNoLeidas = notificaciones.length;

    return (
        <>
            <IconButton
                aria-describedby={id}
                onClick={handleClick}
                color="inherit"
                size="large"
            >
                <Badge badgeContent={contarNoLeidas} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                slotProps={{
                    paper: {
                        sx: { width: 350, maxHeight: 400 },
                    },
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6">Notificaciones</Typography>
                        {contarNoLeidas > 0 && (
                            <Button
                                size="small"
                                startIcon={<DoneAll />}
                                onClick={handleMarcarTodas}
                                disabled={marcandoTodas}
                            >
                                {marcandoTodas ? <CircularProgress size={20} /> : 'Marcar todas'}
                            </Button>
                        )}
                    </Box>
                    <Divider />
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress size={30} />
                    </Box>
                ) : notificaciones.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="textSecondary">No tienes notificaciones pendientes</Typography>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {notificaciones.map((notificacion) => (
                            <ListItem
                                key={notificacion.id}
                                sx={{
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    '&:hover': { bgcolor: 'action.hover' },
                                    cursor: 'pointer',
                                }}
                                onClick={() => handleMarcarComoLeida(notificacion.id)}
                            >
                                <ListItemText
                                    primary={notificacion.mensaje}
                                    secondary={new Date(notificacion.createdAt).toLocaleString('es-CL')}
                                    slotProps={{
                                        primary: { variant: 'body2' },
                                        secondary: { variant: 'caption' },
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Popover>
        </>
    );
};

export default Notificaciones;