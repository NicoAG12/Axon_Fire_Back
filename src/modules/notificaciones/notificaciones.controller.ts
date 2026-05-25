import { Request, Response } from 'express';
import { NotificacionesService } from './notificaciones.service';
import { registrarTokenDTO } from './DTO/notificaciones_DTO';
import { AuthRequest } from '../../middlewares/auth.middleware';
import jsonwebtoken from 'jsonwebtoken';

export class NotificacionesController {
    private service = new NotificacionesService();

    registrarToken = async (req: AuthRequest, res: Response) => {
        try {
            const data: registrarTokenDTO = req.body;

            // Validación de identidad: el usuario_id del body debe coincidir con el JWT
            const decoded = req.user as jsonwebtoken.JwtPayload;
            const usuarioAutenticadoId = decoded?.id_usuario;

            console.log(`[registrarToken] Petición recibida. Body usuario_id: ${data.usuario_id}, JWT id_usuario: ${usuarioAutenticadoId}`);

            if (!usuarioAutenticadoId) {
                console.warn('[registrarToken] No se pudo extraer id_usuario del JWT');
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            if (data.usuario_id !== usuarioAutenticadoId) {
                console.warn(`[registrarToken] Intento de registro de token para otro usuario. Body: ${data.usuario_id}, JWT: ${usuarioAutenticadoId}`);
                return res.status(403).json({ message: 'No puede registrar tokens para otro usuario' });
            }

            const resultado = await this.service.registrarToken(data);
            console.log(`[registrarToken] Token registrado correctamente para usuario ${data.usuario_id}`);
            return res.status(201).json(resultado);
        } catch (error: any) {
            console.error('[registrarToken] Error al registrar token:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    obtenerMisTokens = async (req: AuthRequest, res: Response) => {
        try {
            const decoded = req.user as jsonwebtoken.JwtPayload;
            const usuarioAutenticadoId = decoded?.id_usuario;

            console.log(`[obtenerMisTokens] Consultando tokens para usuario: ${usuarioAutenticadoId}`);

            if (!usuarioAutenticadoId) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const tokens = await this.service.obtenerTokensPorUsuarioId(usuarioAutenticadoId);
            console.log(`[obtenerMisTokens] ${tokens.length} token(s) encontrados para usuario ${usuarioAutenticadoId}`);
            return res.status(200).json(tokens);
        } catch (error: any) {
            console.error('[obtenerMisTokens] Error al obtener tokens:', error);
            return res.status(500).json({ error: error.message });
        }
    };
}
