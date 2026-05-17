import { prisma } from "../../lib/prisma";
import { CrearBolsoDTO, ActualizarBolsoDTO } from "./DTO/bolsos_DTO";
import { randomUUID } from "crypto";

export class BolsosRepositorio {
    async obtenerTodos() {
        return await prisma.bolsos.findMany();
    }

    async obtenerPorId(id: string) {
        return await prisma.bolsos.findUnique({
            where: { id }
        });
    }

    async crear(data: CrearBolsoDTO) {
        return await prisma.bolsos.create({
            data: {
                id: randomUUID(),
                nombre_bolso: data.nombre_bolso
            }
        });
    }

    async actualizar(id: string, data: ActualizarBolsoDTO) {
        return await prisma.bolsos.update({
            where: { id },
            data: {
                nombre_bolso: data.nombre_bolso
            }
        });
    }

    async eliminar(id: string) {
        return await prisma.bolsos.delete({
            where: { id }
        });
    }
}