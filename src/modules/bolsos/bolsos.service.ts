import { BolsosRepositorio } from "./bolsos.repository";
import { CrearBolsoDTO, ActualizarBolsoDTO } from "./DTO/bolsos_DTO";

export class BolsosService {
    private repositorio = new BolsosRepositorio();

    async obtenerTodos() {
        return await this.repositorio.obtenerTodos();
    }

    async obtenerPorId(id: string) {
        return await this.repositorio.obtenerPorId(id);
    }

    async crear(data: CrearBolsoDTO) {
        return await this.repositorio.crear(data);
    }

    async actualizar(id: string, data: ActualizarBolsoDTO) {
        return await this.repositorio.actualizar(id, data);
    }

    async eliminar(id: string) {
        return await this.repositorio.eliminar(id);
    }
}