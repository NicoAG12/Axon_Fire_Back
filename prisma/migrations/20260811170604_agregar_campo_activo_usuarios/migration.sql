-- DropForeignKey
ALTER TABLE "checklist_bolsos_emergencia" DROP CONSTRAINT "checklist_bolsos_emergencia_alerta_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "checklist_bolsos_emergencia" ADD CONSTRAINT "checklist_bolsos_emergencia_alerta_id_fkey" FOREIGN KEY ("alerta_id") REFERENCES "alerta"("id") ON DELETE SET NULL ON UPDATE CASCADE;
