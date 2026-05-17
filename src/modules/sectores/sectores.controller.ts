import { Request, Response } from 'express';
import { SectoresService } from './sectores.service';
import { CrearSectorDTO } from './DTO/sectores_DTO';

export class SectoresController {
    private service = new SectoresService();

    crear = async (req: Request, res: Response) => {
        try {
            const data: CrearSectorDTO = req.body;
            if (!data.camionId || !data.nombre_sector) {
                return res.status(400).json({ error: 'camionId y nombre_sector son requeridos' });
            }
            const resultado = await this.service.crear(data);
            return res.status(201).json(resultado);
        } catch (error: any) {
            console.error('Error al crear sector:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    obtenerPorCamion = async (req: Request, res: Response) => {
        try {
            const { camionId } = req.params as { camionId: string };
            if (!camionId) {
                return res.status(400).json({ error: 'camionId es requerido' });
            }
            const resultado = await this.service.obtenerPorCamion(camionId);
            return res.status(200).json(resultado);
        } catch (error: any) {
            console.error('Error al obtener sectores:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    eliminar = async (req: Request, res: Response) => {
        try {
            const { id } = req.params as { id: string };
            await this.service.eliminar(id);
            return res.status(204).send();
        } catch (error: any) {
            console.error('Error al eliminar sector:', error);
            return res.status(500).json({ error: error.message });
        }
    };
}