import { Response } from 'express';
import { AuthRequest } from "../../middlewares/auth.middleware";
import { InformesService } from './informes.service';
import { ActualizarBorradorDTO } from './DTO/informes_dto';

export class InformesController {
    private service: InformesService;

    constructor() {
        this.service = new InformesService();
    }

    generarPDF = async (req: AuthRequest, res: Response) => {
        try {
            const alertaId = req.params.alertaId as string;

            // Validar todos los datos ANTES de pipear el PDF
            // (una vez que se pipea, no se puede enviar JSON de error)
            await this.service.generarPDF(alertaId, res);

        } catch (error: any) {
            // Solo enviar error JSON si todavía no se empezó a escribir el response
            if (!res.headersSent) {
                return res.status(500).json({ error: error.message });
            }
        }
    }

    obtenerDatosInforme = async (req: AuthRequest, res: Response) => {
        try {
            const alertaId = req.params.alertaId as string;
            const datos = await this.service.obtenerDatosInforme(alertaId);
            return res.json(datos);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    obtenerBorrador = async (req: AuthRequest, res: Response) => {
        try {
            const alertaId = req.params.alertaId as string;
            const usuarioId = (req.user as any).id_usuario;

            if (!usuarioId) {
                return res.status(401).json({ error: 'Usuario no autenticado en el token' });
            }

            const borrador = await this.service.obtenerOCrearBorrador(alertaId, usuarioId);
            return res.json(borrador);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    actualizarBorrador = async (req: AuthRequest, res: Response) => {
        try {
            const alertaId = req.params.alertaId as string;
            const datos: ActualizarBorradorDTO = req.body;

            const borrador = await this.service.actualizarBorrador(alertaId, datos);
            return res.json(borrador);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}
