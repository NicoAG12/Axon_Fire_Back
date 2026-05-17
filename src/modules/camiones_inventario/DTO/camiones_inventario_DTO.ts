export interface AgregarInventarioDTO {
    camionId: string;
    herramientaId: string;
    sectorId: string;
    cantidad: number;
}

export interface ActualizarInventarioDTO {
    cantidad?: number;
}