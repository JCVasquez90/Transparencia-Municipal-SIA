# 🏛️ transparencia-municipal-sia

Sistema web para la gestión de **Transparencia Activa** y **Solicitudes de Información (SIA)** en municipalidades chilenas.

Proyecto académico — Instituto Profesional San Sebastián.

---

## 📋 Tabla de Contenidos

1. [Descripción](#-descripción)
2. [Tecnologías](#-tecnologías)
3. [Requisitos Previos](#-requisitos-previos)
4. [Estructura del Proyecto](#-estructura-del-proyecto)
5. [Instalación con Docker (Recomendado)](#-instalación-con-docker-recomendado)
6. [Instalación Manual (Sin Docker)](#-instalación-manual-sin-docker)
7. [Variables de Entorno](#-variables-de-entorno)
8. [Usuarios de Prueba](#-usuarios-de-prueba)
9. [Guía de Pruebas](#-guía-de-pruebas)
10. [Endpoints de la API](#-endpoints-de-la-api)
11. [Arquitectura del Sistema](#-arquitectura-del-sistema)
12. [Solución de Problemas](#-solución-de-problemas)
13. [Deuda Técnica](#-deuda-técnica)
14. [Colaboradores](#-colaboradores)
15. [Licencia](#-licencia)

---

## 📖 Descripción

Este sistema permite a las municipalidades cumplir con las obligaciones establecidas por la **Ley N° 20.285** sobre Acceso a la Información Pública, automatizando:

- **Transparencia Activa:** Carga, validación y publicación mensual de información (personal, compras, subsidios, etc.).
- **Transparencia Pasiva (SIA):** Gestión de solicitudes ciudadanas con trazabilidad, semáforo de plazos y gestión de prórrogas.
- **Trazabilidad:** Log de auditoría inalterable, firma electrónica y notificaciones automáticas.
- **Dashboard Gerencial:** KPIs de cumplimiento, tiempo promedio de respuesta e índice de amparos.

El sistema está diseñado para ser **parametrizable** y adaptable a cualquier municipio de Chile.

---

## 🛠️ Tecnologías

| Capa                     | Tecnología              | Versión |
|--------------------------|-------------------------|---------|
| **Backend**              | Node.js                 | v22 LTS 
| | Express                | v5                      |
| | TypeScript             | v5.x                    |
| | Prisma                 | v7                      |
| **Frontend**             | React                   | v18     
| | TypeScript             | v5.x                    | 
| | Material UI            | v7                      |
| **Base de datos**        | PostgreSQL              | v16 
| **Autenticación**        | JWT + bcrypt            | 
| **Validación**           | Zod                     | v4
| **Archivos**             | Multer + file-type      | 
| **Tareas programadas**   | node-cron               | 
| **Contenerización**      | Docker + Docker Compose | 
| **Control de versiones** | Git + GitHub            | 

---

## ✅ Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

| Herramienta    | Versión          | Comando para verificar |
|----------------|------------------|------------------------|
| Node.js        | v22 LTS          | `node -v`              |
| npm            | (viene con Node) | `npm -v`               |
| Git            | Última estable   | `git --version`        |
| Docker Desktop | Última estable   | `docker --version`     |
| VS Code        | Última estable   | (recomendado)          |

---

## 📂 Estructura del Proyecto

```
transparencia-municipal-sia/
├── backend/
│   ├── src/
│   │   ├── routes/          # Definición de endpoints
│   │   ├── controllers/     # Lógica de los endpoints
│   │   ├── services/        # Lógica de negocio
│   │   ├── middlewares/     # Autenticación, roles, errores, uploads
│   │   ├── dtos/            # Validaciones con Zod
│   │   ├── utils/           # Funciones auxiliares (cálculo de días hábiles)
│   │   ├── cron/            # Tareas programadas (alertas)
│   │   ├── app.ts           # Configuración de Express
│   │   └── index.ts         # Punto de entrada del servidor
│   ├── prisma/
│   │   ├── schema.prisma    # Modelo de datos
│   │   ├── seed.ts          # Datos de prueba
│   │   └── migrations/      # Migraciones de Prisma
│   ├── package.json
│   ├── tsconfig.json
│   └── nodemon.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Cliente Axios
│   │   ├── components/      # Componentes reutilizables
│   │   ├── contexts/        # AuthContext, NotificationContext
│   │   ├── pages/           # Vistas de la aplicación
│   │   ├── services/        # Llamadas a la API
│   │   ├── types/           # Tipos TypeScript
│   │   └── utils/           # Funciones auxiliares
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml       # Orquestación de contenedores
├── .env                     # Variables de entorno (NO SUBIR)
├── .env.example             # Ejemplo de variables de entorno
├── .gitignore
└── README.md
```

---

## 🐳 Instalación con Docker (Recomendado)

Esta es la forma más rápida y reproducible de levantar el proyecto.

### 1. Clonar el repositorio

```bash
git clone https://github.com/JCVasquez90/Transparencia-Municipal-SIA.git
cd Transparencia-Municipal-SIA
```

### 2. Crear el archivo `.env`

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

Edita el `.env` con tus credenciales:

```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=miPassword123
POSTGRES_DB=transparencia_db

# Backend
DATABASE_URL="postgresql://postgres:miPassword123@db:5432/transparencia_db?schema=public"
JWT_SECRET=genera_un_secreto_aleatorio_largo
JWT_EXPIRES_IN=8h
```

**🔑 Generar un `JWT_SECRET` seguro:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Levantar el backend y la base de datos

```bash
docker compose up --build -d
```

Esto hará:
- Construir la imagen del backend.
- Descargar PostgreSQL 16.
- Aplicar las migraciones automáticamente.
- Levantar el backend en `http://localhost:5000`.

**Verificar que los contenedores estén corriendo:**

```bash
docker ps
```

Deberías ver `transparencia_db` y `transparencia_backend`.

### 4. Ejecutar el seed (datos de prueba)

```bash
cd backend
npx prisma db seed
```

**Resultado esperado:**

```
🌱 Iniciando seeding...
✅ Creados 7 departamentos
✅ Creados 5 usuarios
✅ Creados 5 ítems de transparencia
✅ Creadas 4 solicitudes de prueba
✅ Creadas cargas mensuales de prueba
🌱 Seeding completado exitosamente!
```

### 5. Levantar el frontend

```bash
cd frontend
npm install
npm start
```

El frontend estará en `http://localhost:3000`.

---

## 💻 Instalación Manual (Sin Docker)

Si prefieres instalar PostgreSQL directamente en tu máquina:

### 1. Instalar PostgreSQL 16

Descarga e instala PostgreSQL desde [postgresql.org](https://www.postgresql.org/download/).

Crea la base de datos:

```sql
CREATE DATABASE transparencia_db;
```

### 2. Configurar el backend

```bash
cd backend
npm install
```

Crea el archivo `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:miPassword123@localhost:5432/transparencia_db?schema=public"
JWT_SECRET=tu-secreto-seguro
JWT_EXPIRES_IN=8h
```

Aplica las migraciones:

```bash
npx prisma generate
npx prisma migrate dev
```

Ejecuta el seed:

```bash
npx prisma db seed
```

Levanta el backend:

```bash
npm run dev
```

### 3. Configurar el frontend

```bash
cd frontend
npm install
npm start
```

---

## 🔐 Variables de Entorno

| Variable            | Descripción                          | Ejemplo                                              |
|---------------------|--------------------------------------|------------------------------------------------------|
| `POSTGRES_USER`     | Usuario de PostgreSQL                | `postgres`                                           |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL             | `miPassword123`                                      |
| `POSTGRES_DB`       | Nombre de la base de datos           | `transparencia_db`                                   |
| `DATABASE_URL`      | URL de conexión a la base de datos   | `postgresql://postgres:...@db:5432/transparencia_db` |
| `JWT_SECRET`        | Clave secreta para firmar tokens JWT | (generar con `crypto.randomBytes`)                   |
| `JWT_EXPIRES_IN`    | Tiempo de expiración del token       | `8h`                                                 |

**⚠️ Importante:** El archivo `.env` **NO debe subirse al repositorio** (ya está en `.gitignore`).

---

## 👤 Usuarios de Prueba

| Rol       | Email                 | Contraseña      |
|-----------|-----------------------|-----------------|
| OPERATIVO | `operativo@test.com`  | `miPassword123` |
| OPERATIVO | `operativo2@test.com` | `miPassword123` |
| DIRECTOR  | `director@test.com`   | `miPassword123` |
| DIRECTOR  | `director2@test.com`  | `miPassword123` |
| ENLACE    | `enlace@test.com`     | `miPassword123` |

---

## 🧪 Guía de Pruebas

### 1. Autenticación

- **Login:** Iniciar sesión con cada rol.
- **Rutas protegidas:** Intentar acceder a `/solicitudes` sin login → debe redirigir a `/login`.

### 2. Gestión de Solicitudes SIA

- **Crear:** OPERATIVO crea una solicitud (folio automático).
- **Responder:** DIRECTOR responde una solicitud pendiente.
- **Prórroga:** ENLACE solicita prórroga (extiende 10 días).
- **Semáforo:** Verificar colores según días restantes.
- **Subtareas:** ENLACE crea subtareas, DIRECTOR las responde, ENLACE consolida.

### 3. Transparencia Activa

- **Crear carga:** OPERATIVO crea una carga mensual.
- **Aprobar/Rechazar:** DIRECTOR aprueba o rechaza.
- **Publicar:** ENLACE publica.
- **Vista pública:** Acceder a `/transparencia/publicado`.

### 4. Gestión de Usuarios (ENLACE)

- **Listar:** Ver todos los usuarios.
- **Crear:** Crear un nuevo usuario.
- **Editar:** Editar un usuario existente.

### 5. Carga de Archivos

- **Subir:** OPERATIVO/DIRECTOR sube un PDF/JPG/PNG.
- **Descargar:** Descargar el archivo subido.

### 6. Log de Auditoría (ENLACE)

- **Ver logs:** Acceder a `/logs` y verificar las acciones registradas.

### 7. Dashboard

- **KPIs:** Tasa de cumplimiento, tiempo promedio por departamento, índice de amparos.

### 8. Notificaciones

- **Generar alertas:** ENLACE genera alertas manualmente.
- **Ver notificaciones:** Campana en la barra de navegación.

### 9. Vista Pública de Transparencia Activa (Demostración)

El sistema incluye una **vista pública** que simula cómo el municipio podría mostrar la información publicada en su portal de transparencia.

**Acceder a la vista pública:**

http://localhost:3000/transparencia/publicado

**¿Qué muestra?**
- Un encabezado con el nombre del municipio.
- Un filtro por mes y año.
- Tarjetas con las publicaciones del período seleccionado.
- Cada tarjeta muestra: nombre del ítem, descripción, departamento responsable, estado y fecha de publicación.

**¿Cómo puede consumirla un municipio?**
El sistema expone un **endpoint público** que devuelve las publicaciones en formato JSON:

GET http://localhost:5000/api/transparencia/publicado?mes=9&anio=2026

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "municipio": "Municipio X",
    "mes": "9",
    "anio": "2026",
    "totalPublicaciones": 5,
    "publicaciones": [...],
    "fechaConsulta": "..."
  }
}

El municipio puede consumir este endpoint desde su portal web (WordPress, Drupal, etc.) mediante un script PHP, JavaScript o un plugin.

Nota: Esta vista es una demostración funcional. La integración real con el portal del municipio depende de la API o CMS de cada municipio y puede implementarse como mejora futura.

---

## 🌐 Endpoints de la API

### Autenticación

| Método | URL               | Rol     | Descripción                   |
|--------|-------------------|---------|-------------------------------|
| POST   | `/api/auth/login` | Público | Iniciar sesión                |
| GET    | `/api/health`     | Público | Verificar estado del servidor |

### Solicitudes

| Método | URL                              | Rol       | Descripción        |
|--------|----------------------------------|-----------|--------------------|
| GET    | `/api/solicitudes`               | Todos     | Listar solicitudes |
| POST   | `/api/solicitudes`               | OPERATIVO | Crear solicitud    |
| GET    | `/api/solicitudes/:id`           | Todos     | Obtener por ID     |
| PATCH  | `/api/solicitudes/:id/responder` | DIRECTOR  | Responder          | 
| POST   | `/api/solicitudes/:id/prorroga`  | ENLACE    | Solicitar prórroga |
| PATCH  | `/api/solicitudes/:id/firmar`    | DIRECTOR  | Firmar             |
| PATCH  | `/api/solicitudes/:id/amparo`    | ENLACE    | Marcar en amparo   |
| GET    | `/api/solicitudes/kpis`          | Todos     | Obtener KPIs       |

### Subtareas

| Método | URL                                        | Rol      | Descripción          |
|--------|--------------------------------------------|----------|----------------------|
| POST   | `/api/solicitudes/:id/subtareas`           | ENLACE   | Crear subtarea       |
| GET    | `/api/solicitudes/:id/subtareas`           | Todos    | Listar subtareas     |
| PATCH  | `/api/solicitudes/subtareas/:id/responder` | DIRECTOR | Responder subtarea   |
| POST   | `/api/solicitudes/:id/consolidar`          | ENLACE   | Consolidar subtareas |

### Transparencia Activa

| Método | URL                                      | Rol       | Descripción             |
|--------|------------------------------------------|-----------|-------------------------|
| GET    | `/api/transparencia/items`               | Todos     | Listar ítems            |
| GET    | `/api/transparencia/cargas/:itemId`      | Todos     | Listar cargas           |
| POST   | `/api/transparencia/cargas`              | OPERATIVO | Crear carga             |
| PATCH  | `/api/transparencia/cargas/:id/aprobar`  | DIRECTOR  | Aprobar                 |
| PATCH  | `/api/transparencia/cargas/:id/rechazar` | DIRECTOR  | Rechazar                |
| PATCH  | `/api/transparencia/cargas/:id/publicar` | ENLACE    | Publicar                |
| GET    | `/api/transparencia/publicado`           | Público   | Consultar publicaciones |

### Usuarios

| Método | URL                 | Rol    | Descripción     |
|--------|---------------------|--------|-----------------|
| GET    | `/api/usuarios`     | ENLACE | Listar usuarios |
| POST   | `/api/usuarios`     | ENLACE | Crear usuario   |
| PATCH  | `/api/usuarios/:id` | ENLACE | Editar usuario  |

### Archivos

| Método | URL                                    | Rol                | Descripción       |
|--------|----------------------------------------|--------------------|-------------------|
| GET    | `/api/archivos/solicitud/:solicitudId` | Todos              | Listar archivos   |
| POST   | `/api/archivos/solicitud/:solicitudId` | OPERATIVO/DIRECTOR | Subir archivo     |
| GET    | `/api/archivos/:id/descargar`          | Todos              | Descargar archivo |

### Logs

| Método | URL         | Rol    | Descripción              |
|--------|-------------|--------|--------------------------|
| GET    | `/api/logs` | ENLACE | Listar logs de auditoría |

### Notificaciones

| Método | URL                                | Rol   | Descripción              |
|--------|------------------------------------|-------|--------------------------|
| GET    | `/api/notificaciones/no-leidas`    | Todos | Notificaciones no leídas |
| PATCH  | `/api/notificaciones/:id/leer`     | Todos | Marcar como leída        |
| PATCH  | `/api/notificaciones/marcar-todas` | Todos | Marcar todas             |

---

## 🏗️ Arquitectura del Sistema

El sistema sigue un modelo de **3 capas desacopladas**:

```
┌─────────────────────────────────────────┐
│         FRONTEND (React + MUI)          │
│  Dashboard, Solicitudes, Transparencia  │
└────────────────┬────────────────────────┘
                 │ HTTP / API REST
                 ▼
┌─────────────────────────────────────────┐
│      BACKEND (Node.js + Express)        │
│  Rutas → Controladores → Servicios      │
│         Middlewares (Auth, Roles)       │
└────────────────┬────────────────────────┘
                 │ Prisma Client
                 ▼
┌─────────────────────────────────────────┐
│         PostgreSQL (Base de Datos)      │
│  Solicitudes, Usuarios, Logs, etc.      │
└─────────────────────────────────────────┘
```

---

## 🚨 Solución de Problemas

| Error                             | Causa                        | Solución                                                             |
|-----------------------------------|------------------------------|----------------------------------------------------------------------|
| `port already allocated`          | Puerto 5432 ocupado          | Detener el contenedor anterior: `docker stop postgres-transparencia` |
| `Cannot find module`              | Dependencias faltantes       | `npm install` en la carpeta correspondiente                          |
| `P1001: Can't reach database`     | PostgreSQL no está corriendo | `docker compose up -d db`                                            |
| `No database URL found`           | Falta el `.env`              | Crear `backend/.env` con `DATABASE_URL`                              |
| `Unique constraint failed`        | Seed ejecutado dos veces     | `DELETE FROM solicitudes;` y volver a ejecutar seed                  |
| `MUI: MenuListContext is missing` | `<MenuItem>` fuera de `<TextField select>` | Mover el `<MenuItem>` dentro del `<TextField select>`  |
| `MUI: target=ES5 is deprecated`   | Configuración obsoleta       | Cambiar `target` a `ES2020` en `tsconfig.json`                       |
| `input/output error`              | Docker corrupto              | Reiniciar Docker Desktop o `wsl --shutdown`                          |

---

## 📌 Deuda Técnica

Las siguientes funcionalidades no fueron implementadas por limitaciones de tiempo:

| Funcionalidad                   | Descripción                                                                | Prioridad |
|---------------------------------|--------------------------------------------------------------------------- |-----------|
| **Chat interno por solicitud**  | Hilo de comentarios en cada solicitud para coordinar entre departamentos.  | Alta      |
| **Firma electrónica avanzada**  | Integración con proveedor de firma digital (Clave Única, DocuSign).        | Media     |
| **Notificaciones al ciudadano** | Envío de correos automáticos al ciudadano sobre el estado de su solicitud. | Media     |
| **Índice de reclamos avanzado** | Diferenciar entre amparos por falta de respuesta y por calidad.            | Baja      |

---

## 👥 Colaboradores

- **Juan Carlos Vásquez Gutiérrez** — Desarrollador Fullstack
- **María Fernanda Rojas Angulo** — Desarrolladora Fullstack

---

## 📄 Licencia

Proyecto académico — **Instituto Profesional San Sebastián**.

Este proyecto no cuenta con una licencia de uso comercial. Su uso está restringido al ámbito académico.
