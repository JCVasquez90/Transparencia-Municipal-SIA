import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

//Importaciones de rutas.
import solicitudRoutes from './routes/solicitud.routes.ts';
import usuarioRoutes from './routes/usuario.routes.ts';
import transparenciaRoutes from './routes/transparencia.routes.ts';
import authRoutes from './routes/auth.routes.ts';
import { errorMiddleware } from './middlewares/error.middleware.ts';
import departamentoRoutes from './routes/departamento.routes.ts';
import archivoRoutes from './routes/archivo.routes.ts';
import logRoutes from './routes/log.routes.ts';
import notificacionRoutes from './routes/notificacion.routes.ts';

//Creación de la aplicación express.
const app: Application = express();

//Middlewares.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

//Rutas.
app.use('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
    });
});

app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/transparencia', transparenciaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/departamentos', departamentoRoutes);
app.use('/api/archivos', archivoRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/notificaciones', notificacionRoutes);

//Manejo de errores.
app.use(errorMiddleware);

export default app;