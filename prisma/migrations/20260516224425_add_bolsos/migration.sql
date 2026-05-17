-- CreateTable
CREATE TABLE "bolsos" (
    "id" TEXT NOT NULL,
    "nombre_bolso" TEXT NOT NULL,

    CONSTRAINT "bolsos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bolsos_inventario" (
    "id" TEXT NOT NULL,
    "bolso_id" TEXT NOT NULL,
    "herramienta_id" TEXT NOT NULL,
    "cantidad_herramienta" INTEGER NOT NULL,

    CONSTRAINT "bolsos_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_bolsos_emergencia" (
    "id" TEXT NOT NULL,
    "fecha_control" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" TEXT NOT NULL,
    "alerta_id" TEXT NOT NULL,
    "bolso_id" TEXT NOT NULL,

    CONSTRAINT "checklist_bolsos_emergencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_detalle_bolso" (
    "id" TEXT NOT NULL,
    "checklist_id" TEXT NOT NULL,
    "inventario_id" TEXT NOT NULL,
    "controlado" "estado_control_herramienta" NOT NULL,
    "observaciones" TEXT,

    CONSTRAINT "checklist_detalle_bolso_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bolsos_inventario" ADD CONSTRAINT "bolsos_inventario_bolso_id_fkey" FOREIGN KEY ("bolso_id") REFERENCES "bolsos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bolsos_inventario" ADD CONSTRAINT "bolsos_inventario_herramienta_id_fkey" FOREIGN KEY ("herramienta_id") REFERENCES "herramientas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_bolsos_emergencia" ADD CONSTRAINT "checklist_bolsos_emergencia_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_bolsos_emergencia" ADD CONSTRAINT "checklist_bolsos_emergencia_alerta_id_fkey" FOREIGN KEY ("alerta_id") REFERENCES "alerta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_bolsos_emergencia" ADD CONSTRAINT "checklist_bolsos_emergencia_bolso_id_fkey" FOREIGN KEY ("bolso_id") REFERENCES "bolsos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_detalle_bolso" ADD CONSTRAINT "checklist_detalle_bolso_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "checklist_bolsos_emergencia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_detalle_bolso" ADD CONSTRAINT "checklist_detalle_bolso_inventario_id_fkey" FOREIGN KEY ("inventario_id") REFERENCES "bolsos_inventario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
