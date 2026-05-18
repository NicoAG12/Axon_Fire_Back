export interface GuardarChecklistCuartelDTO {
    usuarioId: string;
    detalles: DetalleChecklistCuartelDTO[];
}

export interface DetalleChecklistCuartelDTO {
    herramientaId: string;
    controlado: 'CHEQUEADO' | 'FALTANTE';
    observaciones?: string;
}