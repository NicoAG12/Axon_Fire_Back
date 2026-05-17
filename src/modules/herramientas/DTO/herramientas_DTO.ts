export interface CrearHerramientaDTO {
    nombre_herramienta: string;
    cantidad_disponible: number;
}

export interface ActualizarHerramientaDTO {
    nombre_herramienta?: string;
    cantidad_disponible?: number;
}