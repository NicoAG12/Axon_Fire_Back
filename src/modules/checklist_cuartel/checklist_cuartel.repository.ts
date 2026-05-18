import { prisma } from "../../lib/prisma";
import { GuardarChecklistCuartelDTO } from "./DTO/checklist_cuartel_DTO";
import { randomUUID } from "crypto";
import { getLocalDate } from "../../lib/utils";

export class ChecklistCuartelRepositorio {
    async crearChecklist(data: GuardarChecklistCuartelDTO) {
        return await prisma.$transaction(async (tx) => {
            const checklist = await tx.checklist_cuartel.create({
                data: {
                    id: randomUUID(),
                    usuario_id: data.usuarioId,
                    fecha_control: getLocalDate()
                }
            });

            const detalles = data.detalles.map(d => ({
                id: randomUUID(),
                checklist_id: checklist.id,
                herramienta_id: d.herramientaId,
                controlado: d.controlado,
                observaciones: d.observaciones || null
            }));

            await tx.checklist_detalle_cuartel.createMany({
                data: detalles
            });

            return checklist;
        });
    }

    async obtenerHistorialChecklists() {
        return await prisma.checklist_cuartel.findMany({
            include: {
                usuario: {
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
                        herramienta: true
                    }
                }
            },
            orderBy: {
                fecha_control: 'desc'
            }
        });
    }

    async obtenerDetalleChecklist(id: string) {
        return await prisma.checklist_cuartel.findUnique({
            where: { id },
            include: {
                usuario: {
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
                        herramienta: true
                    }
                }
            }
        });
    }
}