import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { PoisService } from './pois.service';
import { CrearPoiDTO, ActualizarPoiDTO } from './DTO/pois_dto';
import { categoria_poi } from '@prisma/client';

export class PoisController {
    private service = new PoisService();

    crearPOI = async (req: AuthRequest, res: Response) => {
        try {
            const data: CrearPoiDTO = req.body;

            const adminId = (req.user as any).id_usuario;
            const resultado = await this.service.crearPoi(data, adminId);
            return res.status(201).json(resultado);
        } catch (error: any) {
            console.error('Error al crear POI:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    obtenerPOIs = async (req: AuthRequest, res: Response) => {
        try {
            const type = req.query.type as string | undefined;

            // Validar que el tipo sea válido si se envió
            if (type && !Object.values(categoria_poi).includes(type as any)) {
                return res.status(400).json({
                    error: `Categoria invalida. Debe ser una de: ${Object.values(categoria_poi).join(', ')}`
                });
            }

            const resultado = await this.service.obtenerPois(type as categoria_poi | undefined);
            return res.status(200).json(resultado);
        } catch (error: any) {
            console.error('Error al obtener POIs:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    actualizarPOI = async (req: AuthRequest, res: Response) => {
        try {
            const { id } = req.params as { id: string };
            const data: ActualizarPoiDTO = req.body;

            const resultado = await this.service.actualizarPoi(id, data);
            return res.status(200).json(resultado);
        } catch (error: any) {
            console.error('Error al actualizar POI:', error);
            if (error.message === 'POI no encontrado') {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    };

    eliminarPOI = async (req: AuthRequest, res: Response) => {
        try {
            const { id } = req.params as { id: string };
            await this.service.eliminarPoi(id);
            return res.status(200).json({ message: 'POI eliminado correctamente' });
        } catch (error: any) {
            console.error('Error al eliminar POI:', error);
            if (error.message === 'POI no encontrado') {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    };
}
