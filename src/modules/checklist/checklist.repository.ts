import { prisma } from "../../lib/prisma";
import { GuardarChecklistDTO } from "./DTO/checklist_DTO";
import { randomUUID } from "crypto";
import { getLocalDate } from "../../lib/utils";

export class ChecklistRepositorio {
    async guardarChecklist(data: GuardarChecklistDTO) {
        return await prisma.$transaction(async (tx) => {
            const checklist = await tx.checklist_camiones_diario.create({
                data: {
                    id: randomUUID(),
                    camion_id: data.camionId,
                    usuario_id: data.usuarioId,
                    fecha_control: getLocalDate()
                }
            });

            const detalles = data.detalles.map(d => ({
                id: randomUUID(),
                checklist_id: checklist.id,
                inventario_id: d.inventarioId,
                controlado: d.controlado,
                observaciones: d.observaciones || null
            }));

            await tx.checklist_detalle.createMany({
                data: detalles
            });

            return checklist;
        });
    }


    async obtenerHistorialPorCamion(camionId: string) {
        return await prisma.checklist_camiones_diario.findMany({
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
                },
                detalles: {

                    include: {
                        inventarioId: {
                            include: {
                                herramientaId: true
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