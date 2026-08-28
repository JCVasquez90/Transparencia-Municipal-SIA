import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

//Importaciones de rutas.
import solicitudRoutes from './routes/solicitud.routes.ts';
import usuarioRoutes from './routes/usuario.routes.ts';
import transparenciaRoutes from './routes/transparencia.routes.ts';

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

//Manejo de errores (middleware error).
//Middleware para manejar errores no controlados en la aplicación.
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error no controlado:', err);
//Si el error tiene un statusCode definido, lo usamos, de lo contrario usamos 500 (Internal Server Error).
    const statusCode = (err as any).statusCode || 500;
    const message = (err as any).message || 'Error interno del servidor';

    res.status(statusCode).json({
        success: false,
        message, 
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

export default app;