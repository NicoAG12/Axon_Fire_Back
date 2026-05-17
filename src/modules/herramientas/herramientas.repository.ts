import { prisma } from "../../lib/prisma";
import { CrearHerramientaDTO, ActualizarHerramientaDTO } from "./DTO/herramientas_DTO";
import { randomUUID } from "crypto";

export class HerramientasRepositorio {
    async obtenerTodos() {
        return await prisma.herramientas.findMany();
    }

    async obtenerPorId(id: string) {
        return await prisma.herramientas.findUnique({
            where: { id }
        });
    }

    async crear(data: CrearHerramientaDTO) {
        return await prisma.herramientas.create({
            data: {
                id: randomUUID(),
                nombre_herramienta: data.nombre_herramienta,
                cantidad_disponible: data.cantidad_disponible
            }
        });
    }

    async actualizar(id: string, data: ActualizarHerramientaDTO) {
        return await prisma.herramientas.update({
            where: { id },
            data
        });
    }

    async eliminar(id: string) {
        return await prisma.herramientas.delete({
            where: { id }
        });
    }

    async actualizarStock(id: string, cantidad: number) {
        return await prisma.herramientas.update({
            where: { id },
            data: { cantidad_disponible: cantidad }
        });
    }
}