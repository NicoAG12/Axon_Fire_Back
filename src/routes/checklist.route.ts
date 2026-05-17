import { Router } from "express";
import { ChecklistController } from "../modules/checklist/checklist.controller";
import { verificarHeaders } from "../middlewares/auth.middleware";

const router = Router();
const controller = new ChecklistController();

router.post("/guardar", verificarHeaders, controller.guardarChecklist);
router.get("/historial/:camionId", verificarHeaders, controller.obtenerHistorial);

export default router;