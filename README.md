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

---

# Descargar y ejecutar PostgreSQL en un contenedor
docker run --name postgres-transparencia \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=miPassword \
  -e POSTGRES_DB=transparencia_db \
  -p 5432:5432 \
  -d postgres:16

# Verificar que el contenedor está corriendo
docker ps

---
# Luego, configura la variable de entorno en el backend:
Ve a backend/.env

1. Ve a: backend/.env y si el acrchivo no esta por que fue ignorado al momento de subirlo crealo y agrega esta linea.

DATABASE_URL="postgresql://postgres:miPassword@localhost:5432/transparencia_db?schema=public"

---
# levantar proyecto despues de la configuracion.
# Terminal Backend.

cd backend
npm run dev
## El servidor estará en http://localhost:5000.

## Terminal Frontend 

cd frontend
npm start
## El frontend estará en http://localhost:3000.

---

📂 Estructura de carpetas (después de la instalación)

transparencia-municipal-sia/
├── backend/
│   ├── src/               (código fuente - se irá creando)
│   ├── prisma/
│   │   └── schema.prisma  (modelo de datos)
│   ├── node_modules/      (dependencias - ignora en Git)
│   ├── .env               (variables locales - NO SUBIR)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/               (código fuente de React)
│   ├── public/
│   ├── node_modules/      (dependencias - ignora en Git)
│   ├── package.json
│   └── tsconfig.json
├── .gitignore             (archivos ignorados por Git - raíz)
└── README.md              (este manual - raíz)