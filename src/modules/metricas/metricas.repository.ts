import { prisma } from "../../lib/prisma";

export class MetricasRepositorio {

    async emergenciasPorTipoPorMes(mes: number, anio: number) {
        const desde = new Date(anio, mes - 1, 1);
        const hasta = new Date(anio, mes, 0, 23, 59, 59);

        const agrupadas = await prisma.alerta.groupBy({
            by: ['sub_categoria_alerta_id'],
            where: {
                fecha_hora: { gte: desde, lte: hasta }
            },
            _count: { id: true }
        });

        // Traer nombres de subcategorías para enriquecer la respuesta
        const subcategorias = await prisma.subcategoria_alerta.findMany({
            include: { categoriaAlerta: true }
        });

        const mapaSubcategorias = new Map<string, { nombre_sub_categoria: string; categoria: string }>();
        for (const sc of subcategorias) {
            mapaSubcategorias.set(sc.id, {
                nombre_sub_categoria: sc.nombre_sub_categoria,
                categoria: sc.categoriaAlerta.nombre_categoria
            });
        }

        return agrupadas.map((g: { sub_categoria_alerta_id: string; _count: { id: number } }) => ({
            sub_categoria_alerta_id: g.sub_categoria_alerta_id,
            subcategoria: mapaSubcategorias.get(g.sub_categoria_alerta_id)?.nombre_sub_categoria || 'Desconocida',
            categoria: mapaSubcategorias.get(g.sub_categoria_alerta_id)?.categoria || 'Desconocida',
            cantidad: g._count.id
        }));
    }

    async alertasConAsistenciasPorMes(mes: number, anio: number) {
        const desde = new Date(anio, mes - 1, 1);
        const hasta = new Date(anio, mes, 0, 23, 59, 59);

        return await prisma.alerta.findMany({
            where: {
                fecha_hora: { gte: desde, lte: hasta }
            },
            select: {
                id: true,
                duracion_total_alerta: true,
                respuestas: {
                    where: { estado_respuesta: 'ACEPTADO' },
                    select: {
                        usuario_id: true,
                        usuarioId: {
                            select: {
                                bombero: {
                                    select: { nombre: true, apellido: true }
                                }
                            }
                        }
                    }
                }
            }
        });
    }
}
