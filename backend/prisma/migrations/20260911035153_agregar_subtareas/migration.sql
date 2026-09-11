-- CreateEnum
CREATE TYPE "EstadoSubtarea" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'RESPONDIDA');

-- CreateTable
CREATE TABLE "subtareas" (
    "id" SERIAL NOT NULL,
    "solicitud_id" INTEGER NOT NULL,
    "departamento_id" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" "EstadoSubtarea" NOT NULL DEFAULT 'PENDIENTE',
    "contenido_respuesta" TEXT,
    "fecha_respuesta" TIMESTAMP(3),
    "usuario_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subtareas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "subtareas" ADD CONSTRAINT "subtareas_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "solicitudes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtareas" ADD CONSTRAINT "subtareas_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtareas" ADD CONSTRAINT "subtareas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
