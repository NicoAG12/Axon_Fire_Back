import { Response } from 'express';
import { AuthRequest } from "../../middlewares/auth.middleware";
import { RegistrosComunicacionService } from './registros_comunicacion.service';
import { crearRegistroComunicacionDTO } from './DTO/registros_comunicacion_DTO';

export class RegistrosComunicacionController {
    private service: RegistrosComunicacionService;

    constructor() {
        this.service = new RegistrosComunicacionService();
    }

    crearRegistro = async (req: AuthRequest, res: Response) => {
        try {
            const usuarioId = (req.user as any).id_usuario;
            if (!usuarioId) {
                return res.status(401).json({ error: 'Usuario no autenticado en el token' });
            }
            const data: crearRegistroComunicacionDTO = req.body;
            const registro = await this.service.crearRegistro({ ...data, usuario_id: usuarioId });
            return res.status(201).json(registro);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    obtenerRegistrosPorAlerta = async (req: AuthRequest, res: Response) => {
        try {
            const id_alerta = req.params.id_alerta as string;
            const registros = await this.service.obtenerRegistros(id_alerta);
            return res.json(registros);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

}