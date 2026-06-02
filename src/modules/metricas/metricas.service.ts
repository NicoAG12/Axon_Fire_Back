import { MetricasRepositorio } from "./metricas.repository";

interface BomberoMetrica {
    usuario_id: string;
    nombre: string;
    apellido: string;
    total_asistencias: number;
    total_horas: number;
}

export class MetricasService {
    private repo: MetricasRepositorio;

    constructor() {
        this.repo = new MetricasRepositorio();
    }

    obtenerMetricasMensuales = async (mes: number, anio: number) => {
        // Validar parámetros
        if (mes < 1 || mes > 12) throw new Error("El mes debe estar entre 1 y 12");
        if (anio < 2000 || anio > 2100) throw new Error("Año inválido");

        // Métrica A: Emergencias por tipo
        const emergenciasPorTipo = await this.repo.emergenciasPorTipoPorMes(mes, anio);

        // Métrica B: Horas y asistencias por bombero
        const alertasConRespuestas = await this.repo.alertasConAsistenciasPorMes(mes, anio);

        // Agrupar por bombero
        const mapaBomberos = new Map<string, BomberoMetrica>();

        for (const alerta of alertasConRespuestas) {
            const duracionHoras = (alerta.duracion_total_alerta || 0) / 3_600_000;

            for (const respuesta of alerta.respuestas) {
                const existing = mapaBomberos.get(respuesta.usuario_id);
                const bombero = respuesta.usuarioId.bombero;

                if (existing) {
                    existing.total_asistencias += 1;
                    existing.total_horas += duracionHoras;
                } else {
                    mapaBomberos.set(respuesta.usuario_id, {
                        usuario_id: respuesta.usuario_id,
                        nombre: bombero?.nombre || 'Sin nombre',
                        apellido: bombero?.apellido || 'Sin apellido',
                        total_asistencias: 1,
                        total_horas: duracionHoras,
                    });
                }
            }
        }

        // Redondear horas a 2 decimales
        const bomberos = Array.from(mapaBomberos.values()).map(b => ({
            ...b,
            total_horas: Math.round(b.total_horas * 100) / 100
        }));

        // Ordenar por asistencias descendente
        bomberos.sort((a, b) => b.total_asistencias - a.total_asistencias);

        const totalEmergencias = emergenciasPorTipo.reduce((sum: number, e: { cantidad: number }) => sum + e.cantidad, 0);

        return {
            mes,
            anio,
            total_emergencias: totalEmergencias,
            emergencias_por_tipo: emergenciasPorTipo,
            bomberos,
        };
    }
}
