# transparencia-municipal-sia

Sistema web para la gestión de transparencia activa y solicitudes SIA en municipalidades.  
Proyecto académico — Instituto Profesional San Sebastián.

---

## 📋 Tecnologías usadas

| Capa | Tecnología | Versión |
|------|------------|---------|
| **Backend** | Node.js | v22 LTS |
| | Express | v5 |
| | TypeScript | v5.x |
| | Prisma | v7 |
| **Frontend** | React | v18 |
| | TypeScript | v5.x |
| | Material UI | v7 |
| **Base de datos** | PostgreSQL | v16 |
| **Contenerización** | Docker | Última estable |
| **Control de versiones** | Git + GitHub | — |

---

## 🛠️ Requisitos previos (instalar antes de empezar)

| Herramienta | Versión | Comando para verificar |
|-------------|---------|------------------------|
| Node.js | v22 LTS | `node -v` |
| npm | (viene con Node) | `npm -v` |
| Git | Última estable | `git --version` |
| Docker Desktop | Última estable | `docker --version` |
| VS Code | Última estable | (recomendado) |

---

---

## 🐳 Levantar el proyecto con Docker (recomendado)

Esta es la forma más rápida de levantar el backend y la base de datos, sin instalar PostgreSQL localmente.

## 📦 Instalación del proyecto (paso a paso)

### 1. Clonar el repositorio

```bash
git clone https://github.com/[USUARIO-DEL-CREADOR]/transparencia-municipal-sia.git
cd transparencia-municipal-sia

# Entrar a la carpeta del backend
cd backend

# Instalar todas las dependencias
npm install

# Verificar que TypeScript y Prisma están instalados
npx tsc -v
npx prisma -v

# Generar el cliente de Prisma (necesario antes de migrar)
npx prisma generate

# Ejecutar la migración inicial (crea las tablas en la BD)
npx prisma migrate dev --name init

Nota: TypeScript está en la versión 5.9.3 (compatible con ts-node). No uses TypeScript 7.x porque actualmente no es compatible con las herramientas de desarrollo.

---

# Entrar a la carpeta del frontend
cd ../frontend

# Instalar dependencias base de React
npm install

# Instalar Material UI y Emotion
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled

# Instalar React Router (para navegación entre páginas)
npm install react-router-dom
npm install --save-dev @types/react-router-dom

# Verificar que el frontend funciona
npm start
# (debería abrir una ventana con el logo de React)
# Para detenerlo: Ctrl + C

Nota: Los archivos README.md y .gitignore dentro de frontend/ fueron eliminados porque ya existen en la raíz del proyecto.
```

### 2. Crear el archivo de variables de entorno

Copia el archivo de ejemplo y complétalo con tus propios valores:
```bash
cp .env.example .env
```
Contenido del .env:

# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=miPassword123
POSTGRES_DB=transparencia_db

# Backend
DATABASE_URL="postgresql://postgres:miPassword123@db:5432/transparencia_db?schema=public"
JWT_SECRET=genera_un_secreto_aleatorio_largo
JWT_EXPIRES_IN=8h

Generar un JWT_SECRET seguro:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Levantar backend + base de datos con un solo comando

```bash
docker compose up --build
```
Esto hace:
Construye la imagen del backend.
Descarga PostgreSQL 16.
Ejecuta las migraciones de Prisma automáticamente.
Levanta el backend en http://localhost:5000..

Comandos útiles:

Para detenerlo:
```bash
# Ctrl + C en la terminal, luego:
docker compose down
```
Para borrar también los datos guardados (empezar de cero):
```bash
docker compose down -v
```
Ver los logs
```bash
docker compose logs -f
```
Verificar que los contenedores están corriendo
```bash
docker ps

```
### 4. Ejecutar el Seed (datos de prueba)
El seed es opcional pero recomendado para pruebas. Pobla la base de datos con usuarios, solicitudes e ítems de transparencia.


1. Asegurarse de que el backend esté corriendo (con Docker)
 ```bash
docker ps
 ```

2. Ejecutar el seed
 ```bash
npx prisma db seed
 ```

3. Verificar en Prisma Studio
```bash
npx prisma studio
 ```

# Datos creados por el seed:

Tabla	Cantidad	Descripción
departamentos	7	Obras, Tránsito, Jurídica, etc.
usuarios	5	2 OPERATIVO, 2 DIRECTOR, 1 ENLACE
items_transparencia	5	Ítems de la Ley N° 20.285
solicitudes	4	Con diferentes estados (pendiente, respondida, prórroga, vencida)
cargas_mensuales	10	2 por cada ítem (agosto y septiembre 2026)

