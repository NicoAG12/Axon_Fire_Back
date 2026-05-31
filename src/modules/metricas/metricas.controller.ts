import { Response } from 'express';
import { AuthRequest } from "../../middlewares/auth.middleware";
import { MetricasService } from './metricas.service';

export class MetricasController {
    private service: MetricasService;

    constructor() {
        this.service = new MetricasService();
    }

    obtenerMetricasMensuales = async (req: AuthRequest, res: Response) => {
        try {
            const mes = parseInt(req.query.mes as string);
            const anio = parseInt(req.query.anio as string);

            if (isNaN(mes) || isNaN(anio)) {
                return res.status(400).json({ error: 'Los parámetros "mes" y "anio" son obligatorios y deben ser números' });
            }

            const metricas = await this.service.obtenerMetricasMensuales(mes, anio);
            return res.json(metricas);

        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}
