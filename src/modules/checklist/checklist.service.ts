import { ChecklistRepositorio } from "./checklist.repository";
import { GuardarChecklistDTO } from "./DTO/checklist_DTO";

export class ChecklistService {
    private repositorio = new ChecklistRepositorio();

    async guardarChecklist(data: GuardarChecklistDTO) {
        data.detalles.map((detalle) => {
            if (detalle.controlado === 'FALTANTE' && !detalle.observaciones) {
                throw new Error("Debe indicar las observaciones si falta algun elemento del bolso.");
            }
        })
        return await this.repositorio.guardarChecklist(data);
    }

    async obtenerHistorialPorCamion(camionId: string) {
        return await this.repositorio.obtenerHistorialPorCamion(camionId);
    }
}