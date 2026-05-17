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
        const alerta_encontrada = this.alerta_repo.buscarAlertaPorID(data.alerta_id)
        if (!alerta_encontrada) {
            throw new Error("No se encontro alerta para esta respuesta")
        }
        return await this.repo.crearRespuestaAlerta(data);
    }

    obtenerRespuestas = async (alerta_id: string) => {
        const alerta_encontrada = this.alerta_repo.buscarAlertaPorID(alerta_id)
        if (!alerta_encontrada) {
            throw new Error("No se encontro alerta")
        }
        return await this.repo.obtenerRespuestasPorAlerta(alerta_id);
    }

    obtenerRespuestaPorId = async (id: string) => {
        return await this.repo.obtenerRespuestaAlertaPorId(id);
    }



    eliminarRespuesta = async (id: string) => {
        return await this.repo.eliminarRespuestaAlerta(id);
    }

    responderAviso = async (alertaId: string, usuarioId: string, data: modificarRespuestaAlertaDTO) => {
        return await this.repo.transaccionResponderAviso(alertaId, usuarioId, data);
    }

    obtenerCantidadAsistentes = async (alertaId: string) => {
        return { cantidad: await this.repo.contarAsistenciasPorAlerta(alertaId) };
    }

}
