import { prisma } from "../../lib/prisma";
import { CrearCamionDTO, ActualizarCamionDTO } from "./DTO/camiones_DTO";
import { randomUUID } from "crypto";
import { estado_camion } from "@prisma/client";

export class CamionesRepositorio {
    async obtenerTodos() {
        return await prisma.camiones.findMany();
    }

    async obtenerActivos() {
        return await prisma.camiones.findMany({
            where: { estado: 'ACTIVO' }
        });
    }

    async obtenerPorId(id: string) {
        return await prisma.camiones.findUnique({
            where: { id }
        });
    }

    async crear(data: CrearCamionDTO) {
        const estadoValue = 'ACTIVO';
        return await prisma.camiones.create({
            data: {
                id: randomUUID(),
                nombre_camion: data.nombre_camion,
                estado: estadoValue as estado_camion
            }
        });
    }

    async actualizar(id: string, data: ActualizarCamionDTO) {
        return await prisma.camiones.update({
            where: { id },
            data: {
                nombre_camion: data.nombre_camion,
                estado: data.estado as estado_camion | undefined
            }
        });
    }

    async eliminar(id: string) {
        return await prisma.camiones.delete({
            where: { id }
        });
    }
}