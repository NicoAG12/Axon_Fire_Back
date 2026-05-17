import { CamionesInventarioRepositorio } from "./camiones_inventario.repository";
import { AgregarInventarioDTO, ActualizarInventarioDTO } from "./DTO/camiones_inventario_DTO";
import { HerramientasRepositorio } from "../herramientas/herramientas.repository";

interface InventarioItem {
    inventarioId: string;
    herramienta: string;
    cantidad: number;
}

export type InventarioAgrupado = Record<string, InventarioItem[]>;

export class CamionesInventarioService {
    private repositorio = new CamionesInventarioRepositorio();
    private herramientasRepositorio = new HerramientasRepositorio();

    async agregarInventario(data: AgregarInventarioDTO) {
        const herramienta = await this.herramientasRepositorio.obtenerPorId(data.herramientaId);
        if (!herramienta) {
            throw new Error("Herramienta no encontrada");
        }
        if (herramienta.cantidad_disponible < data.cantidad) {
            throw new Error("No hay suficiente stock");
        }
        return await this.repositorio.agregarInventario(data);
    }

    async obtenerPorCamion(camionId: string) {
        return await this.repositorio.obtenerPorCamion(camionId);
    }

    async obtenerPorCamionAgrupado(camionId: string): Promise<InventarioAgrupado> {
        const inventarios = await this.repositorio.obtenerPorCamion(camionId);
        const agrupado: InventarioAgrupado = {};

        for (const item of inventarios) {
            const nombreSector = item.sectorId.nombre_sector;
            if (!agrupado[nombreSector]) {
                agrupado[nombreSector] = [];
            }
            agrupado[nombreSector].push({
                inventarioId: item.id,
                herramienta: item.herramientaId.nombre_herramienta,
                cantidad: item.cantidad_herramienta
            });
        }

        return agrupado;
    }

    async obtenerPorId(id: string) {
        return await this.repositorio.obtenerPorId(id);
    }

    async actualizar(id: string, data: ActualizarInventarioDTO) {
        return await this.repositorio.actualizar(id, data);
    }

    async eliminar(id: string) {
        return await this.repositorio.eliminar(id);
    }

    async eliminarPorCamion(camionId: string) {
        return await this.repositorio.eliminarPorCamion(camionId);
    }
}