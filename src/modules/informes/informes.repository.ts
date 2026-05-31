import { prisma } from "../../lib/prisma";
import { ActualizarBorradorDTO } from "./DTO/informes_dto";

export class InformesRepositorio {

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
                observaciones_admin: datos.observaciones_admin,
                detalles_propiedad: datos.detalles_propiedad,
            }
        });
    }

    async finalizarInforme(alertaId: string) {
        return await prisma.informes_emergencia.update({
            where: { alerta_id: alertaId },
            data: { estado_informe: 'FINALIZADO' }
        });
    }
}
