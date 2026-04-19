import { prisma } from "../../lib/prisma"
import { crearAlertaDTO } from "./DTO/crear_alerta_dto"
import { randomUUID } from "crypto"

export class AlertaRepositorio {

    async crearAlerta(data: crearAlertaDTO) {

        return await prisma.alerta.create({
            data: {
                id: randomUUID(),
                sub_categoria_alerta_id: data.sub_categoria_alerta_id,
                ubicacion: data.ubicacion,
                observaciones: data.observaciones,
                fecha_hora: new Date(data.fecha_hora),
                estado_alerta_id: data.estado_alerta_id,
                usuario_alta_alerta: data.usuario_alta_alerta,
            }
        })
    }

    async buscarAlertaPorFecha(fecha_desde: string, fecha_hasta: string) {
        return await prisma.alerta.findMany({
            where: {
                fecha_hora:
                {
                    gte: new Date(fecha_desde),
                    lte: new Date(fecha_hasta)
                }
            }
        })
    }
    async buscarAlertaPorID(id_alerta: string) {
        return await prisma.alerta.findUnique({
            where: {
                id: id_alerta
            }
        })
    }
}