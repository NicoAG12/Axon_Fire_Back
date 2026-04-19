import { prisma } from "../../lib/prisma";
import { crearRespuestaAlertaDTO, modificarRespuestaAlertaDTO } from "./DTO/respuestas_alertas_DTO";

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

    async obtenerRespuestasAlertas() {
        return await prisma.respuestas_alertas.findMany({
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
                usuarioId: true
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

}