import express, { Request, Response } from 'express';

const app = express();
const port = process.env.port || 5000;

app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'Servidor funcionando correctamente' });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});