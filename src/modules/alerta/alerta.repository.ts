import { prisma } from "../../lib/prisma"
import { crearAlertaDTO, crearAlertaConNotificacionDTO } from "./DTO/crear_alerta_dto"
import { randomUUID } from "crypto"
import { tipos_respuesta } from "../../../generated/client"
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

    async crearAlertaCompletaTx(dataAlerta: crearAlertaConNotificacionDTO, idsBomberos: string[], idEstadoInicial: string) {
        return await prisma.$transaction(async (tx) => {
            const alerta = await tx.alerta.create({
                data: {
                    id: randomUUID(),
                    sub_categoria_alerta_id: dataAlerta.sub_categoria_alerta_id,
                    ubicacion: dataAlerta.ubicacion,
                    observaciones: dataAlerta.observaciones,
                    fecha_hora: new Date(),
                    estado_alerta_id: idEstadoInicial,
                    usuario_alta_alerta: dataAlerta.usuario_alta_alerta,
                }
            });

            const respuestasPendientes = idsBomberos.map(id => ({
                alerta_id: alerta.id,
                usuario_id: id,
                estado_respuesta: 'PENDIENTE' as tipos_respuesta,
                fecha_hora: new Date()
            }));

            await tx.respuestas_alertas.createMany({
                data: respuestasPendientes
            });

            return alerta;
        });
    }

    async buscarEstadoPorNombre(nombre: string) {
        return await prisma.estados_alerta.findUnique({ where: { nombre_estado: nombre } });
    }

    async buscarTodosLosBomberosIds() {
        const bomberos = await prisma.bomberos.findMany({ select: { usuario_id: true } });
        return bomberos.map(b => b.usuario_id);
    }

    async actualizarEstadoAlerta(alertaId: string, idEstadoNuevo: string, fecha_hora_finalizacion: string, duracion: number) {
        return await prisma.alerta.update({
            where: { id: alertaId },
            data: { estado_alerta_id: idEstadoNuevo, fecha_hora_finalizacion: fecha_hora_finalizacion, duracion: duracion }
        });
    }

    async buscarAlertaPorFecha(fecha_desde: string, fecha_hasta: string) {
        return await prisma.alerta.findMany({
            where: {
                fecha_hora:
                {
                    gte: new Date(fecha_desde),
                    lte: new Date(fecha_hasta)
                }
            },
            include: {
                estadoAlerta: true
            }
        })
    }
    async buscarAlertaPorID(id_alerta: string) {
        return await prisma.alerta.findUnique({
            where: {
                id: id_alerta
            },
            include: {
                estadoAlerta: true
            }
        })
    }

    async buscarAlertaPorUsuario(usuario_id: string) {
        return await prisma.alerta.findMany({
            where: {
                usuario_alta_alerta: usuario_id
            },
            include: {
                estadoAlerta: true
            },
            orderBy: {
                fecha_hora: 'desc'
            }
        })
    }

    async limpiarTodo() {
        return await prisma.$transaction(async (tx) => {
            await tx.registros_comunicacion.deleteMany({});
            await tx.respuestas_alertas.deleteMany({});
            await tx.alerta.deleteMany({});
            return { message: "Todo limpio" };
        });
    }
}