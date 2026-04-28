import { NotificacionesRepositorio } from "./notificaciones.repository";
import { registrarTokenDTO } from "./DTO/notificaciones_DTO";

export class NotificacionesService {
    private repositorio = new NotificacionesRepositorio();

    async registrarToken(data: registrarTokenDTO) {
        return await this.repositorio.guardarToken(data);
    }

    async enviarPush(usuariosIds: string[], payload: any) {
        const tokens = await this.repositorio.obtenerTokensPorUsuarios(usuariosIds);
        
        if (!tokens || tokens.length === 0) {
            console.log('No hay tokens para enviar push');
            return null;
        }

        try {
            const response = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: tokens, // array de tokens
                    title: payload.title || 'Nueva Alerta',
                    body: payload.body || `Ubicación: ${payload.ubicacion}`,
                    sound: 'default', // Importante para iOS
                    data: { alertaId: payload.id }
                })
            });
            
            const data = await response.json();
            console.log('Respuesta de Expo Push:', data);
            return data;
        } catch (error) {
            console.error('Error enviando push notification:', error);
            return null;
        }
    }
}