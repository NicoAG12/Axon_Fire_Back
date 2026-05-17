import { Request, Response } from 'express';
import { BolsosInventarioService } from './bolsos_inventario.service';
import { AgregarInventarioBolsoDTO, ActualizarInventarioBolsoDTO } from './DTO/bolsos_inventario_DTO';

export class BolsosInventarioController {
    private service = new BolsosInventarioService();

    agregarInventario = async (req: Request, res: Response) => {
        try {
            const data: AgregarInventarioBolsoDTO = req.body;
            if (!data.bolsoId || !data.herramientaId || typeof data.cantidad !== 'number') {
                return res.status(400).json({ error: 'bolsoId, herramientaId y cantidad son requeridos' });
            }
            const resultado = await this.service.agregarInventario(data);
            return res.status(201).json(resultado);
        } catch (error: any) {
            console.error('Error al agregar inventario:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    obtenerPorBolso = async (req: Request, res: Response) => {
        try {
            const { bolsoId } = req.params as { bolsoId: string };
            if (!bolsoId) {
                return res.status(400).json({ error: 'bolsoId es requerido' });
            }
            const resultado = await this.service.obtenerPorBolso(bolsoId);
            return res.status(200).json(resultado);
        } catch (error: any) {
            console.error('Error al obtener inventario:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    actualizar = async (req: Request, res: Response) => {
        try {
            const { id } = req.params as { id: string };
            const data: ActualizarInventarioBolsoDTO = req.body;
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