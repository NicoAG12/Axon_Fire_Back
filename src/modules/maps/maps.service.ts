import { MapsRepository } from "./maps.repository";

export class MapsService {
    private repo = new MapsRepository();

    getConfig() {
        const latitud = parseFloat(process.env.CUARTEL_LAT || '0');
        const longitud = parseFloat(process.env.CUARTEL_LNG || '0');

        if (latitud === 0 && longitud === 0) {
            throw new Error('Coordenadas del cuartel no configuradas en variables de entorno');
        }

        return { latitud, longitud };
    }

    async getIncident(id: string) {
        const alerta = await this.repo.buscarAlertaPorId(id);

        if (!alerta) {
            throw new Error('INCIDENT_NOT_FOUND');
        }

        if (alerta.latitud === null || alerta.longitud === null) {
            throw new Error('INCIDENT_NO_COORDS');
        }

        return {
            latitud: alerta.latitud,
            longitud: alerta.longitud,
            tipo_emergencia: alerta.subCategoriaAlerta.nombre_sub_categoria,
            direccion_exacta: alerta.ubicacion,
            nivel_prioridad: alerta.prioridad
        };
    }
}
