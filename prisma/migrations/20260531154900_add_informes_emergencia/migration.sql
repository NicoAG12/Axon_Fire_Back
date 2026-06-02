-- CreateEnum
CREATE TYPE "estado_informe" AS ENUM ('BORRADOR', 'FINALIZADO');

-- CreateTable
CREATE TABLE "informes_emergencia" (
    "id" TEXT NOT NULL,
    "alerta_id" TEXT NOT NULL,
    "observaciones_admin" TEXT,
    "detalles_propiedad" TEXT,
    "estado_informe" "estado_informe" NOT NULL DEFAULT 'BORRADOR',
    "creado_por" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "informes_emergencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "informes_emergencia_alerta_id_key" ON "informes_emergencia"("alerta_id");

-- AddForeignKey
ALTER TABLE "informes_emergencia" ADD CONSTRAINT "informes_emergencia_alerta_id_fkey" FOREIGN KEY ("alerta_id") REFERENCES "alerta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
