import { SectoresRepositorio } from "./sectores.repository";
import { CrearSectorDTO } from "./DTO/sectores_DTO";

export class SectoresService {
    private repositorio = new SectoresRepositorio();

    async crear(data: CrearSectorDTO) {
        return await this.repositorio.crear(data);
    }

    async obtenerPorCamion(camionId: string) {
        return await this.repositorio.obtenerPorCamion(camionId);
    }

    async obtenerPorId(id: string) {
        return await this.repositorio.obtenerPorId(id);
    }

    async eliminar(id: string) {
        return await this.repositorio.eliminar(id);
    }
}