import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;

async function main() {
  console.log('🌱 Iniciando seeding...');

  // ============================================
  // 1. CREAR DEPARTAMENTOS
  // ============================================

  const departamentos = await prisma.departamento.createMany({
    data: [
      { nombre: 'Obras' },
      { nombre: 'Tránsito' },
      { nombre: 'Jurídica' },
      { nombre: 'Administración y Finanzas' },
      { nombre: 'DIDECO' },
      { nombre: 'Medio Ambiente' },
      { nombre: 'DAEM' },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Creados ${departamentos.count} departamentos`);

  // ============================================
  // 2. OBTENER LOS DEPARTAMENTOS CREADOS
  // ============================================

  const departamentosList = await prisma.departamento.findMany();

  // ============================================
  // 3. CREAR USUARIOS CON DIFERENTES ROLES
  // ============================================

  const passwordHash = await bcrypt.hash('miPassword123', SALT_ROUNDS);

  const usuarios = await prisma.usuario.createMany({
    data: [
      {
        nombre: 'Operativo Juan',
        email: 'operativo@test.com',
        passwordHash,
        rol: 'OPERATIVO',
        departamentoId: departamentosList.find(d => d.nombre === 'Obras')?.id || 1,
      },
      {
        nombre: 'Director María',
        email: 'director@test.com',
        passwordHash,
        rol: 'DIRECTOR',
        departamentoId: departamentosList.find(d => d.nombre === 'Obras')?.id || 1,
      },
      {
        nombre: 'Enlace Carlos',
        email: 'enlace@test.com',
        passwordHash,
        rol: 'ENLACE',
        departamentoId: departamentosList.find(d => d.nombre === 'Obras')?.id || 1,
      },
      {
        nombre: 'Operativo Ana',
        email: 'operativo2@test.com',
        passwordHash,
        rol: 'OPERATIVO',
        departamentoId: departamentosList.find(d => d.nombre === 'Tránsito')?.id || 1,
      },
      {
        nombre: 'Director Pedro',
        email: 'director2@test.com',
        passwordHash,
        rol: 'DIRECTOR',
        departamentoId: departamentosList.find(d => d.nombre === 'Tránsito')?.id || 1,
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Creados ${usuarios.count} usuarios`);

  // ============================================
  // 4. CREAR ÍTEMS DE TRANSPARENCIA
  // ============================================

  const obrasDepto = departamentosList.find(d => d.nombre === 'Obras');
  const transitoDepto = departamentosList.find(d => d.nombre === 'Tránsito');
  const juridicaDepto = departamentosList.find(d => d.nombre === 'Jurídica');

  const items = await prisma.itemTransparencia.createMany({
    data: [
      {
        nombre: 'Planilla de sueldos',
        descripcion: 'Remuneraciones mensuales del personal municipal',
        departamentoResponsableId: obrasDepto?.id || 1,
      },
      {
        nombre: 'Compras públicas',
        descripcion: 'Detalle de compras y contrataciones realizadas',
        departamentoResponsableId: obrasDepto?.id || 1,
      },
      {
        nombre: 'Subsidios entregados',
        descripcion: 'Listado de subsidios otorgados a la comunidad',
        departamentoResponsableId: juridicaDepto?.id || 1,
      },
      {
        nombre: 'Permisos de construcción',
        descripcion: 'Permisos de construcción otorgados en el último período',
        departamentoResponsableId: obrasDepto?.id || 1,
      },
      {
        nombre: 'Multas de tránsito',
        descripcion: 'Multas de tránsito aplicadas por infracciones',
        departamentoResponsableId: transitoDepto?.id || 1,
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Creados ${items.count} ítems de transparencia`);

  // ============================================
  // 5. CREAR SOLICITUDES DE PRUEBA
  // ============================================

  const usuarioOperativo = await prisma.usuario.findFirst({
    where: { email: 'operativo@test.com' },
  });

  const usuarioDirector = await prisma.usuario.findFirst({
    where: { email: 'director@test.com' },
  });

  if (usuarioOperativo && usuarioDirector) {
    // Solicitud 1: Pendiente
    await prisma.solicitud.create({
      data: {
        folio: 'SIA-2026-001',
        fechaRecepcion: new Date('2026-08-15'),
        descripcion: 'Solicito información sobre los permisos de construcción otorgados en el último año en la comuna.',
        estado: 'PENDIENTE',
        plazoLimite: new Date('2026-09-12'),
        usuarioId: usuarioOperativo.id,
        departamentoId: obrasDepto?.id || 1,
      },
    });

    // Solicitud 2: Respondida
    await prisma.solicitud.create({
      data: {
        folio: 'SIA-2026-002',
        fechaRecepcion: new Date('2026-07-20'),
        descripcion: 'Solicito información sobre las multas de tránsito aplicadas en el mes de junio.',
        estado: 'RESPONDIDA',
        plazoLimite: new Date('2026-08-17'),
        usuarioId: usuarioOperativo.id,
        departamentoId: transitoDepto?.id || 1,
        contenidoRespuesta: 'La información solicitada se encuentra en el informe adjunto. Se detallan 150 multas aplicadas en el mes de junio.',
        fechaRespuesta: new Date('2026-08-10'),
      },
    });

    // Solicitud 3: Con prórroga
    await prisma.solicitud.create({
      data: {
        folio: 'SIA-2026-003',
        fechaRecepcion: new Date('2026-08-25'),
        descripcion: 'Solicito información sobre los subsidios entregados durante el año 2025.',
        estado: 'PRORROGA_SOLICITADA',
        plazoLimite: new Date('2026-10-15'),
        usuarioId: usuarioDirector.id,
        departamentoId: juridicaDepto?.id || 1,
      },
    });

    // Solicitud 4: Vencida
    await prisma.solicitud.create({
      data: {
        folio: 'SIA-2026-004',
        fechaRecepcion: new Date('2026-07-01'),
        descripcion: 'Solicito información sobre el estado de las calles de la comuna.',
        estado: 'VENCIDA',
        plazoLimite: new Date('2026-07-29'),
        usuarioId: usuarioOperativo.id,
        departamentoId: obrasDepto?.id || 1,
      },
    });

    console.log('✅ Creadas 4 solicitudes de prueba');
  }

  // ============================================
  // 6. CREAR CARGAS MENSUALES (Transparencia Activa)
  // ============================================

  const itemsList = await prisma.itemTransparencia.findMany();

  for (const item of itemsList) {
    await prisma.cargaMensual.create({
      data: {
        itemId: item.id,
        mes: '8',
        anio: 2026,
        estado: 'PUBLICADA',
        usuarioId: usuarioOperativo?.id || 1,
        fechaCarga: new Date('2026-08-05'),
      },
    }).catch(() => {});

    await prisma.cargaMensual.create({
      data: {
        itemId: item.id,
        mes: '9',
        anio: 2026,
        estado: 'PENDIENTE',
        usuarioId: usuarioOperativo?.id || 1,
        fechaCarga: new Date('2026-09-01'),
      },
    }).catch(() => {});
  }

  console.log('✅ Creadas cargas mensuales de prueba');

  console.log('🌱 Seeding completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });