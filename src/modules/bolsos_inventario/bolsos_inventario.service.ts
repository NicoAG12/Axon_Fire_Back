import { BolsosInventarioRepositorio } from "./bolsos_inventario.repository";
import { AgregarInventarioBolsoDTO, ActualizarInventarioBolsoDTO } from "./DTO/bolsos_inventario_DTO";
import { HerramientasRepositorio } from "../herramientas/herramientas.repository";

export class BolsosInventarioService {
    private repositorio = new BolsosInventarioRepositorio();
    private herramientasRepositorio = new HerramientasRepositorio();

    async agregarInventario(data: AgregarInventarioBolsoDTO) {
        const herramienta = await this.herramientasRepositorio.obtenerPorId(data.herramientaId);
        if (!herramienta) {
            throw new Error("Herramienta no encontrada");
        }
        if (herramienta.cantidad_disponible < data.cantidad) {
            throw new Error("No hay suficiente stock");
        }
        return await this.repositorio.agregarInventario(data);
    }

    async obtenerPorBolso(bolsoId: string) {
        return await this.repositorio.obtenerPorBolso(bolsoId);
    }

    async obtenerPorId(id: string) {
        return await this.repositorio.obtenerPorId(id);
    }

    async actualizar(id: string, data: ActualizarInventarioBolsoDTO) {
        return await this.repositorio.actualizar(id, data);
    }

    async eliminar(id: string) {
        return await this.repositorio.eliminar(id);
    }
}