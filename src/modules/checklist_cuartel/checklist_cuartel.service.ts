import { ChecklistCuartelRepositorio } from "./checklist_cuartel.repository";
import { GuardarChecklistCuartelDTO } from "./DTO/checklist_cuartel_DTO";

export class ChecklistCuartelService {
    private repositorio = new ChecklistCuartelRepositorio();

    async crearChecklist(data: GuardarChecklistCuartelDTO) {
        if (!data.detalles || data.detalles.length === 0) {
            throw new Error("El array de detalles no puede estar vacío");
        }
        for (const detalle of data.detalles) {
            if (!detalle.herramientaId || !detalle.controlado) {
                throw new Error("Cada detalle debe tener herramientaId y controlado");
            }
            if (detalle.controlado !== 'CHEQUEADO' && detalle.controlado !== 'FALTANTE') {
                throw new Error("controlado debe ser CHEQUEADO o FALTANTE");
            }
            if (detalle.controlado === 'FALTANTE' && !detalle.observaciones) {
                throw new Error("Debe indicar las observaciones si falta alguna herramienta");
            }
        }
        return await this.repositorio.crearChecklist(data);
    }

    async obtenerHistorialChecklists() {
        return await this.repositorio.obtenerHistorialChecklists();
    }

    async obtenerDetalleChecklist(id: string) {
        return await this.repositorio.obtenerDetalleChecklist(id);
    }
}