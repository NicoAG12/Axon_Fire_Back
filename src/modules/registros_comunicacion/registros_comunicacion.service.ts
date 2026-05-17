import { RegistrosComunicacionRepositorio } from "./registros_comunicacion.repository";
import { crearRegistroComunicacionDTO } from "./DTO/registros_comunicacion_DTO";
import { AlertaRepositorio } from "../alerta/alerta.repository";
import { NotificacionesService } from "../notificaciones/notificaciones.service";

export class RegistrosComunicacionService {
    private repo: RegistrosComunicacionRepositorio;
    private alerta_repo: AlertaRepositorio;
    private noti_service: NotificacionesService;

    constructor() {
        this.repo = new RegistrosComunicacionRepositorio();
        this.alerta_repo = new AlertaRepositorio();
        this.noti_service = new NotificacionesService();
    }

    crearRegistro = async (data: crearRegistroComunicacionDTO) => {
        const alerta_encontrada = await this.alerta_repo.buscarAlertaPorID(data.alerta_id);
        if (!alerta_encontrada) {
            throw new Error("No se encontro alerta");
        }
        
        const registro = await this.repo.crearRegistro(data);

        // Notificar a todos los bomberos (silencioso)
        try {
            const todosLosBomberos = await this.alerta_repo.buscarTodosLosBomberosIds();
            await this.noti_service.enviarPush(todosLosBomberos, {
                id: data.alerta_id,
                title: "LOGÍSTICA / SUMINISTROS",
                body: `${data.mensaje}`,
                silent: true
            });
        } catch (e) {
            console.error("Error enviando notificacion de logistica", e);
        }

        return registro;
    }

    obtenerRegistros = async (alertaId: string) => {
        return await this.repo.obtenerRegistrosPorAlerta(alertaId);
    }

}