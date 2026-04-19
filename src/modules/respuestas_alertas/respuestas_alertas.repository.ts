import { prisma } from "../../lib/prisma";

export class RespuestasAlertasRepositorio {

    async crearRespuestaAlerta(data: any) {
        return await prisma.respuestas_alertas.create({
            data
        })
    }

}