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
        return await prisma.$transaction(async (tx) => {
            const inventario = await tx.bolsos_inventario.findUnique({
                where: { id }
            });
            if (!inventario) {
                throw new Error("Bolso no encontrada");
            }

            const nuevaCantidad = data.cantidad !== undefined ? data.cantidad : inventario.cantidad_herramienta;

            const nuevaHerramientaId = (data as any).herramientaId || inventario.herramienta_id;

            await tx.herramientas.update({
                where: { id: inventario.herramienta_id },
                data: {
                    cantidad_disponible: { increment: inventario.cantidad_herramienta }
                }
            });

            const herramienta = await tx.herramientas.findUnique({ where: { id: nuevaHerramientaId } });
            if (!herramienta || herramienta.cantidad_disponible < nuevaCantidad) {
                throw new Error("No hay suficiente stock para la actualización");
            }

            await tx.herramientas.update({
                where: { id: nuevaHerramientaId },
                data: {
                    cantidad_disponible: { decrement: nuevaCantidad }
                }
            });

            const newInventario = await tx.bolsos_inventario.update({
                where: { id },
                data: {
                    cantidad_herramienta: nuevaCantidad,
                    herramienta_id: nuevaHerramientaId
                }
            });

            return newInventario;
        });
    }

    async eliminar(id: string) {
        return await prisma.$transaction(async (tx) => {
            const inventario = await tx.bolsos_inventario.findUnique({
                where: { id }
            });
            if (!inventario) {
                throw new Error("Bolso no encontrada");
            }
            await tx.herramientas.update({
                where: { id: inventario.herramienta_id },
                data: {
                    cantidad_disponible: { increment: inventario.cantidad_herramienta }
                }
            });
            return inventario;
        });
    }
}