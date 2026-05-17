import { CamionesRepositorio } from "./camiones.repository";
import { CrearCamionDTO, ActualizarCamionDTO } from "./DTO/camiones_DTO";

export class CamionesService {
    private repositorio = new CamionesRepositorio();

    async obtenerTodos() {
        return await this.repositorio.obtenerTodos();
    }

    async obtenerActivos() {
        return await this.repositorio.obtenerActivos();
    }

    async obtenerPorId(id: string) {
        return await this.repositorio.obtenerPorId(id);
    }

    async crear(data: CrearCamionDTO) {
        return await this.repositorio.crear(data);
    }

    async actualizar(id: string, data: ActualizarCamionDTO) {
        return await this.repositorio.actualizar(id, data);
    }

    async eliminar(id: string) {
        return await this.repositorio.eliminar(id);
    }
}