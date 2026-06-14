import { Response } from 'express';
import { AuthRequest } from "../../middlewares/auth.middleware";
import { AlertaService } from './alerta.service'
import { crearAlertaDTO, crearAlertaConNotificacionDTO } from './DTO/crear_alerta_dto'

export class AlertaController {
    private alertaService: AlertaService;

    constructor() {
        this.alertaService = new AlertaService();
    }

    crearAlerta = async (req: AuthRequest, res: Response) => {
        try {
            const usuarioId = (req.user as any).id_usuario;
            if (!usuarioId) {
                return res.status(401).json({ error: 'Usuario no autenticado en el token' });
            }
            const data: crearAlertaDTO = req.body;
            const nuevaAlerta = await this.alertaService.crearAlerta({ ...data, usuario_alta_alerta: usuarioId });
            return res.json({
                id: nuevaAlerta.id, fecha_hora:
                    nuevaAlerta.fecha_hora,
                ubicacion: nuevaAlerta.ubicacion,
                latitud: nuevaAlerta.latitud,
                longitud: nuevaAlerta.longitud,
                observaciones: nuevaAlerta.observaciones,
                sub_categoria_alerta_id: nuevaAlerta.sub_categoria_alerta_id,
                estado_alerta_id: nuevaAlerta.estado_alerta_id,
                prioridad: nuevaAlerta.prioridad
            });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    crearAlertaYNotificar = async (req: AuthRequest, res: Response) => {
        try {
            const usuarioId = (req.user as any).id_usuario;
            if (!usuarioId) {
                return res.status(401).json({ error: 'Usuario no autenticado en el token' });
            }
            const data: crearAlertaConNotificacionDTO = req.body;
            const alerta = await this.alertaService.crearAlertaYNotificar({ ...data, usuario_alta_alerta: usuarioId });
            return res.status(201).json(alerta);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    obtenerAlertasPorFecha = async (req: AuthRequest, res: Response) => {
        try {
            const { fecha_desde, fecha_hasta } = req.query as { fecha_desde: string, fecha_hasta: string };
            const alertas = await this.alertaService.obtenerAlertasPorFechas(fecha_desde, fecha_hasta)
            return res.json({
                alertas
            })

        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    obtenerAlertaPorID = async (req: AuthRequest, res: Response) => {
        try {
            const id_alerta = req.params.id_alerta as string;
            const alerta = await this.alertaService.obtenerAlertaPorID(id_alerta as string);

            if (!alerta) {
                return res.status(404).json({ error: 'Alerta no encontrada' });
            }

            return res.json(alerta);

        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    obtenerAlertasPorUsuario = async (req: AuthRequest, res: Response) => {
        try {
            const id_usuario = req.params.id_usuario as string;
            const alertas = await this.alertaService.obtenerAlertasPorUsuario(id_usuario as string);
            return res.json(alertas);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    finalizarAlerta = async (req: AuthRequest, res: Response) => {
        try {
            const id_alerta = req.params.id_alerta as string;
            const alerta = await this.alertaService.finalizarAlerta(id_alerta as string);
            return res.json(alerta);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    limpiarTodo = async (req: AuthRequest, res: Response) => {
        try {
            const resultado = await this.alertaService.limpiarTodo();
            return res.json(resultado);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}
