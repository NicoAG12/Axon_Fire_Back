export interface crearRespuestaAlertaDTO {
    alerta_id: string;
    usuario_id: string;
    estado_respuesta: 'ACEPTADO' | 'RECHAZADO';
    fecha_hora: Date;
}

export interface modificarRespuestaAlertaDTO {
    estado_respuesta: 'ACEPTADO' | 'RECHAZADO',
    fecha_hora: Date;
}