### 4. Levantar el frontend (fuera de Docker)

El frontend sigue corriendo de forma local, no está contenerizado:

```bash
cd frontend
npm install
npm start
```

El frontend estará en `http://localhost:3000`.

### 👤 Usuarios de prueba (Seed)
Rol	Email	Contraseña
OPERATIVO	operativo@test.com	miPassword123
OPERATIVO	operativo2@test.com	miPassword123
DIRECTOR	director@test.com	miPassword123
DIRECTOR	director2@test.com	miPassword123
ENLACE	enlace@test.com	miPassword123

### 🧪 Pruebas recomendadas
1. Autenticación
Login: Usar las credenciales de prueba.

Roles: Verificar que cada rol vea solo lo que le corresponde.

Rol	Acceso
OPERATIVO	Dashboard, Solicitudes, Transparencia Activa, Subir archivos
DIRECTOR	Dashboard, Solicitudes, Transparencia Activa, Aprobar/Rechazar cargas
ENLACE	Dashboard, Solicitudes, Transparencia Activa, Usuarios, Logs, Generar alertas
2. Gestión de Solicitudes
Crear solicitud: (solo OPERATIVO).

Listar solicitudes: Ver todas con filtro por semáforo.

Detalle de solicitud: Ver información completa.

Responder solicitud: (solo DIRECTOR).

Solicitar prórroga: (solo ENLACE).

3. Carga de Archivos
Subir archivo: (OPERATIVO o DIRECTOR) → PDF, JPG o PNG.

Listar archivos: Ver todos los archivos de una solicitud.

Descargar archivo: Hacer clic en el icono de descarga.

4. Transparencia Activa
Crear carga mensual: (solo OPERATIVO).

Aprobar/Rechazar carga: (solo DIRECTOR).

Publicar carga: (solo ENLACE).

Ver detalle de carga: Todos los roles.

5. KPIs y Dashboard
Tasa de cumplimiento: Porcentaje de solicitudes respondidas dentro del plazo.

Tiempo promedio de respuesta por departamento: Ranking de departamentos.

6. Notificaciones
Generar alertas manualmente: POST /api/transparencia/alertas/generar (solo ENLACE).

Ver notificaciones: Hacer clic en la campana (OPERATIVO).

Marcar como leída: Hacer clic en una notificación.

7. Logs de Auditoría
Ver logs: (solo ENLACE) → /logs.
---





### 📂 Estructura de carpetas (después de la instalación)

transparencia-municipal-sia/
├── backend/
│   ├── src/
│   │   ├── routes/          # Definición de endpoints
│   │   ├── controllers/     # Lógica de los endpoints
│   │   ├── services/        # Lógica de negocio
│   │   ├── middlewares/     # Autenticación, validación, errores
│   │   ├── dtos/            # Contratos de entrada/salida
│   │   ├── utils/           # Funciones auxiliares
│   │   ├── app.ts           # Configuración de Express
│   │   └── index.ts         # Punto de entrada del servidor
│   ├── prisma/
│   │   ├── schema.prisma    # Modelo de datos
│   │   ├── seed.ts          # Datos de prueba (seeding)
│   │   └── migrations/      # Migraciones de Prisma
│   ├── generated/           # Código generado por Prisma (ignorado por Git)
│   ├── node_modules/        # Dependencias (ignorado por Git)
│   ├── package.json
│   ├── tsconfig.json
│   └── nodemon.json         # Configuración de nodemon
├── frontend/
│   ├── src/                 # Código fuente de React
│   ├── public/
│   ├── node_modules/        # Dependencias (ignorado por Git)
│   ├── package.json
│   └── tsconfig.json
├── .env                     # Variables de entorno (NO SUBIR)
├── .env.example             # Ejemplo de variables de entorno
├── docker-compose.yml       # Configuración de Docker
├── .gitignore               # Archivos ignorados por Git
└── README.md                # Este manual

### 🔧 Solución de problemas comunes
Problema	Solución
Error: port already allocated	Detener el contenedor anterior: docker stop postgres-transparencia
Prisma Studio no encuentra la BD	Ejecutar con URL explícita: npx prisma studio --url "postgresql://..."
No hay notificaciones	Generar alertas con POST /api/transparencia/alertas/generar (con token ENLACE).
El seed no funciona	Verificar que el backend esté corriendo y ejecutar npx prisma db seed.
Error de CORS	Verificar que el backend tenga el middleware cors() habilitado.