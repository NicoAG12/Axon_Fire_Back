import { prisma } from "../../lib/prisma";
import { crearRegistroComunicacionDTO } from "./DTO/registros_comunicacion_DTO";

export class RegistrosComunicacionRepositorio {

    async crearRegistro(data: crearRegistroComunicacionDTO) {
        return await prisma.registros_comunicacion.create({
            data: {
                alerta_id: data.alerta_id,
                usuario_id: data.usuario_id,
                mensaje: data.mensaje,
                tipo_comunicacion: data.tipo_comunicacion,
                fecha_hora: data.fecha_hora
            }
        });
    }

    async obtenerRegistrosPorAlerta(alertaId: string) {
        return await prisma.registros_comunicacion.findMany({
            where: { alerta_id: alertaId },
            orderBy: { fecha_hora: 'desc' },
            include: {
                usuarioId: {
                    select: {
                        nombre_usuario: true,
                        rol: true,
                        bombero: {
                            select: {
                                nombre: true,
                                apellido: true
                            }
                        }
                    }
                }
            }
        });
    }

}