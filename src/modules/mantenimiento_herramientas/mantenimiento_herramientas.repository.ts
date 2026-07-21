import { prisma } from "../../lib/prisma";
import { GuardarMantenimientoHerramientaDTO } from "./DTO/mantenimiento_herramientas_DTO";
import { randomUUID } from "crypto";
import { getLocalDate } from "../../lib/utils";

export class MantenimientoHerramientasRepositorio {
    async guardarMantenimiento(data: GuardarMantenimientoHerramientaDTO) {
        return await prisma.mantenimiento_herramientas.create({
            data: {
                id: randomUUID(),
                herramienta_id: data.herramientaId,
                usuario_id: data.usuarioId,
                fecha_mantenimiento: getLocalDate(),
                nivel_aceite: data.nivel_aceite,
                estado_mangueras: data.estado_mangueras,
                presion_trabajo: data.presion_trabajo,
                estado_limpieza: data.estado_limpieza,
                observaciones: data.observaciones || null
            }
        });
    }

    async obtenerHistorialPorHerramienta(herramientaId: string) {
        return await prisma.mantenimiento_herramientas.findMany({
            where: { herramienta_id: herramientaId },
            include: {
                usuarioId: {
                    select: {
                        id: true,
                        nombre_usuario: true,
                        bombero: {
                            select: {
                                nombre: true,
                                apellido: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                fecha_mantenimiento: 'desc'
            }
        });
    }
}
