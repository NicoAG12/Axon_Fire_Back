import { ChecklistBolsosRepositorio } from "./checklist_bolsos.repository";
import { GuardarChecklistBolsoDTO } from "./DTO/checklist_bolsos_DTO";
import { BolsosInventarioService } from "../bolsos_inventario/bolsos_inventario.service";

export class ChecklistBolsosService {
    private repositorio = new ChecklistBolsosRepositorio();
    private inventarioService = new BolsosInventarioService();

    async guardarChecklist(data: GuardarChecklistBolsoDTO) {
        data.detalles.map((detalle) => {
            if (detalle.controlado === 'FALTANTE' && !detalle.observaciones) {
                throw new Error("Debe indicar las observaciones si falta algun elemento del bolso.");
            }
        })
        return await this.repositorio.guardarChecklist(data);
    }

    async obtenerInventarioPorBolso(bolsoId: string) {
        return await this.inventarioService.obtenerPorBolso(bolsoId);
    }

    async obtenerHistorialPorBolso(bolsoId: string) {
        return await this.repositorio.obtenerHistorialPorBolso(bolsoId);
    }
}