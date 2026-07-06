import { MantenimientoHerramientasRepositorio } from "./mantenimiento_herramientas.repository";
import { GuardarMantenimientoHerramientaDTO } from "./DTO/mantenimiento_herramientas_DTO";

const NIVELES_ACEITE = ['OK', 'BAJO', 'CRITICO'];
const ESTADOS_MANGUERAS = ['OK', 'DANADO'];
const PRESIONES = ['OK', 'DESVIACION'];
const ESTADOS_LIMPIEZA = ['OK', 'REQUIERE_LIMPIEZA'];

export class MantenimientoHerramientasService {
    private repositorio = new MantenimientoHerramientasRepositorio();

    async guardarMantenimiento(data: GuardarMantenimientoHerramientaDTO) {
        if (!NIVELES_ACEITE.includes(data.nivel_aceite)) {
            throw new Error('nivel_aceite debe ser OK, BAJO o CRITICO');
        }
        if (!ESTADOS_MANGUERAS.includes(data.estado_mangueras)) {
            throw new Error('estado_mangueras debe ser OK o DANADO');
        }
        if (!PRESIONES.includes(data.presion_trabajo)) {
            throw new Error('presion_trabajo debe ser OK o DESVIACION');
        }
        if (!ESTADOS_LIMPIEZA.includes(data.estado_limpieza)) {
            throw new Error('estado_limpieza debe ser OK o REQUIERE_LIMPIEZA');
        }
        return await this.repositorio.guardarMantenimiento(data);
    }

    async obtenerHistorialPorHerramienta(herramientaId: string) {
        return await this.repositorio.obtenerHistorialPorHerramienta(herramientaId);
    }
}
