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


//Creación de la aplicación express.
const app: Application = express();

//Mddlewares.
//Express entienda la peticion con body en formato JSON.
app.use(express.json());

//Express entienda la peticion con body en formato url-encoded (formularios).
app.use(express.urlencoded({ extended: true }));

//Permite que el frontend (react) pueda hacer peticiones al backend
//aunque estén en puertos diferentes (ej: frontend: 3000, backend: 5000).
app.use(cors());

//Agrega cabeceras de seguridad http para proteger la aplicacion
//contra vulnerabilidades conocidas (ej: clickjacking, XSS, etc).
app.use(helmet());

//Muestra en consola los detalles de cada peticin HTTP (método, url, status, tiempo de respuesta, etc).
app.use(morgan('dev'));

//Rutas.
//Verificar que el servidor esté funcionando correctamente.
app.use('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    });
});

//Rutas relacionadas con solicitudes.
app.use('/api/solicitudes', solicitudRoutes);

//Rutas relacionadas con usuarios.
app.use('/api/usuarios', usuarioRoutes);

//Rutas relacionadas con transparencia.
app.use('/api/transparencia', transparenciaRoutes);

//Rutas relacionadas con autenticacion
app.use('/api/auth', authRoutes);

//Manejo de errores (middleware error).
//Middleware para manejar errores no controlados en la aplicación.
app.use(errorMiddleware);

//Rutas relacionadas con departamentos.
app.use('/api/departamentos', departamentoRoutes);

//Ruta relacionada con archivos
app.use('/api/archivos', archivoRoutes);

//Ruta relacionada con logs
app.use('/api/logs', logRoutes);

export default app;