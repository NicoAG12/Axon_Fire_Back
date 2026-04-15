import { Request, Response } from 'express'
import { AlertaService } from './alerta.service'
import { crearAlertaDTO } from './DTO/crearAlertaDTO'

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
}