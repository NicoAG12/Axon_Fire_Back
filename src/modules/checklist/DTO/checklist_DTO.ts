export interface GuardarChecklistDTO {
    camionId: string;
    usuarioId: string;
    detalles: DetalleChecklistDTO[];
}

export interface DetalleChecklistDTO {
    inventarioId: string;
    controlado: 'CHEQUEADO' | 'FALTANTE';
    observaciones?: string;
}