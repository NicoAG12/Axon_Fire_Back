import { HerramientasRepositorio } from "./herramientas.repository";
import { CrearHerramientaDTO, ActualizarHerramientaDTO } from "./DTO/herramientas_DTO";

export class HerramientasService {
    private repositorio = new HerramientasRepositorio();

    async obtenerTodos() {
        return await this.repositorio.obtenerTodos();
    }

    async obtenerPorId(id: string) {
        return await this.repositorio.obtenerPorId(id);
    }

    async crear(data: CrearHerramientaDTO) {
        return await this.repositorio.crear(data);
    }

    async actualizar(id: string, data: ActualizarHerramientaDTO) {
        return await this.repositorio.actualizar(id, data);
    }

    async eliminar(id: string) {
        return await this.repositorio.eliminar(id);
    }

    async actualizarStock(id: string, cantidad: number) {
        return await this.repositorio.actualizarStock(id, cantidad);
    }
}