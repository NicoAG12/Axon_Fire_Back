-- CreateEnum
CREATE TYPE "nivel_prioridad" AS ENUM ('ALTA', 'MEDIA', 'BAJA');

-- AlterTable
ALTER TABLE "alerta" ADD COLUMN     "latitud" DOUBLE PRECISION,
ADD COLUMN     "longitud" DOUBLE PRECISION,
ADD COLUMN     "prioridad" "nivel_prioridad" NOT NULL DEFAULT 'MEDIA';
