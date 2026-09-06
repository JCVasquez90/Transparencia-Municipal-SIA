import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

// ============================================
// 1. DEFINIR EL TIPO DEL CONTEXTO
// ============================================

interface NotificationContextType {
  showNotification: (message: string, severity?: AlertColor) => void;
}

// ============================================
// 2. CREAR EL CONTEXTO
// ============================================

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ============================================
// 3. PROVEEDOR DEL CONTEXTO
// ============================================

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info');

  const showNotification = (message: string, severity: AlertColor = 'info') => {
    setMessage(message);
    setSeverity(severity);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

// ============================================
// 4. HOOK PARA USAR EL CONTEXTO
// ============================================

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification debe ser usado dentro de un NotificationProvider');
  }
  return context;
};