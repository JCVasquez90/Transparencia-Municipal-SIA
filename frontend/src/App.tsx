import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Solicitudes from './pages/Solicitudes';
import NuevaSolicitud from './pages/NuevaSolicitud';
import SolicitudDetalle from './pages/SolicitudDetalle';
import LogAuditoria from './pages/LogAuditoria';
import Usuarios from './pages/Usuarios';
import TransparenciaActiva from './pages/TransparenciaActiva';
import DetalleCarga from './pages/DetalleCarga';
import PublicoTransparencia from './pages/PublicoTransparencia';
//import './App.css';
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div>Cargando...</div>;
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};
function App() {
  const { isAuthenticated } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/solicitudes"
          element={
            <PrivateRoute>
              <Solicitudes />
            </PrivateRoute>
          }
        />
        <Route
          path="/solicitudes/nueva"
          element={
            <PrivateRoute>
              <NuevaSolicitud />
            </PrivateRoute>
          }
        />
        <Route
          path="/solicitudes/:id"
          element={
            <PrivateRoute>
              <SolicitudDetalle />
            </PrivateRoute>
          }
        />
        <Route
          path="/logs"
          element={
            <PrivateRoute>
              <LogAuditoria />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <PrivateRoute>
              <Usuarios />
            </PrivateRoute>
          }
        />
        <Route
          path="/transparencia"
          element={
            <PrivateRoute>
              <TransparenciaActiva />
            </PrivateRoute>
          }
        />
        <Route
          path="/transparencia/carga/:id"
          element={
            <PrivateRoute>
              <DetalleCarga />
            </PrivateRoute>
          }
        />
        <Route
        path="/transparencia/publicado"
         element={<PublicoTransparencia />
         }
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;