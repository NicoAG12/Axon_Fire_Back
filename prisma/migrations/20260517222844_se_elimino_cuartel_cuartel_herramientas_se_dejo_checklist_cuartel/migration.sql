-- CreateTable
CREATE TABLE "checklist_cuartel" (
    "id" TEXT NOT NULL,
    "fecha_control" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" TEXT NOT NULL,

    CONSTRAINT "checklist_cuartel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_detalle_cuartel" (
    "id" TEXT NOT NULL,
    "checklist_id" TEXT NOT NULL,
    "herramienta_id" TEXT NOT NULL,
    "controlado" "estado_control_herramienta" NOT NULL,
    "observaciones" TEXT,

    CONSTRAINT "checklist_detalle_cuartel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "checklist_cuartel" ADD CONSTRAINT "checklist_cuartel_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_detalle_cuartel" ADD CONSTRAINT "checklist_detalle_cuartel_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "checklist_cuartel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_detalle_cuartel" ADD CONSTRAINT "checklist_detalle_cuartel_herramienta_id_fkey" FOREIGN KEY ("herramienta_id") REFERENCES "herramientas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
