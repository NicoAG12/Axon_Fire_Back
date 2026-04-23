export interface crearAlertaDTO {
    sub_categoria_alerta_id: string;
    ubicacion: string;
    observaciones: string;
    fecha_hora: Date;
    estado_alerta_id: string;
    usuario_alta_alerta: string;
}

export interface crearAlertaConNotificacionDTO {
    sub_categoria_alerta_id: string;
    ubicacion: string;
    observaciones: string;
    usuario_alta_alerta: string;
    destinatariosIds?: string[];
}
