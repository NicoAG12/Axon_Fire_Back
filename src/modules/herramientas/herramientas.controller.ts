import { Request, Response } from 'express';
import { HerramientasService } from './herramientas.service';
import { CrearHerramientaDTO, ActualizarHerramientaDTO } from './DTO/herramientas_DTO';

export class HerramientasController {
    private service = new HerramientasService();

    obtenerTodos = async (req: Request, res: Response) => {
        try {
            const resultado = await this.service.obtenerTodos();
            return res.status(200).json(resultado);
        } catch (error: any) {
            console.error('Error al obtener herramientas:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    obtenerPorId = async (req: Request, res: Response) => {
        try {
            const { id } = req.params as { id: string };
            const resultado = await this.service.obtenerPorId(id);
            if (!resultado) {
                return res.status(404).json({ error: 'Herramienta no encontrada' });
            }
            return res.status(200).json(resultado);
        } catch (error: any) {
            console.error('Error al obtener herramienta:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    crear = async (req: Request, res: Response) => {
        try {
            const data: CrearHerramientaDTO = req.body;
            if (!data.nombre_herramienta || typeof data.cantidad_disponible !== 'number') {
                return res.status(400).json({ error: 'nombre_herramienta y cantidad_disponible son requeridos' });
            }
            const resultado = await this.service.crear(data);
            return res.status(201).json(resultado);
        } catch (error: any) {
            console.error('Error al crear herramienta:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    actualizar = async (req: Request, res: Response) => {
        try {
            const { id } = req.params as { id: string };
            const data: ActualizarHerramientaDTO = req.body;
            const resultado = await this.service.actualizar(id, data);
            return res.status(200).json(resultado);
        } catch (error: any) {
            console.error('Error al actualizar herramienta:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    eliminar = async (req: Request, res: Response) => {
        try {
            const { id } = req.params as { id: string };
            await this.service.eliminar(id);
            return res.status(204).send();
        } catch (error: any) {
            console.error('Error al eliminar herramienta:', error);
            return res.status(500).json({ error: error.message });
        }
    };
}