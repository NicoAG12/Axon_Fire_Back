import { PoisRepository } from "./pois.repository";
import { CrearPoiDTO, ActualizarPoiDTO } from "./DTO/pois_dto";


export class PoisService {
    private repositorio = new PoisRepository();

    async crearPoi(data: CrearPoiDTO, adminId: string) {

        const latitudValida = data.latitud >= -90 && data.latitud <= 90
        const longitudValida = data.longitud >= -180 && data.longitud <= 180

        if (!latitudValida || !longitudValida) {
            throw new Error("Latitud debe estar entre -90 y 90, y longitud entre -180 y 180");
        }

        return await this.repositorio.crearPoi(data, adminId);
    }

    async obtenerPois() {
        return await this.repositorio.obtenerPois();
    }

    async actualizarPoi(id: string, data: ActualizarPoiDTO) {
        const poi = await this.repositorio.buscarPoiPorId(id);
        if (!poi) {
            throw new Error("POI no encontrado");
        }
        return await this.repositorio.actualizarPoi(id, data);
    }

    async eliminarPoi(id: string) {
        const poi = await this.repositorio.buscarPoiPorId(id);
        if (!poi) {
            throw new Error("POI no encontrado");
        }
        return await this.repositorio.eliminarPoi(id);
    }
}
