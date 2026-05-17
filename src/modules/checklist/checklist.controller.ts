import { Response } from 'express';
import { AuthRequest } from "../../middlewares/auth.middleware";
import { ChecklistService } from './checklist.service';
import { GuardarChecklistDTO } from './DTO/checklist_DTO';

export class ChecklistController {
    private service = new ChecklistService();

    guardarChecklist = async (req: AuthRequest, res: Response) => {
        try {
            const usuarioId = (req.user as any).id_usuario;
            if (!usuarioId) {
                return res.status(401).json({ error: 'Usuario no autenticado en el token' });
            }
            const data: GuardarChecklistDTO = req.body;
            if (!data.camionId || !data.detalles || !Array.isArray(data.detalles)) {
                return res.status(400).json({ error: 'Faltan campos requeridos: camionId, detalles[]' });
            }
            if (data.detalles.length === 0) {
                return res.status(400).json({ error: 'El array de detalles no puede estar vacío' });
            }
            for (const detalle of data.detalles) {
                if (!detalle.inventarioId || !detalle.controlado) {
                    return res.status(400).json({ error: 'Cada detalle debe tener inventarioId y controlado' });
                }
                if (detalle.controlado !== 'CHEQUEADO' && detalle.controlado !== 'FALTANTE') {
                    return res.status(400).json({ error: 'controlado debe ser CHEQUEADO o FALTANTE' });
                }
            }
            const resultado = await this.service.guardarChecklist({ ...data, usuarioId });
            return res.status(201).json(resultado);
        } catch (error: any) {
            console.error('Error al guardar checklist:', error);
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
            console.error('Error al obtener historial:', error);
            return res.status(500).json({ error: error.message });
        }
    };
}