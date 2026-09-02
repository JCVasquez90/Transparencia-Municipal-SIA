/*
  Warnings:

  - Added the required column `tipo` to the `archivos` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoArchivo" AS ENUM ('EVIDENCIA_SOLICITUD', 'RESPUESTA');

-- AlterTable
ALTER TABLE "archivos" ADD COLUMN     "tipo" "TipoArchivo" NOT NULL;

-- AlterTable
ALTER TABLE "solicitudes" ADD COLUMN     "contenidoRespuesta" TEXT,
ADD COLUMN     "fechaRespuesta" TIMESTAMP(3);
