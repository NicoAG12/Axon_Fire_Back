import { Response } from 'express';
import { AuthRequest } from "../../middlewares/auth.middleware";
import { ChecklistBolsosService } from './checklist_bolsos.service';
import { GuardarChecklistBolsoDTO } from './DTO/checklist_bolsos_DTO';

export class ChecklistBolsosController {
    private service = new ChecklistBolsosService();

    guardarChecklist = async (req: AuthRequest, res: Response) => {
        try {
            const usuarioId = (req.user as any).id_usuario;
            if (!usuarioId) {
                return res.status(401).json({ error: 'Usuario no autenticado en el token' });
            }
            const data: GuardarChecklistBolsoDTO = req.body;
            if (!data.bolsoId || !data.detalles || !Array.isArray(data.detalles)) {
                return res.status(400).json({ error: 'bolsoId y detalles[] son requeridos' });
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
            const bolsoId = req.params.bolsoId as string;
            if (!bolsoId) {
                return res.status(400).json({ error: 'bolsoId es requerido' });
            }
            const resultado = await this.service.obtenerHistorialPorBolso(bolsoId);
            return res.status(200).json(resultado);
        } catch (error: any) {
            console.error('Error al obtener historial:', error);
            return res.status(500).json({ error: error.message });
        }
    };
}