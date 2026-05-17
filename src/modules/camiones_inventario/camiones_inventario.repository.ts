import { prisma } from "../../lib/prisma";
import { AgregarInventarioDTO, ActualizarInventarioDTO } from "./DTO/camiones_inventario_DTO";
import { randomUUID } from "crypto";

export class CamionesInventarioRepositorio {
    async agregarInventario(data: AgregarInventarioDTO) {
        return await prisma.$transaction(async (tx) => {
            const inventario = await tx.camiones_inventario.create({
                data: {
                    id: randomUUID(),
                    camion_id: data.camionId,
                    sector_id: data.sectorId,
                    herramienta_id: data.herramientaId,
                    cantidad_herramienta: data.cantidad
                }
            });
            await tx.herramientas.update({
                where: { id: data.herramientaId },
                data: {
                    cantidad_disponible: { decrement: data.cantidad }
                }
            });
            return inventario;
        });
    }

    async obtenerPorCamion(camionId: string) {
        return await prisma.camiones_inventario.findMany({
            where: { camion_id: camionId },
            include: {
                sectorId: true,
                herramientaId: true
            }
        });
    }

    async obtenerPorId(id: string) {
        return await prisma.camiones_inventario.findUnique({
            where: { id },
            include: {
                sectorId: true,
                herramientaId: true
            }
        });
    }

    async actualizar(id: string, data: ActualizarInventarioDTO) {
        return await prisma.camiones_inventario.update({
            where: { id },
            data: {
                cantidad_herramienta: data.cantidad
            }
        });
    }

    async eliminar(id: string) {
        return await prisma.$transaction(async (tx) => {
            const inventario = await tx.camiones_inventario.findUnique({
                where: { id }
            });
            await tx.herramientas.update({
                where: { id: inventario?.herramienta_id },
                data: {
                    cantidad_disponible: { increment: inventario?.cantidad_herramienta }
                }
            });
            return await tx.camiones_inventario.delete({
                where: { id }
            });
        });
    }

    async eliminarPorCamion(camionId: string) {
        return await prisma.camiones_inventario.deleteMany({
            where: { camion_id: camionId }
        });
    }
}