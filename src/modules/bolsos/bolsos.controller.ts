import { Request, Response } from 'express';
import { BolsosService } from './bolsos.service';
import { CrearBolsoDTO, ActualizarBolsoDTO } from './DTO/bolsos_DTO';

export class BolsosController {
    private service = new BolsosService();

    obtenerTodos = async (req: Request, res: Response) => {
        try {
            const resultado = await this.service.obtenerTodos();
            return res.status(200).json(resultado);
        } catch (error: any) {
            console.error('Error al obtener bolsos:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    obtenerPorId = async (req: Request, res: Response) => {
        try {
            const { id } = req.params as { id: string };
            const resultado = await this.service.obtenerPorId(id);
            if (!resultado) {
                return res.status(404).json({ error: 'Bolso no encontrado' });
            }
            return res.status(200).json(resultado);
        } catch (error: any) {
            console.error('Error al obtener bolso:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    crear = async (req: Request, res: Response) => {
        try {
            const data: CrearBolsoDTO = req.body;
            if (!data.nombre_bolso) {
                return res.status(400).json({ error: 'nombre_bolso es requerido' });
            }
            const resultado = await this.service.crear(data);
            return res.status(201).json(resultado);
        } catch (error: any) {
            console.error('Error al crear bolso:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    actualizar = async (req: Request, res: Response) => {
        try {
            const { id } = req.params as { id: string };
            const data: ActualizarBolsoDTO = req.body;
            const resultado = await this.service.actualizar(id, data);
            return res.status(200).json(resultado);
        } catch (error: any) {
            console.error('Error al actualizar bolso:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    eliminar = async (req: Request, res: Response) => {
        try {
            const { id } = req.params as { id: string };
            await this.service.eliminar(id);
            return res.status(204).send();
        } catch (error: any) {
            console.error('Error al eliminar bolso:', error);
            return res.status(500).json({ error: error.message });
        }
    };
}