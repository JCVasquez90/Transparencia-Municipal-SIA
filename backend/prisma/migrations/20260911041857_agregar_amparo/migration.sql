-- AlterTable
ALTER TABLE "solicitudes" ADD COLUMN     "en_amparo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fecha_amparo" TIMESTAMP(3);
