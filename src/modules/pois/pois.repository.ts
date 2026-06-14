import { prisma } from "../../lib/prisma";
import { CrearPoiDTO, ActualizarPoiDTO } from "./DTO/pois_dto";
import { categoria_poi } from "@prisma/client";

const poiSelect = {
    id: true,
    categoria: true,
    nombre: true,
    descripcion: true,
    latitud: true,
    longitud: true,
    creado_por: true
} as const;

export class PoisRepository {
    async crearPoi(data: CrearPoiDTO, adminId: string) {
        return await prisma.puntos_interes.create({
            data: {
                categoria: data.categoria,
                nombre: data.nombre,
                descripcion: data.descripcion,
                latitud: data.latitud,
                longitud: data.longitud,
                creado_por: adminId
            },
            select: poiSelect
        });
    }

    async obtenerPois(categoria?: categoria_poi) {
        return await prisma.puntos_interes.findMany({
            where: {
                activo: true,
                ...(categoria && { categoria })
            },
            select: poiSelect
        });
    }

    async buscarPoiPorId(id: string) {
        return await prisma.puntos_interes.findUnique({
            where: { id },
            select: poiSelect
        });
    }

    async actualizarPoi(id: string, data: ActualizarPoiDTO) {
        return await prisma.puntos_interes.update({
            where: { id },
            data: {
                ...(data.categoria && { categoria: data.categoria }),
                ...(data.nombre && { nombre: data.nombre }),
                ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
                ...(data.latitud !== undefined && { latitud: data.latitud }),
                ...(data.longitud !== undefined && { longitud: data.longitud })
            },
            select: poiSelect
        });
    }

    async eliminarPoi(id: string) {
        return await prisma.puntos_interes.update({
            where: { id },
            data: { activo: false },
            select: poiSelect
        });
    }
}
