import { prisma } from "../../lib/prisma";
import { GuardarControlFluidosDTO } from "./DTO/control_fluidos_DTO";
import { randomUUID } from "crypto";
import { getLocalDate } from "../../lib/utils";

export class ControlFluidosRepositorio {
    async guardarControl(data: GuardarControlFluidosDTO) {
        return await prisma.control_fluidos.create({
            data: {
                id: randomUUID(),
                camion_id: data.camionId,
                usuario_id: data.usuarioId,
                fecha_control: getLocalDate(),
                aceite_motor: data.aceite_motor,
                liquido_refrigerante: data.liquido_refrigerante,
                liquido_frenos: data.liquido_frenos,
                liquido_direccion: data.liquido_direccion,
                observaciones: data.observaciones || null
            }
        });
    }

    async obtenerHistorialPorCamion(camionId: string) {
        return await prisma.control_fluidos.findMany({
            where: { camion_id: camionId },
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
                fecha_control: 'desc'
            }
        });
    }
}
