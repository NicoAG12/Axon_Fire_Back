import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { MapsService } from './maps.service';

export class MapsController {
    private service = new MapsService();

    getConfig = async (req: AuthRequest, res: Response) => {
        try {
            const config = this.service.getConfig();
            return res.status(200).json(config);
        } catch (error: any) {
            console.error('Error al obtener config del mapa:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    getIncident = async (req: AuthRequest, res: Response) => {
        try {
            const { id } = req.params as { id: string };
            const incident = await this.service.getIncident(id);
            return res.status(200).json(incident);
        } catch (error: any) {
            if (error.message === 'INCIDENT_NOT_FOUND') {
                return res.status(404).json({ error: 'El incidente no existe' });
            }
            if (error.message === 'INCIDENT_NO_COORDS') {
                return res.status(400).json({ error: 'El incidente no tiene coordenadas válidas' });
            }
            console.error('Error al obtener incidente:', error);
            return res.status(500).json({ error: error.message });
        }
    };
}
