import { Router } from "express";
import { ControlFluidosController } from "../modules/control_fluidos/control_fluidos.controller";
import { verificarHeaders } from "../middlewares/auth.middleware";

const router = Router();
const controller = new ControlFluidosController();

router.post("/guardar", verificarHeaders, controller.guardarControl);
router.get("/historial/:camionId", verificarHeaders, controller.obtenerHistorial);

export default router;
