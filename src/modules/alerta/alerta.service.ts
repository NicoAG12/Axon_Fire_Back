import { AlertaRepositorio } from "./alerta.repository";
import { crearAlertaDTO, crearAlertaConNotificacionDTO } from "./DTO/crear_alerta_dto";
import { NotificacionesService } from "../notificaciones/notificaciones.service";
import { getLocalDate, formatToARTString } from "../../lib/utils";

export class AlertaService {
    private alertaRepo: AlertaRepositorio;
    private notiService: NotificacionesService;

    constructor() {
        this.alertaRepo = new AlertaRepositorio()
        this.notiService = new NotificacionesService()
    }


    crearAlerta = async (data: crearAlertaDTO) => {
        const alerta = await this.alertaRepo.crearAlerta(data);
        return alerta;
    }

    crearAlertaYNotificar = async (data: crearAlertaConNotificacionDTO) => {
        let idsNotificar = data.destinatariosIds;

        if (!idsNotificar || idsNotificar.length === 0) {
            idsNotificar = await this.alertaRepo.buscarTodosLosBomberosIds();
        }

        const estadoInicial = await this.alertaRepo.buscarEstadoPorNombre('PENDIENTE');
        if (!estadoInicial) throw new Error("Estado inicial no configurado en DB");

        // Fallback for missing subcategory (e.g. from PedidosSuministroScreen)
        if (!data.sub_categoria_alerta_id) {
            data.sub_categoria_alerta_id = '3'; // Default to OTRO TIPO
        }

        const creatorId = data.usuario_alta_alerta;
        const idsSinCreador = idsNotificar.filter(id => id !== creatorId);
        const estadoCreador = data.auto_asistir === true ? 'ACEPTADO' : 'PENDIENTE';

        const nuevaAlerta = await this.alertaRepo.crearAlertaCompletaTx(
            data,
            idsSinCreador,
            estadoInicial.id,
            creatorId,
            estadoCreador
        );

        this.notiService.enviarPush(idsSinCreador, nuevaAlerta).catch(console.error);

        return nuevaAlerta;
    }

    obtenerAlertasPorFechas = async (fecha_desde: string, fecha_hasta: string) => {
        const alertas = await this.alertaRepo.buscarAlertaPorFecha(fecha_desde, fecha_hasta)
        return alertas
    }
    obtenerAlertaPorID = async (alerta_id: string) => {
        const alerta = await this.alertaRepo.buscarAlertaPorID(alerta_id)
        return alerta
    }

    obtenerAlertasPorUsuario = async (usuario_id: string) => {
        return await this.alertaRepo.buscarAlertaPorUsuario(usuario_id)
    }

    finalizarAlerta = async (alertaId: string) => {
        const estadoFinalizado = await this.alertaRepo.buscarEstadoPorNombre('FINALIZADO');
        if (!estadoFinalizado) throw new Error("Estado FINALIZADO no configurado en DB");
        const alertaActual = await this.alertaRepo.buscarAlertaPorID(alertaId)
        if (!alertaActual) throw new Error("No se encuentra la alerta")
        const fecha_hora_finalizacion = getLocalDate()
        const duracion = fecha_hora_finalizacion.getTime() - alertaActual.fecha_hora.getTime()
        const alertaActualizada = await this.alertaRepo.actualizarEstadoAlerta(alertaId, estadoFinalizado.id, fecha_hora_finalizacion, duracion);

        return {
            ...alertaActualizada,
            fecha_hora: formatToARTString(alertaActualizada.fecha_hora),
            fecha_hora_finalizacion: formatToARTString(alertaActualizada.fecha_hora_finalizacion),
        };
    }

    limpiarTodo = async () => {
        return await this.alertaRepo.limpiarTodo();
    }
}