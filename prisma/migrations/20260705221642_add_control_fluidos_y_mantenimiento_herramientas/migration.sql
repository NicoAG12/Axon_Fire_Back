-- CreateTable
CREATE TABLE "control_fluidos" (
    "id" TEXT NOT NULL,
    "camion_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "fecha_control" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aceite_motor" TEXT NOT NULL,
    "liquido_refrigerante" TEXT NOT NULL,
    "liquido_frenos" TEXT NOT NULL,
    "liquido_direccion" TEXT NOT NULL,
    "observaciones" TEXT,

    CONSTRAINT "control_fluidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mantenimiento_herramientas" (
    "id" TEXT NOT NULL,
    "herramienta_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "fecha_mantenimiento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nivel_aceite" TEXT NOT NULL,
    "estado_mangueras" TEXT NOT NULL,
    "presion_trabajo" TEXT NOT NULL,
    "estado_limpieza" TEXT NOT NULL,
    "observaciones" TEXT,

    CONSTRAINT "mantenimiento_herramientas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "control_fluidos" ADD CONSTRAINT "control_fluidos_camion_id_fkey" FOREIGN KEY ("camion_id") REFERENCES "camiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_fluidos" ADD CONSTRAINT "control_fluidos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mantenimiento_herramientas" ADD CONSTRAINT "mantenimiento_herramientas_herramienta_id_fkey" FOREIGN KEY ("herramienta_id") REFERENCES "herramientas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mantenimiento_herramientas" ADD CONSTRAINT "mantenimiento_herramientas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
