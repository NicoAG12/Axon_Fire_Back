import { Response } from 'express';
import { AuthRequest } from "../../middlewares/auth.middleware";
import { RespuestasAlertasService } from './respuestas_alertas.service';
import { modificarRespuestaAlertaDTO } from './DTO/respuestas_alertas_DTO';

export class RespuestasAlertasController {
    private service: RespuestasAlertasService;

    constructor() {
        this.service = new RespuestasAlertasService();
    }


    obtenerRespuestasPorAlerta = async (req: AuthRequest, res: Response) => {
        try {
            const id_alerta = req.params.id_alerta as string;
            const respuestas = await this.service.obtenerRespuestas(id_alerta);
            return res.json(respuestas);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    obtenerCantidadAsistentes = async (req: AuthRequest, res: Response) => {
        try {
            const id_alerta = req.params.id_alerta as string;
            const resultado = await this.service.obtenerCantidadAsistentes(id_alerta);
            return res.json(resultado);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    obtenerRespuestaPorId = async (req: AuthRequest, res: Response) => {
        try {
            const id_respuesta = req.params.id_respuesta as string;
            const respuesta = await this.service.obtenerRespuestaPorId(id_respuesta);
            if (!respuesta) {
                return res.status(404).json({ error: 'Respuesta de alerta no encontrada' });
            }
            return res.json(respuesta);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }


    eliminarRespuesta = async (req: AuthRequest, res: Response) => {
        try {
            const id_respuesta = req.params.id_respuesta as string;
            await this.service.eliminarRespuesta(id_respuesta);
            return res.status(204).send();
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    responderAviso = async (req: AuthRequest, res: Response) => {
        try {
            const usuarioId = (req.user as any).id_usuario;
            if (!usuarioId) {
                return res.status(401).json({ error: 'Usuario no autenticado en el token' });
            }
            const alerta_id = req.params.alerta_id as string;
            const data: modificarRespuestaAlertaDTO = req.body;
            const respuesta = await this.service.responderAviso(alerta_id, usuarioId, data);
            return res.status(200).json(respuesta);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}
