import { prisma } from "../../lib/prisma";
import { ActualizarBorradorDTO } from "./DTO/informes_dto";

export class InformesRepositorio {
    /*
    --Se modifico por cambio en la logica de informes.
        async obtenerDatosParaInforme(alertaId: string) {
            return await prisma.alerta.findUnique({
                where: { id: alertaId },
                include: {
                    subCategoriaAlerta: {
                        include: { categoriaAlerta: true }
                    },
                    estadoAlerta: true,
                    respuestas: {
                        where: { estado_respuesta: 'ACEPTADO' },
                        include: {
                            usuarioId: {
                                select: {
                                    bombero: {
                                        select: {
                                            nombre: true,
                                            apellido: true,
                                            rangoBombero: {
                                                select: { nombre_rol: true }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    informe: true
                }
            });
        }
    */
    async obtenerDatosParaInforme(alertaId: string) {
        return await prisma.informes_emergencia.findUnique({ where: { alerta_id: alertaId } })
    }

    async obtenerBorradorPorAlerta(alertaId: string) {
        return await prisma.informes_emergencia.findUnique({
            where: { alerta_id: alertaId }
        });
    }

    async crearOObtenerBorrador(alertaId: string, creadoPor: string) {
        return await prisma.informes_emergencia.upsert({
            where: { alerta_id: alertaId },
            create: {
                alerta_id: alertaId,
                creado_por: creadoPor,
            },
            update: {} // Si ya existe, no modifica nada
        });
    }

    async actualizarBorrador(alertaId: string, datos: ActualizarBorradorDTO) {
        return await prisma.informes_emergencia.update({
            where: { alerta_id: alertaId },
            data: {
                observaciones_admin: datos.observaciones_admin
            }
        });
    }

    async actualizarInforme(alertaId: string, data: any, userId: string) {
        return await prisma.informes_emergencia.upsert({
            where: { alerta_id: alertaId },
            create: {
                alerta_id: alertaId,
                creado_por: userId,
                fecha_creacion: new Date(),
                fecha_actualizacion: new Date()
            },
            update: {
                observaciones_admin: data.observaciones_admin,
                fecha_actualizacion: new Date()
            }
        })
    }



    async finalizarInforme(alertaId: string) {
        return await prisma.informes_emergencia.update({
            where: { alerta_id: alertaId },
            data: { estado_informe: 'FINALIZADO' }
        });
    }
}
