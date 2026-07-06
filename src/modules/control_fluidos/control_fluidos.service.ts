import { ControlFluidosRepositorio } from "./control_fluidos.repository";
import { GuardarControlFluidosDTO } from "./DTO/control_fluidos_DTO";

const NIVELES_VALIDOS = ['OK', 'BAJO', 'CRITICO'];
const CAMPOS_REQUERIDOS = ['aceite_motor', 'liquido_refrigerante', 'liquido_frenos', 'liquido_direccion'];

export class ControlFluidosService {
    private repositorio = new ControlFluidosRepositorio();

    async guardarControl(data: GuardarControlFluidosDTO) {
        for (const campo of CAMPOS_REQUERIDOS) {
            if (!NIVELES_VALIDOS.includes((data as any)[campo])) {
                throw new Error(`${campo} debe ser OK, BAJO o CRITICO`);
            }
        }
        return await this.repositorio.guardarControl(data);
    }

    async obtenerHistorialPorCamion(camionId: string) {
        return await this.repositorio.obtenerHistorialPorCamion(camionId);
    }
}
