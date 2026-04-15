/*
  Warnings:

  - A unique constraint covering the columns `[usuario_alta_alerta]` on the table `alerta` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `usuario_alta_alerta` to the `alerta` table without a default value. This is not possible if the table is not empty.
  - Made the column `password` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "alerta" ADD COLUMN     "usuario_alta_alerta" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "alerta_usuario_alta_alerta_key" ON "alerta"("usuario_alta_alerta");

-- AddForeignKey
ALTER TABLE "alerta" ADD CONSTRAINT "alerta_usuario_alta_alerta_fkey" FOREIGN KEY ("usuario_alta_alerta") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
