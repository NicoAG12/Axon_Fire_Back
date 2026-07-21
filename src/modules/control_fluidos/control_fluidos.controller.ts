import { Response } from 'express';
import { AuthRequest } from "../../middlewares/auth.middleware";
import { ControlFluidosService } from './control_fluidos.service';
import { GuardarControlFluidosDTO } from './DTO/control_fluidos_DTO';

const NIVELES_VALIDOS = ['OK', 'BAJO', 'CRITICO'];

export class ControlFluidosController {
    private service = new ControlFluidosService();

    guardarControl = async (req: AuthRequest, res: Response) => {
        try {
            const usuarioId = (req.user as any).id_usuario;
            if (!usuarioId) {
                return res.status(401).json({ error: 'Usuario no autenticado en el token' });
            }

            const { camionId, aceite_motor, liquido_refrigerante, liquido_frenos, liquido_direccion, observaciones } = req.body;

            if (!camionId) {
                return res.status(400).json({ error: 'camionId es requerido' });
            }
            if (!aceite_motor || !liquido_refrigerante || !liquido_frenos || !liquido_direccion) {
                return res.status(400).json({ error: 'Todos los campos de fluidos son requeridos: aceite_motor, liquido_refrigerante, liquido_frenos, liquido_direccion' });
            }

            for (const campo of ['aceite_motor', 'liquido_refrigerante', 'liquido_frenos', 'liquido_direccion']) {
                if (!NIVELES_VALIDOS.includes(req.body[campo])) {
                    return res.status(400).json({ error: `${campo} debe ser OK, BAJO o CRITICO` });
                }
            }

            const data: GuardarControlFluidosDTO = {
                camionId,
                usuarioId,
                aceite_motor,
                liquido_refrigerante,
                liquido_frenos,
                liquido_direccion,
                observaciones
            };

            const resultado = await this.service.guardarControl(data);
            return res.status(201).json(resultado);
        } catch (error: any) {
            console.error('Error al guardar control de fluidos:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    obtenerHistorial = async (req: AuthRequest, res: Response) => {
        try {
            const camionId = req.params.camionId as string;
            if (!camionId) {
                return res.status(400).json({ error: 'camionId es requerido' });
            }
            const resultado = await this.service.obtenerHistorialPorCamion(camionId);
            return res.status(200).json(resultado);
        } catch (error: any) {
            console.error('Error al obtener historial de fluidos:', error);
            return res.status(500).json({ error: error.message });
        }
    };
}
