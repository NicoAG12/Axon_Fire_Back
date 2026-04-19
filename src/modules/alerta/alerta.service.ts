import { AlertaRepositorio } from "./alerta.repository";
import { crearAlertaDTO } from "./DTO/crear_alerta_dto";

export class AlertaService {
    private alertaRepo: AlertaRepositorio;

    constructor() {
        this.alertaRepo = new AlertaRepositorio()
    }


    crearAlerta = async (data: crearAlertaDTO) => {
        const alerta = await this.alertaRepo.crearAlerta(data);
        return alerta;
    }

    obtenerAlertasPorFechas = async (fecha_desde: string, fecha_hasta: string) => {
        const alertas = await this.alertaRepo.buscarAlertaPorFecha(fecha_desde, fecha_hasta)
        return alertas
    }
    obtenerAlertaPorID = async (alerta_id: string) => {
        const alerta = await this.alertaRepo.buscarAlertaPorID(alerta_id)
        return alerta
    }
}