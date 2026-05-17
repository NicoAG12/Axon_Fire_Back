export interface CrearCamionDTO {
    nombre_camion: string;
    estado?: 'ACTIVO' | 'INACTIVO';
}

export interface ActualizarCamionDTO {
    nombre_camion?: string;
    estado?: 'ACTIVO' | 'INACTIVO';
}