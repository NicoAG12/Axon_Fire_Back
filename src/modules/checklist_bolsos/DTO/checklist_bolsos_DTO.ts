export interface GuardarChecklistBolsoDTO {
    bolsoId: string;
    usuarioId: string;
    alertaId: string;
    detalles: DetalleChecklistBolsoDTO[];
}

export interface DetalleChecklistBolsoDTO {
    inventarioId: string;
    controlado: 'CHEQUEADO' | 'FALTANTE';
    observaciones?: string;
}