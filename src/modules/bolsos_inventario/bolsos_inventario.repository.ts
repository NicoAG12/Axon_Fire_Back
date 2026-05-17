import { prisma } from "../../lib/prisma";
import { AgregarInventarioBolsoDTO, ActualizarInventarioBolsoDTO } from "./DTO/bolsos_inventario_DTO";
import { randomUUID } from "crypto";

export class BolsosInventarioRepositorio {
    async agregarInventario(data: AgregarInventarioBolsoDTO) {
        return await prisma.$transaction(async (tx) => {
            const inventario = await tx.bolsos_inventario.create({
                data: {
                    id: randomUUID(),
                    bolso_id: data.bolsoId,
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

    async obtenerPorBolso(bolsoId: string) {
        return await prisma.bolsos_inventario.findMany({
            where: { bolso_id: bolsoId },
            include: {
                herramientaId: true
            }
        });
    }

    async obtenerPorId(id: string) {
        return await prisma.bolsos_inventario.findUnique({
            where: { id },
            include: {
                herramientaId: true
            }
        });
    }

    async actualizar(id: string, data: ActualizarInventarioBolsoDTO) {
        return await prisma.bolsos_inventario.update({
            where: { id },
            data: {
                cantidad_herramienta: data.cantidad
            }
        });
    }

    async eliminar(id: string) {
        return await prisma.bolsos_inventario.delete({
            where: { id }
        });
    }
}