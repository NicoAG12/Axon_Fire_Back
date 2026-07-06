export interface GuardarMantenimientoHerramientaDTO {
    herramientaId: string;
    usuarioId: string;
    nivel_aceite: 'OK' | 'BAJO' | 'CRITICO';
    estado_mangueras: 'OK' | 'DANADO';
    presion_trabajo: 'OK' | 'DESVIACION';
    estado_limpieza: 'OK' | 'REQUIERE_LIMPIEZA';
    observaciones?: string;
}
