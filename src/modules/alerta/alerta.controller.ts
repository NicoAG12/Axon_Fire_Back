import { Request, Response } from 'express'
import { AlertaService } from './alerta.service'
import { crearAlertaDTO } from './DTO/crear_alerta_dto'

export class AlertaController {
    private alertaService: AlertaService;

    constructor() {
        this.alertaService = new AlertaService();
    }

    crearAlerta = async (req: Request, res: Response) => {
        try {
            const data: crearAlertaDTO = req.body;
            const nuevaAlerta = await this.alertaService.crearAlerta(data);
            return res.json({
                id: nuevaAlerta.id, fecha_hora:
                    nuevaAlerta.fecha_hora,
                ubicacion: nuevaAlerta.ubicacion,
                observaciones: nuevaAlerta.observaciones,
                sub_categoria_alerta_id: nuevaAlerta.sub_categoria_alerta_id,
                estado_alerta_id: nuevaAlerta.estado_alerta_id
            });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    obtenerAlertasPorFecha = async (req: Request, res: Response) => {
        try {
            const { fecha_desde, fecha_hasta } = req.body;
            const alertas = await this.alertaService.obtenerAlertasPorFechas(fecha_desde, fecha_hasta)
            return res.json({
                alertas
            })

        } catch (error) {

        }
    }

    obtenerAlertaPorID = async (req: Request<{ id_alerta: string }>, res: Response) => {
        try {
            const { id_alerta } = req.params;
            const alerta = await this.alertaService.obtenerAlertaPorID(id_alerta);

            if (!alerta) {
                return res.status(404).json({ error: 'Alerta no encontrada' });
            }

            return res.json(alerta);

        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}
