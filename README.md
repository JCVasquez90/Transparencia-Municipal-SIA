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