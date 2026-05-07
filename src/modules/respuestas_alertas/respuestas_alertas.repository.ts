import { prisma } from "../../lib/prisma";
import { crearRespuestaAlertaDTO, modificarRespuestaAlertaDTO } from "./DTO/respuestas_alertas_DTO";
import { tipos_comunicacion, tipos_respuesta } from "../../../generated/client";

export class RespuestasAlertasRepositorio {

    async crearRespuestaAlerta(data: crearRespuestaAlertaDTO) {
        return await prisma.respuestas_alertas.create({
            data: {
                alerta_id: data.alerta_id,
                usuario_id: data.usuario_id,
                estado_respuesta: data.estado_respuesta,
                fecha_hora: data.fecha_hora
            }
        });
    }

    async obtenerRespuestasPorAlerta(id_alerta: string) {
        return await prisma.respuestas_alertas.findMany({
            where: { alerta_id: id_alerta },
            include: {
                alertaId: true,
                usuarioId: true
            }
        });
    }

    async obtenerRespuestaAlertaPorId(id: string) {
        return await prisma.respuestas_alertas.findUnique({
            where: { id },
            include: {
                alertaId: true,
                usuarioId: {
                    select: {
                        nombre_usuario: true,
                        bombero: {
                            select: {
                                nombre: true
                            }
                        }
                    }
                }
            }
        });
    }


    async actualizarRespuestaAlerta(id: string, data: Partial<modificarRespuestaAlertaDTO>) {
        return await prisma.respuestas_alertas.update({
            where: { id },
            data: {
                estado_respuesta: data.estado_respuesta
            }
        });
    }

    async eliminarRespuestaAlerta(id: string) {
        return await prisma.respuestas_alertas.delete({
            where: { id }
        });
    }

    async transaccionResponderAviso(alertaId: string, usuarioId: string, data: modificarRespuestaAlertaDTO) {
        return await prisma.$transaction(async (tx) => {
            const respuestaActual = await tx.respuestas_alertas.findFirst({
                where: { alerta_id: alertaId, usuario_id: usuarioId }
            });

            if (!respuestaActual) throw new Error("Aviso no encontrado");

            const respuestaActualizada = await tx.respuestas_alertas.update({
                where: { id: respuestaActual.id },
                data: {
                    estado_respuesta: data.estado_respuesta,
                    fecha_hora: data.fecha_hora
                }
            });

            if (data.estado_respuesta !== 'ACEPTADO') return respuestaActualizada;

            const alerta = await tx.alerta.findUnique({ where: { id: alertaId } });
            const estadoInicial = await tx.estados_alerta.findUnique({ where: { nombre_estado: 'PENDIENTE' } });
            const estadoEnCurso = await tx.estados_alerta.findUnique({ where: { nombre_estado: 'EN CURSO' } });
            const estadoFinalizado = await tx.estados_alerta.findUnique({ where: { nombre_estado: 'FINALIZADO' } })
            if (alerta?.estado_alerta_id === estadoFinalizado?.id) {
                throw new Error("No se puede responder una alerta ya finalizada")
            }

            if (alerta && estadoInicial && estadoEnCurso && alerta.estado_alerta_id === estadoInicial.id) {
                await tx.alerta.update({
                    where: { id: alertaId },
                    data: { estado_alerta_id: estadoEnCurso.id }
                });

                await tx.registros_comunicacion.create({
                    data: {
                        alerta_id: alertaId,
                        usuario_id: usuarioId,
                        mensaje: `El bombero aceptó. Estado cambiado a En Curso.`,
                        tipo_comunicacion: 'INFORMACION' as tipos_comunicacion,
                        fecha_hora: new Date()
                    }
                });
            }

            return respuestaActualizada;
        });
    }

}