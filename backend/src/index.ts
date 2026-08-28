import app from './app.ts';
import { PrismaClient } from '../generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';

// Puerto en el que correrá el servidor.
const PORT = process.env.PORT || 5000;

// Creamos un adaptador de PostgreSQL usando la URL de conexión del .env
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// Creamos una instancia de PrismaClient con el adaptador
export const prisma = new PrismaClient({
  adapter,
});

// Definimos una función asíncrona para iniciar el servidor.
// Esto permite manejar errores de conexión a la base de datos de forma elegante.
async function main() {
  try {
    // Intentamos conectar con la base de datos
    await prisma.$connect();
    console.log('✅ Conectado a PostgreSQL correctamente');

    // Iniciamos el servidor Express
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📝 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    // Si hay un error al conectar con la base de datos o al levantar el servidor,
    // lo mostramos en consola y finalizamos el proceso.
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Llamamos a la función main para iniciar el servidor.
main();

// Cuando el proceso se detiene (Ctrl+C o kill), cerramos la conexión con Prisma
// para evitar conexiones abiertas.
process.on('SIGINT', async () => {
  console.log('🛑 Recibida señal SIGINT. Cerrando conexiones...');
  await prisma.$disconnect();
  console.log('✅ Conexión cerrada correctamente');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Recibida señal SIGTERM. Cerrando conexiones...');
  await prisma.$disconnect();
  console.log('✅ Conexión cerrada correctamente');
  process.exit(0);
});