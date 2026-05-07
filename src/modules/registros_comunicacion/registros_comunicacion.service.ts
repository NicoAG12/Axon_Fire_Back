import { RegistrosComunicacionRepositorio } from "./registros_comunicacion.repository";
import { crearRegistroComunicacionDTO } from "./DTO/registros_comunicacion_DTO";
import { AlertaRepositorio } from "../alerta/alerta.repository";

export class RegistrosComunicacionService {
    private repo: RegistrosComunicacionRepositorio;
    private alerta_repo: AlertaRepositorio;

    constructor() {
        this.repo = new RegistrosComunicacionRepositorio();
        this.alerta_repo = new AlertaRepositorio();
    }

    crearRegistro = async (data: crearRegistroComunicacionDTO) => {
        const alerta_encontrada = await this.alerta_repo.buscarAlertaPorID(data.alerta_id);
        if (!alerta_encontrada) {
            throw new Error("No se encontro alerta");
        }
        return await this.repo.crearRegistro(data);
    }

    obtenerRegistros = async (alertaId: string) => {
        return await this.repo.obtenerRegistrosPorAlerta(alertaId);
    }

}