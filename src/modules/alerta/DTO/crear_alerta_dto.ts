export interface crearAlertaDTO {
    sub_categoria_alerta_id: string;
    ubicacion: string;
    latitud: number;
    longitud: number;
    observaciones: string;
    fecha_hora: Date | string;
    estado_alerta_id: string;
    prioridad?: 'ALTA' | 'MEDIA' | 'BAJA';
    usuario_alta_alerta: string;
}

export interface crearAlertaConNotificacionDTO {
    sub_categoria_alerta_id: string;
    ubicacion: string;
    latitud: number;
    longitud: number;
    observaciones: string;
    prioridad?: 'ALTA' | 'MEDIA' | 'BAJA';
    usuario_alta_alerta: string;
    destinatariosIds?: string[];
    auto_asistir?: boolean;
}
