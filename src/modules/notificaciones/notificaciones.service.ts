import { NotificacionesRepositorio } from "./notificaciones.repository";
import { registrarTokenDTO } from "./DTO/notificaciones_DTO";

export class NotificacionesService {
    private repositorio = new NotificacionesRepositorio();

    async registrarToken(data: registrarTokenDTO) {
        return await this.repositorio.guardarToken(data);
    }

    async enviarPush(usuariosIds: string[], payload: any) {
        const tokens = await this.repositorio.obtenerTokensPorUsuarios(usuariosIds);
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: tokens, // array de tokens
                title: payload.title || 'Nueva Alerta',
                body: payload.body || `Ubicación: ${payload.ubicacion}`,
                data: { alertaId: payload.id }
            })
        });
        return response.json();
    }
}