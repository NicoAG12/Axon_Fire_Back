import { Request, Response } from 'express';
import { RespuestasAlertasService } from './respuestas_alertas.service';
import { crearRespuestaAlertaDTO, modificarRespuestaAlertaDTO } from './DTO/respuestas_alertas_DTO';

export class RespuestasAlertasController {
    private service: RespuestasAlertasService;

    constructor() {
        this.service = new RespuestasAlertasService();
    }


    obtenerRespuestasPorAlerta = async (req: Request<{ id_alerta: string }>, res: Response) => {
        try {
            const { id_alerta } = req.params
            const respuestas = await this.service.obtenerRespuestas(id_alerta);
            return res.json(respuestas);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    obtenerCantidadAsistentes = async (req: Request<{ id_alerta: string }>, res: Response) => {
        try {
            const { id_alerta } = req.params;
            const resultado = await this.service.obtenerCantidadAsistentes(id_alerta);
            return res.json(resultado);
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


    eliminarRespuesta = async (req: Request<{ id_respuesta: string }>, res: Response) => {
        try {
            const { id_respuesta } = req.params;
            await this.service.eliminarRespuesta(id_respuesta);
            return res.status(204).send();
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    responderAviso = async (req: Request<{ alerta_id: string, usuario_id: string }>, res: Response) => {
        try {
            const { alerta_id, usuario_id } = req.params;
            const data: modificarRespuestaAlertaDTO = req.body;
            const respuesta = await this.service.responderAviso(alerta_id, usuario_id, data);
            return res.status(200).json(respuesta);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}
