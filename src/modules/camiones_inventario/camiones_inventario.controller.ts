import { Request, Response } from 'express';
import { CamionesInventarioService } from './camiones_inventario.service';
import { AgregarInventarioDTO, ActualizarInventarioDTO } from './DTO/camiones_inventario_DTO';

export class CamionesInventarioController {
    private service = new CamionesInventarioService();

    agregarInventario = async (req: Request, res: Response) => {
        try {
            const data: AgregarInventarioDTO = req.body;
            if (!data.camionId || !data.herramientaId || !data.sectorId || typeof data.cantidad !== 'number') {
                return res.status(400).json({ error: 'camionId, herramientaId, sectorId y cantidad son requeridos' });
            }
            const resultado = await this.service.agregarInventario(data);
            return res.status(201).json(resultado);
        } catch (error: any) {
            console.error('Error al agregar inventario:', error);
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
            console.error('Error al obtener inventario:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    obtenerPorCamionAgrupado = async (req: Request, res: Response) => {
        try {
            const { camionId } = req.params as { camionId: string };
            if (!camionId) {
                return res.status(400).json({ error: 'camionId es requerido' });
            }
            const resultado = await this.service.obtenerPorCamionAgrupado(camionId);
            return res.status(200).json(resultado);
        } catch (error: any) {
            console.error('Error al obtener inventario agrupado:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    actualizar = async (req: Request, res: Response) => {
        try {
            const { id } = req.params as { id: string };
            const data: ActualizarInventarioDTO = req.body;
            const resultado = await this.service.actualizar(id, data);
            return res.status(200).json(resultado);
        } catch (error: any) {
            console.error('Error al actualizar inventario:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    eliminar = async (req: Request, res: Response) => {
        try {
            const { id } = req.params as { id: string };
            await this.service.eliminar(id);
            return res.status(204).send();
        } catch (error: any) {
            console.error('Error al eliminar inventario:', error);
            return res.status(500).json({ error: error.message });
        }
    };
}