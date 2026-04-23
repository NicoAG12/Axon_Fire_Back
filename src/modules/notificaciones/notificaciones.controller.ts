import { Request, Response } from 'express';
import { NotificacionesService } from './notificaciones.service';
import { registrarTokenDTO } from './DTO/notificaciones_DTO';

export class NotificacionesController {
    private service = new NotificacionesService();

    registrarToken = async (req: Request, res: Response) => {
        try {
            const data: registrarTokenDTO = req.body;
            const resultado = await this.service.registrarToken(data);
            return res.status(201).json(resultado);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    };
}