import { Response } from 'express';
import { AuthRequest } from "../../middlewares/auth.middleware";
import { ChecklistCuartelService } from './checklist_cuartel.service';
import { GuardarChecklistCuartelDTO } from './DTO/checklist_cuartel_DTO';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { UsuarioService } from '../users/user.service';
export class ChecklistCuartelController {
    private service = new ChecklistCuartelService();
    private notiService = new NotificacionesService();
    private userService = new UsuarioService();
    crearChecklist = async (req: AuthRequest, res: Response) => {
        try {
            const data: GuardarChecklistCuartelDTO = req.body;
            if (!data.usuarioId) {
                return res.status(400).json({ error: 'usuarioId es requerido' });
            }
            if (!data.detalles || !Array.isArray(data.detalles)) {
                return res.status(400).json({ error: 'detalles[] es requerido' });
            }
            if (data.detalles.length === 0) {
                return res.status(400).json({ error: 'El array de detalles no puede estar vacío' });
            }
            for (const detalle of data.detalles) {
                if (!detalle.herramientaId || !detalle.controlado) {
                    return res.status(400).json({ error: 'Cada detalle debe tener herramientaId y controlado' });
                }
                if (detalle.controlado !== 'CHEQUEADO' && detalle.controlado !== 'FALTANTE') {
                    return res.status(400).json({ error: 'controlado debe ser CHEQUEADO o FALTANTE' });
                }
            }
            const resultado = await this.service.crearChecklist(data);
            return res.status(201).json(resultado);
        } catch (error: any) {
            console.error('Error al crear checklist:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    obtenerHistorial = async (req: AuthRequest, res: Response) => {
        try {
            const resultado = await this.service.obtenerHistorialChecklists();
            return res.status(200).json(resultado);
        } catch (error: any) {
            console.error('Error al obtener historial:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    obtenerDetalle = async (req: AuthRequest, res: Response) => {
        try {
            const id = req.params.id as string;
            if (!id) {
                return res.status(400).json({ error: 'id es requerido' });
            }
            const resultado = await this.service.obtenerDetalleChecklist(id);
            if (!resultado) {
                return res.status(404).json({ error: 'Checklist no encontrado' });
            }
            return res.status(200).json(resultado);
        } catch (error: any) {
            console.error('Error al obtener detalle:', error);
            return res.status(500).json({ error: error.message });
        }
    };
    enviarRecordatorio = async (req: AuthRequest, res: Response) => {
        try {
            let usuariosIds: string[] = req.body.usuariosIds;

            if (!usuariosIds || !Array.isArray(usuariosIds) || usuariosIds.length === 0) {
                const bomberos = await this.userService.obtenerBomberos();
                usuariosIds = bomberos.map(b => b.usuario_id);
            }

            const resultado = await this.notiService.enviarPushCheckListSemanal(usuariosIds, {
                title: 'CONTROL SEMANAL',
                body: 'REALICE EL CONTROL SEMANAL DEL CUARTEL',
                id: 'checklist-semanal'
            });
            return res.status(201).json(resultado);
        } catch (error: any) {
            console.error('Error al enviar recordatorio:', error);
            return res.status(500).json({ error: error.message });
        }
    };
}