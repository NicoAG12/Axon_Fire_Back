-- CreateEnum
CREATE TYPE "categoria_poi" AS ENUM ('HIDRANTE', 'SALUD', 'MATERIAL_PELIGROSO', 'CUARTEL_APOYO');

-- CreateTable
CREATE TABLE "puntos_interes" (
    "id" TEXT NOT NULL,
    "categoria" "categoria_poi" NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_por" TEXT NOT NULL,

    CONSTRAINT "puntos_interes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "puntos_interes" ADD CONSTRAINT "puntos_interes_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
