import { prisma } from "../../lib/prisma"
import { crearAlertaDTO } from "./DTO/crearAlertaDTO"
import { randomUUID } from "crypto"

export class AlertaRepositorio {

    async crearAlerta(data: crearAlertaDTO) {

        return await prisma.alerta.create({
            data: {
                id: randomUUID(),
                sub_categoria_alerta_id: data.sub_categoria_alerta_id,
                ubicacion: data.ubicacion,
                observaciones: data.observaciones,
                fecha_hora: data.fecha_hora,
                estado_alerta_id: data.estado_alerta_id,
                usuario_alta_alerta: data.usuario_alta_alerta,
            }
        })
    }
}