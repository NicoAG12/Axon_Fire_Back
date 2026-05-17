import { Request, Response } from 'express';
import { CamionesService } from './camiones.service';
import { CrearCamionDTO, ActualizarCamionDTO } from './DTO/camiones_DTO';

export class CamionesController {
    private service = new CamionesService();

    obtenerTodos = async (req: Request, res: Response) => {
        try {
            const resultado = await this.service.obtenerTodos();
            return res.status(200).json(resultado);
        } catch (error: any) {
            console.error('Error al obtener camiones:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    obtenerActivos = async (req: Request, res: Response) => {
        try {
            const resultado = await this.service.obtenerActivos();
            return res.status(200).json(resultado);
        } catch (error: any) {
            console.error('Error al obtener camiones activos:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    obtenerPorId = async (req: Request, res: Response) => {
        try {
            const { id } = req.params as { id: string };
            const resultado = await this.service.obtenerPorId(id);
            if (!resultado) {
                return res.status(404).json({ error: 'Camión no encontrado' });
            }
            return res.status(200).json(resultado);
        } catch (error: any) {
            console.error('Error al obtener camión:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    crear = async (req: Request, res: Response) => {
        try {
            const data: CrearCamionDTO = req.body;
            if (!data.nombre_camion) {
                return res.status(400).json({ error: 'nombre_camion es requerido' });
            }
            const resultado = await this.service.crear(data);
            return res.status(201).json(resultado);
        } catch (error: any) {
            console.error('Error al crear camión:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    actualizar = async (req: Request, res: Response) => {
        try {
            const { id } = req.params as { id: string };
            const data: ActualizarCamionDTO = req.body;
            const resultado = await this.service.actualizar(id, data);
            return res.status(200).json(resultado);
        } catch (error: any) {
            console.error('Error al actualizar camión:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    eliminar = async (req: Request, res: Response) => {
        try {
            const { id } = req.params as { id: string };
            await this.service.eliminar(id);
            return res.status(204).send();
        } catch (error: any) {
            console.error('Error al eliminar camión:', error);
            return res.status(500).json({ error: error.message });
        }
    };
}