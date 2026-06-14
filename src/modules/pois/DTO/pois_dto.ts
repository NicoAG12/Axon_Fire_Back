import { categoria_poi } from "@prisma/client";
import { z } from "zod";

export const crearPoiSchema = z.object({
    nombre: z.string().min(1, "El nombre no puede estar vacío"),
    categoria: z.nativeEnum(categoria_poi),
    descripcion: z.string().optional(),
    latitud: z.number().min(-90, "La latitud debe estar entre -90 y 90").max(90, "La latitud debe estar entre -90 y 90"),
    longitud: z.number().min(-180, "La longitud debe estar entre -180 y 180").max(180, "La longitud debe estar entre -180 y 180")
});

export const actualizarPoiSchema = crearPoiSchema.partial();

export type CrearPoiDTO = z.infer<typeof crearPoiSchema>;
export type ActualizarPoiDTO = z.infer<typeof actualizarPoiSchema>;
