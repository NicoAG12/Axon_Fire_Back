import { Request, Response } from 'express';
import { RespuestasAlertasService } from './respuestas_alertas.service';
import { crearRespuestaAlertaDTO, modificarRespuestaAlertaDTO } from './DTO/respuestas_alertas_DTO';

export class RespuestasAlertasController {
    private service: RespuestasAlertasService;

    constructor() {
        this.service = new RespuestasAlertasService();
    }

    crearRespuesta = async (req: Request, res: Response) => {
        try {
            const data: crearRespuestaAlertaDTO = req.body;
            const nuevaRespuesta = await this.service.crearRespuesta(data);
            return res.status(201).json(nuevaRespuesta);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    obtenerRespuestas = async (req: Request, res: Response) => {
        try {
            const respuestas = await this.service.obtenerRespuestas();
            return res.json(respuestas);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    obtenerRespuestaPorId = async (req: Request<{ id_respuesta: string }>, res: Response) => {
        try {
            const { id_respuesta } = req.params
            const respuesta = await this.service.obtenerRespuestaPorId(id_respuesta);
            if (!respuesta) {
                return res.status(404).json({ error: 'Respuesta de alerta no encontrada' });
            }
            return res.json(respuesta);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    actualizarRespuesta = async (req: Request<{ id_respuesta: string }>, res: Response) => {
        try {
            const { id_respuesta } = req.params;
            const data: modificarRespuestaAlertaDTO = req.body;
            const respuestaActualizada = await this.service.actualizarRespuesta(id_respuesta, data);
            return res.json(respuestaActualizada);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    eliminarRespuesta = async (req: Request<{ id_respuesta: string }>, res: Response) => {
        try {
            const { id_respuesta } = req.params;
            await this.service.eliminarRespuesta(id_respuesta);
            return res.status(204).send();
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}
