export interface AgregarInventarioBolsoDTO {
    bolsoId: string;
    herramientaId: string;
    cantidad: number;
}

export interface ActualizarInventarioBolsoDTO {
    cantidad?: number;
}