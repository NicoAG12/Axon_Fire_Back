import { Router } from "express";
import { ChecklistBolsosController } from "../modules/checklist_bolsos/checklist_bolsos.controller";
import { verificarHeaders } from "../middlewares/auth.middleware";

const router = Router();
const controller = new ChecklistBolsosController();

router.post("/bolsos/guardar", verificarHeaders, controller.guardarChecklist);
router.get("/bolsos/historial/:bolsoId", verificarHeaders, controller.obtenerHistorial);

export default router;