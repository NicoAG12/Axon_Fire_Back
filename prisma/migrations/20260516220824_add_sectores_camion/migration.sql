/*
  Warnings:

  - You are about to drop the column `lugar_sector` on the `camiones_inventario` table. All the data in the column will be lost.
  - Added the required column `sector_id` to the `camiones_inventario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "camiones_inventario" DROP COLUMN "lugar_sector",
ADD COLUMN     "sector_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "sectores_camion" (
    "id" TEXT NOT NULL,
    "camion_id" TEXT NOT NULL,
    "nombre_sector" TEXT NOT NULL,

    CONSTRAINT "sectores_camion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sectores_camion" ADD CONSTRAINT "sectores_camion_camion_id_fkey" FOREIGN KEY ("camion_id") REFERENCES "camiones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camiones_inventario" ADD CONSTRAINT "camiones_inventario_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectores_camion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
