-- CreateEnum
CREATE TYPE "estado_camion" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "estado_control_herramienta" AS ENUM ('CHEQUEADO', 'FALTANTE');

-- CreateTable
CREATE TABLE "camiones" (
    "id" TEXT NOT NULL,
    "nombre_camion" TEXT NOT NULL,
    "estado" "estado_camion" NOT NULL,

    CONSTRAINT "camiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "herramientas" (
    "id" TEXT NOT NULL,
    "nombre_herramienta" TEXT NOT NULL,
    "cantidad_disponible" INTEGER NOT NULL,

    CONSTRAINT "herramientas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camiones_inventario" (
    "id" TEXT NOT NULL,
    "camion_id" TEXT NOT NULL,
    "lugar_sector" TEXT NOT NULL,
    "herramienta_id" TEXT NOT NULL,
    "cantidad_herramienta" INTEGER NOT NULL,

    CONSTRAINT "camiones_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_camiones_diario" (
    "id" TEXT NOT NULL,
    "fecha_control" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "camion_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,

    CONSTRAINT "checklist_camiones_diario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_detalle" (
    "id" TEXT NOT NULL,
    "checklist_id" TEXT NOT NULL,
    "inventario_id" TEXT NOT NULL,
    "controlado" "estado_control_herramienta" NOT NULL,
    "observaciones" TEXT,

    CONSTRAINT "checklist_detalle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "camiones_inventario" ADD CONSTRAINT "camiones_inventario_camion_id_fkey" FOREIGN KEY ("camion_id") REFERENCES "camiones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camiones_inventario" ADD CONSTRAINT "camiones_inventario_herramienta_id_fkey" FOREIGN KEY ("herramienta_id") REFERENCES "herramientas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_camiones_diario" ADD CONSTRAINT "checklist_camiones_diario_camion_id_fkey" FOREIGN KEY ("camion_id") REFERENCES "camiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_camiones_diario" ADD CONSTRAINT "checklist_camiones_diario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_detalle" ADD CONSTRAINT "checklist_detalle_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "checklist_camiones_diario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_detalle" ADD CONSTRAINT "checklist_detalle_inventario_id_fkey" FOREIGN KEY ("inventario_id") REFERENCES "camiones_inventario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
