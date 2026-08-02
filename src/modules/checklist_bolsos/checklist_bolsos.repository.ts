import { prisma } from "../../lib/prisma";
import { GuardarChecklistBolsoDTO } from "./DTO/checklist_bolsos_DTO";
import { randomUUID } from "crypto";
import { getLocalDate } from "../../lib/utils";

export class ChecklistBolsosRepositorio {
    async guardarChecklist(data: GuardarChecklistBolsoDTO) {
        return await prisma.$transaction(async (tx) => {
            const checklist = await tx.checklist_bolsos_emergencia.create({
                data: {
                    id: randomUUID(),
                    bolso_id: data.bolsoId,
                    usuario_id: data.usuarioId,
                    alerta_id: data.alertaId || null,
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

            await tx.checklist_detalle_bolso.createMany({
                data: detalles
            });

            return checklist;
        });
    }

    async obtenerHistorialPorBolso(bolsoId: string) {
        return await prisma.checklist_bolsos_emergencia.findMany({
            where: { bolso_id: bolsoId },
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
                alertaId: {
                    select: {
                        id: true,
                        ubicacion: true,
                        fecha_hora: true
                    }
                },
                detalles: {
                    where: {
                        controlado: 'FALTANTE'
                    },
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