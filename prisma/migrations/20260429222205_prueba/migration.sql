-- AlterEnum
ALTER TYPE "tipos_respuesta" ADD VALUE 'PENDIENTE';

-- CreateTable
CREATE TABLE "tokens_dispositivos" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "plataforma" TEXT,
    "fecha_alta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_dispositivos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tokens_dispositivos_token_key" ON "tokens_dispositivos"("token");

-- AddForeignKey
ALTER TABLE "tokens_dispositivos" ADD CONSTRAINT "tokens_dispositivos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
