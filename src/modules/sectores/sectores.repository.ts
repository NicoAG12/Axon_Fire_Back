import { prisma } from "../../lib/prisma";
import { CrearSectorDTO } from "./DTO/sectores_DTO";
import { randomUUID } from "crypto";

export class SectoresRepositorio {
    async crear(data: CrearSectorDTO) {
        return await prisma.sectores_camion.create({
            data: {
                id: randomUUID(),
                camion_id: data.camionId,
                nombre_sector: data.nombre_sector
            }
        });
    }

    async obtenerPorCamion(camionId: string) {
        return await prisma.sectores_camion.findMany({
            where: { camion_id: camionId },
            orderBy: { nombre_sector: 'asc' }
        });
    }

    async obtenerPorId(id: string) {
        return await prisma.sectores_camion.findUnique({
            where: { id }
        });
    }

    async eliminar(id: string) {
        return await prisma.sectores_camion.delete({
            where: { id }
        });
    }
}