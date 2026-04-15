-- CreateEnum
CREATE TYPE "user_roles" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "tipos_respuesta" AS ENUM ('ACEPTADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "tipos_comunicacion" AS ENUM ('SUMINISTROS', 'APOYO', 'INFORMACION');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nombre_usuario" TEXT NOT NULL,
    "password" TEXT,
    "rol" "user_roles" NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bomberos_rangos" (
    "id" TEXT NOT NULL,
    "nombre_rol" TEXT NOT NULL,

    CONSTRAINT "bomberos_rangos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bomberos" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "rango" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,

    CONSTRAINT "bomberos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_alerta" (
    "id" TEXT NOT NULL,
    "nombre_categoria" TEXT NOT NULL,

    CONSTRAINT "categorias_alerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subcategoria_alerta" (
    "id" TEXT NOT NULL,
    "categoria_alerta_id" TEXT NOT NULL,
    "nombre_sub_categoria" TEXT NOT NULL,

    CONSTRAINT "subcategoria_alerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estados_alerta" (
    "id" TEXT NOT NULL,
    "nombre_estado" TEXT NOT NULL,

    CONSTRAINT "estados_alerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerta" (
    "id" TEXT NOT NULL,
    "sub_categoria_alerta_id" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "observaciones" TEXT NOT NULL,
    "estado_alerta_id" TEXT NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respuestas_alertas" (
    "id" TEXT NOT NULL,
    "alerta_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "estado_respuesta" "tipos_respuesta" NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "respuestas_alertas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_comunicacion" (
    "id" TEXT NOT NULL,
    "alerta_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL,
    "tipo_comunicacion" "tipos_comunicacion" NOT NULL,

    CONSTRAINT "registros_comunicacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nombre_usuario_key" ON "users"("nombre_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "bomberos_usuario_id_key" ON "bomberos"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_alerta_nombre_categoria_key" ON "categorias_alerta"("nombre_categoria");

-- CreateIndex
CREATE UNIQUE INDEX "subcategoria_alerta_nombre_sub_categoria_key" ON "subcategoria_alerta"("nombre_sub_categoria");

-- CreateIndex
CREATE UNIQUE INDEX "estados_alerta_nombre_estado_key" ON "estados_alerta"("nombre_estado");

-- AddForeignKey
ALTER TABLE "bomberos" ADD CONSTRAINT "bomberos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bomberos" ADD CONSTRAINT "bomberos_rango_fkey" FOREIGN KEY ("rango") REFERENCES "bomberos_rangos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategoria_alerta" ADD CONSTRAINT "subcategoria_alerta_categoria_alerta_id_fkey" FOREIGN KEY ("categoria_alerta_id") REFERENCES "categorias_alerta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerta" ADD CONSTRAINT "alerta_sub_categoria_alerta_id_fkey" FOREIGN KEY ("sub_categoria_alerta_id") REFERENCES "subcategoria_alerta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerta" ADD CONSTRAINT "alerta_estado_alerta_id_fkey" FOREIGN KEY ("estado_alerta_id") REFERENCES "estados_alerta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respuestas_alertas" ADD CONSTRAINT "respuestas_alertas_alerta_id_fkey" FOREIGN KEY ("alerta_id") REFERENCES "alerta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respuestas_alertas" ADD CONSTRAINT "respuestas_alertas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_comunicacion" ADD CONSTRAINT "registros_comunicacion_alerta_id_fkey" FOREIGN KEY ("alerta_id") REFERENCES "alerta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_comunicacion" ADD CONSTRAINT "registros_comunicacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
