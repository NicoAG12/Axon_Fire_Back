import { categoria_poi } from "@prisma/client";

export interface CrearPoiDTO {
    nombre: string;
    categoria: categoria_poi;
    descripcion?: string;
    latitud: number;
    longitud: number;
}

export interface ActualizarPoiDTO extends Partial<CrearPoiDTO> { }
