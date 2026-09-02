-- CreateTable
CREATE TABLE "resoluciones_exentas" (
    "id" SERIAL NOT NULL,
    "fundamentos" TEXT NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "solicitud_id" INTEGER NOT NULL,

    CONSTRAINT "resoluciones_exentas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "resoluciones_exentas_solicitud_id_key" ON "resoluciones_exentas"("solicitud_id");

-- AddForeignKey
ALTER TABLE "resoluciones_exentas" ADD CONSTRAINT "resoluciones_exentas_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "solicitudes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
