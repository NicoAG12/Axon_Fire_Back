import { RespuestasAlertasRepositorio } from "./respuestas_alertas.repository";
import { crearRespuestaAlertaDTO, modificarRespuestaAlertaDTO } from "./DTO/respuestas_alertas_DTO";
import { AlertaRepositorio } from "../alerta/alerta.repository";
export class RespuestasAlertasService {
    private repo: RespuestasAlertasRepositorio;
    private alerta_repo: AlertaRepositorio;
    constructor() {
        this.repo = new RespuestasAlertasRepositorio();
        this.alerta_repo = new AlertaRepositorio();
    }

    crearRespuesta = async (data: crearRespuestaAlertaDTO) => {

        return await this.repo.crearRespuestaAlerta(data);
    }

    obtenerRespuestas = async () => {
        return await this.repo.obtenerRespuestasAlertas();
    }

    obtenerRespuestaPorId = async (id: string) => {
        return await this.repo.obtenerRespuestaAlertaPorId(id);
    }

    actualizarRespuesta = async (id: string, data: Partial<modificarRespuestaAlertaDTO>) => {
        return await this.repo.actualizarRespuestaAlerta(id, data);
    }

    eliminarRespuesta = async (id: string) => {
        return await this.repo.eliminarRespuestaAlerta(id);
    }

    responderAviso = async (alertaId: string, usuarioId: string, data: modificarRespuestaAlertaDTO) => {
        return await this.repo.transaccionResponderAviso(alertaId, usuarioId, data);
    }

}
