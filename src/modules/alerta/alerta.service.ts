import { AlertaRepositorio } from "./alerta.repository";
import { crearAlertaDTO } from "./DTO/crearAlertaDTO";

export class AlertaService {
    private alertaRepo: AlertaRepositorio;

    constructor() {
        this.alertaRepo = new AlertaRepositorio()
    }

    crearAlerta = async (data: crearAlertaDTO) => {
        const alerta = await this.alertaRepo.crearAlerta(data);
        return alerta;
    }
}